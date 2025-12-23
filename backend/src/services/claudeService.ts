import Anthropic from '@anthropic-ai/sdk'

const apiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY
if (!apiKey) {
  console.error('❌ ANTHROPIC_API_KEY or CLAUDE_API_KEY is not set in environment variables')
  throw new Error(
    'ANTHROPIC_API_KEY or CLAUDE_API_KEY is not configured. Please set it in .env file'
  )
}

console.log('✅ Claude API initialized with key:', apiKey.substring(0, 10) + '...')
const anthropic = new Anthropic({
  apiKey,
})

export interface DocumentAnalysis {
  tableOfContents: {
    level: number
    title: string
    pageNumber?: number
  }[]
  summary: string
  keyTopics: string[]
  documentType: string
  metadata: {
    estimatedPages?: number
    estimatedWords?: number
    language: string
  }
  // For database storage
  extractedInfo?: any
  keywords?: string[]
  confidenceScore?: number
  tokensUsed?: number
}

export interface ContentGenerationOptions {
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

/**
 * Analyze document structure and extract table of contents using Claude
 */
export const analyzeDocument = async (text: string): Promise<DocumentAnalysis> => {
  try {
    console.log('🔍 Starting Claude document analysis...')

    const prompt = `다음 문서를 분석하여 JSON 형식으로 결과를 반환해주세요.

**중요**: 반드시 유효한 JSON 형식으로만 응답하세요. 추가 설명이나 텍스트는 포함하지 마세요.

JSON 스키마:
{
  "tableOfContents": [
    {"level": number, "title": string, "pageNumber": number}
  ],
  "summary": string,
  "keyTopics": [string],
  "documentType": string,
  "metadata": {
    "estimatedPages": number,
    "estimatedWords": number,
    "language": string
  }
}

요구사항:
1. tableOfContents: 문서의 계층적 목차 구조 (level 1-4)
2. summary: 문서 핵심 내용을 3-5문장으로 요약
3. keyTopics: 핵심 주제 5-10개
4. documentType: 문서 유형 (보고서, 제안서, 계획서, 기술문서, 공고문 등)
5. metadata: 추정 페이지 수, 단어 수, 언어

문서 내용:
${text.substring(0, 100000)}`

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.3,
      system: '당신은 문서 분석 전문가입니다. 문서를 분석하여 구조화된 JSON 데이터를 생성합니다.',
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format from Claude')
    }

    // Extract JSON from response
    let jsonText = content.text.trim()

    // Remove markdown code blocks if present
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/^```json\n?/g, '').replace(/\n?```$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```\n?/g, '').replace(/\n?```$/g, '')
    }

    // Try to find JSON object if response contains additional text
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    let parsedAnalysis
    try {
      parsedAnalysis = JSON.parse(jsonText)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Response text:', content.text)

      // Fallback: Create a basic analysis structure
      parsedAnalysis = {
        tableOfContents: [],
        summary: content.text.substring(0, 500), // First 500 chars as summary
        keyTopics: [],
        documentType: '분석 실패',
        metadata: {
          language: 'ko',
        },
      }
    }

    // Transform to match database schema
    const analysis: DocumentAnalysis = {
      ...parsedAnalysis,
      extractedInfo: {
        tableOfContents: parsedAnalysis.tableOfContents,
        summary: parsedAnalysis.summary,
        metadata: parsedAnalysis.metadata,
      },
      keywords: parsedAnalysis.keyTopics || [],
      confidenceScore: 0.95,
      tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
    }

    console.log('✅ Claude document analysis completed')
    console.log(`📊 Tokens used: ${analysis.tokensUsed}`)

    return analysis
  } catch (error: any) {
    console.error('❌ Claude analysis error:', error)
    console.error('Error message:', error.message)

    throw new Error('문서 분석 중 오류가 발생했습니다: ' + error.message)
  }
}

/**
 * Generate professional content using Claude
 */
