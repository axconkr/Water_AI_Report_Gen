import { GoogleGenerativeAI } from '@google/generative-ai'

const apiKey = process.env.GEMINI_API_KEY
if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not set')
}

const genAI = new GoogleGenerativeAI(apiKey)

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

/**
 * Analyze document structure and extract table of contents
 */
export const analyzeDocument = async (text: string): Promise<DocumentAnalysis> => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
다음 문서를 분석하여 아래 JSON 스키마에 맞춰 결과를 반환해주세요.

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
${text.substring(0, 50000)}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response (remove markdown code blocks if present)
    let jsonText = response.trim()

    // Remove markdown code blocks
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
      console.error('Response text:', response)

      // Fallback: Create a basic analysis structure
      parsedAnalysis = {
        tableOfContents: [],
        summary: response.substring(0, 500), // First 500 chars as summary
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
      tokensUsed: Math.floor(text.length / 4), // Rough estimate
    }

    return analysis
  } catch (error) {
    console.error('Gemini analysis error:', error)
    throw new Error('문서 분석 중 오류가 발생했습니다')
  }
}

/**
 * Generate content based on prompt and context
 */
export const generateContent = async (prompt: string, context?: string): Promise<string> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    const fullPrompt = context
      ? `다음 컨텍스트를 참고하여 요청사항을 처리해주세요:\n\n컨텍스트:\n${context}\n\n요청사항:\n${prompt}`
      : prompt

    const result = await model.generateContent(fullPrompt)
    const response = result.response.text()

    return response
  } catch (error) {
    console.error('Gemini generation error:', error)
    throw new Error('콘텐츠 생성 중 오류가 발생했습니다')
  }
}

/**
 * Extract structured data from document
 */
export const extractStructuredData = async (text: string, schema: string): Promise<any> => {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    })

    const prompt = `
다음 문서에서 요청된 스키마에 맞는 구조화된 데이터를 추출하여 JSON으로 반환해주세요.

**중요**: 반드시 유효한 JSON 형식으로만 응답하세요. 추가 설명이나 텍스트는 포함하지 마세요.

스키마:
${schema}

문서 내용:
${text.substring(0, 50000)}
`

    const result = await model.generateContent(prompt)
    const response = result.response.text()

    // Extract JSON from response
    let jsonText = response.trim()
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '')
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '')
    }

    return JSON.parse(jsonText)
  } catch (error) {
    console.error('Gemini extraction error:', error)
    throw new Error('데이터 추출 중 오류가 발생했습니다')
  }
}
