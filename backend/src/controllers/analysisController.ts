import { Request, Response } from 'express'
import prisma from '../config/database'
import { analyzeDocument as analyzeDocumentGemini } from '../services/geminiService'
import { analyzeDocument as analyzeDocumentClaude } from '../services/claudeService'
import { parseDocument } from '../utils/fileParser'
import fs from 'fs'
import path from 'path'

// AI provider selection: 'gemini' or 'claude'
const AI_PROVIDER = process.env.AI_PROVIDER || 'claude'

const analyzeDocument = AI_PROVIDER === 'claude' ? analyzeDocumentClaude : analyzeDocumentGemini

export const analyzeDocumentById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다',
        },
      })
      return
    }

    const { documentId } = req.params

    // Find document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!document || document.project.userId !== req.user.id) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: '문서를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    // If no extracted text, try to parse the file now
    let documentText = document.extractedText

    if (!documentText) {
      try {
        const filePath = path.join(process.cwd(), document.fileUrl)

        if (!fs.existsSync(filePath)) {
          res.status(400).json({
            success: false,
            error: {
              code: 'FILE_NOT_FOUND',
              message: '문서 파일을 찾을 수 없습니다',
            },
          })
          return
        }

        const fileBuffer = fs.readFileSync(filePath)
        const mimeType =
          document.fileType.toLowerCase() === 'pdf'
            ? 'application/pdf'
            : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        const parsedContent = await parseDocument(fileBuffer, mimeType)
        documentText = parsedContent.text

        // Update document with extracted text
        await prisma.document.update({
          where: { id: documentId },
          data: {
            extractedText: documentText,
            metadata: {
              pages: parsedContent.metadata.pages,
              wordCount: parsedContent.metadata.wordCount,
              charCount: parsedContent.metadata.charCount,
            },
          },
        })
      } catch (parseError) {
        console.error('Document parsing error:', parseError)
        res.status(400).json({
          success: false,
          error: {
            code: 'PARSE_ERROR',
            message: '문서에서 텍스트를 추출할 수 없습니다',
          },
        })
        return
      }
    }

    if (!documentText || documentText.trim().length === 0) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_TEXT_CONTENT',
          message: '문서에 텍스트 내용이 없습니다',
        },
      })
      return
    }

    // Check if analysis already exists
    const existingAnalysis = await prisma.documentAnalysis.findFirst({
      where: {
        documentId,
      },
    })

    if (existingAnalysis) {
      res.status(200).json({
        success: true,
        data: { analysis: existingAnalysis },
        message: '저장된 분석 결과를 반환합니다',
      })
      return
    }

    // Perform AI analysis
    console.log(`🤖 Starting AI document analysis with ${AI_PROVIDER.toUpperCase()}...`)
    console.log(`📄 Document text length: ${documentText.length} characters`)

    const analysis = await analyzeDocument(documentText)
    console.log(`✅ AI analysis completed successfully with ${AI_PROVIDER.toUpperCase()}`)

    // Save analysis to database
    console.log('💾 Saving analysis to database...')
    const savedAnalysis = await prisma.documentAnalysis.create({
      data: {
        documentId,
        analysisType: analysis.documentType,
        extractedInfo: analysis.extractedInfo as any,
        keywords: analysis.keywords || [],
        confidenceScore: analysis.confidenceScore || null,
        aiProvider: AI_PROVIDER,
        tokensUsed: analysis.tokensUsed || null,
      },
    })

    res.status(201).json({
      success: true,
      data: { analysis: savedAnalysis },
      message: '문서 분석이 완료되었습니다',
    })
  } catch (error: any) {
    console.error('❌ Analyze document error:', error)
    console.error('Error stack:', error.stack)
    console.error('Error message:', error.message)

    // Detailed error response
    const errorMessage = error.message || '문서 분석 중 오류가 발생했습니다'
    const errorCode = error.code || 'INTERNAL_SERVER_ERROR'

    res.status(500).json({
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
    })
  }
}

export const getDocumentAnalysis = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증이 필요합니다',
        },
      })
      return
    }

    const { documentId } = req.params

    // Find document and verify ownership
    const document = await prisma.document.findFirst({
      where: {
        id: documentId,
      },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!document || document.project.userId !== req.user.id) {
      res.status(404).json({
        success: false,
        error: {
          code: 'DOCUMENT_NOT_FOUND',
          message: '문서를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    const analysis = await prisma.documentAnalysis.findFirst({
      where: {
        documentId,
      },
    })

    if (!analysis) {
      res.status(404).json({
        success: false,
        error: {
          code: 'ANALYSIS_NOT_FOUND',
          message: '분석 결과를 찾을 수 없습니다. 먼저 문서를 분석해주세요',
        },
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { analysis },
    })
  } catch (error) {
    console.error('Get document analysis error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '분석 결과 조회 중 오류가 발생했습니다',
      },
    })
  }
}