export const generateContent = async (
  prompt: string,
  context?: string,
  options: ContentGenerationOptions = {}
): Promise<string> => {
  try {
    const { maxTokens = 4096, temperature = 0.7, systemPrompt } = options

    const messages: Anthropic.MessageParam[] = []

    if (context) {
      messages.push({
        role: 'user',
        content: `다음은 참고할 컨텍스트입니다:\n\n${context}`,
      })
      messages.push({
        role: 'assistant',
        content: '컨텍스트를 확인했습니다. 요청사항을 말씀해주세요.',
      })
    }

    messages.push({
      role: 'user',
      content: prompt,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || '당신은 전문적인 한국어 문서 작성 전문가입니다.',
      messages,
    })

    const content = message.content[0]
    if (content.type === 'text') {
      return content.text
    }

    throw new Error('Unexpected response format')
  } catch (error) {
    console.error('Claude generation error:', error)
    throw new Error('문서 생성 중 오류가 발생했습니다')
  }
}

/**
 * Generate section content for a report
 */
export const generateSectionContent = async (
  sectionTitle: string,
  sectionDescription: string,
  documentContext: string
): Promise<string> => {
  const prompt = `
다음 조건에 맞는 보고서 섹션을 작성해주세요:

섹션 제목: ${sectionTitle}
섹션 설명: ${sectionDescription}

요구사항:
1. 전문적이고 공식적인 문체를 사용하세요
2. 논리적이고 체계적인 구조로 작성하세요
3. 구체적인 내용과 예시를 포함하세요
4. 적절한 분량(500-1000단어)으로 작성하세요

참고 문서의 내용과 스타일을 반영하여 작성해주세요.
`

  return generateContent(prompt, documentContext, {
    maxTokens: 8192,
    temperature: 0.7,
    systemPrompt:
      '당신은 공공기관 및 기업의 공식 보고서를 작성하는 전문 작가입니다. 정확하고 전문적인 문서를 작성합니다.',
  })
}

/**
 * Improve existing content
 */
export const improveContent = async (
  content: string,
  improvementType: 'grammar' | 'clarity' | 'professional' | 'concise'
): Promise<string> => {
  const improvements = {
    grammar: '문법과 맞춤법을 교정하고 자연스러운 표현으로 개선',
    clarity: '더 명확하고 이해하기 쉽게 재작성',
    professional: '더 전문적이고 공식적인 문체로 개선',
    concise: '핵심 내용은 유지하면서 더 간결하게 재작성',
  }

  const prompt = `
다음 텍스트를 ${improvements[improvementType]}해주세요:

${content}

개선된 버전만 출력해주세요 (부가 설명 없이).
`

  return generateContent(prompt, undefined, {
    maxTokens: 4096,
    temperature: 0.5,
  })
}

/**
 * Interactive chat for document editing
 */
export const chat = async (
  userMessage: string,
  conversationHistory: Anthropic.MessageParam[],
  documentContext?: string
): Promise<{ response: string; updatedHistory: Anthropic.MessageParam[] }> => {
  try {
    const messages: Anthropic.MessageParam[] = [...conversationHistory]

    if (documentContext && messages.length === 0) {
      messages.push({
        role: 'user',
        content: `현재 작업 중인 문서:\n\n${documentContext.substring(0, 10000)}`,
      })
      messages.push({
        role: 'assistant',
        content: '문서를 확인했습니다. 어떻게 도와드릴까요?',
      })
    }

    messages.push({
      role: 'user',
      content: userMessage,
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      temperature: 0.7,
      system:
        '당신은 문서 작성을 돕는 AI 어시스턴트입니다. 사용자의 질문에 친절하고 전문적으로 답변하며, 문서 개선을 위한 구체적인 제안을 제공합니다.',
      messages,
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response format')
    }

    const updatedHistory: Anthropic.MessageParam[] = [
      ...messages,
      {
        role: 'assistant',
        content: content.text,
      },
    ]

    return {
      response: content.text,
      updatedHistory,
    }
  } catch (error) {
    console.error('Claude chat error:', error)
    throw new Error('대화 처리 중 오류가 발생했습니다')
  }
}
