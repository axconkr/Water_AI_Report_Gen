import { Request, Response } from 'express'
import prisma from '../config/database'
import { analyzeDocument } from '../services/geminiService'
import { parseDocument } from '../utils/fileParser'
import fs from 'fs'
import path from 'path'

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
    const analysis = await analyzeDocument(documentText)

    // Save analysis to database
    const savedAnalysis = await prisma.documentAnalysis.create({
      data: {
        documentId,
        analysisType: analysis.documentType,
        extractedInfo: analysis.extractedInfo as any,
        keywords: analysis.keywords || [],
        confidenceScore: analysis.confidenceScore || null,
        aiProvider: 'gemini',
        tokensUsed: analysis.tokensUsed || null,
      },
    })

    res.status(201).json({
      success: true,
      data: { analysis: savedAnalysis },
      message: '문서 분석이 완료되었습니다',
    })
  } catch (error) {
    console.error('Analyze document error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '문서 분석 중 오류가 발생했습니다',
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
