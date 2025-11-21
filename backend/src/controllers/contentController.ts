import { Request, Response } from 'express'
import prisma from '../config/database'
import {
  generateSectionContent,
  improveContent,
  chat as claudeChat,
} from '../services/claudeService'
import { Prisma } from '@prisma/client'
import { exportAsDocx, exportAsPdf, exportAsTxt } from '../utils/documentExporter'

export const generateContent = async (req: Request, res: Response): Promise<void> => {
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

    const { projectId, sectionId, sectionTitle, sectionDescription } = req.body

    if (!projectId || !sectionTitle) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '프로젝트 ID와 섹션 제목이 필요합니다',
        },
      })
      return
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
      include: {
        documents: {
          select: {
            extractedText: true,
          },
        },
      },
    })

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: '프로젝트를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    // Combine all document texts as context
    const documentContext = project.documents
      .map((doc) => doc.extractedText)
      .filter((text) => text)
      .join('\n\n')

    // Generate content using Claude
    const generatedText = await generateSectionContent(
      sectionTitle,
      sectionDescription || '',
      documentContext
    )

    // Save generated content to database
    const generatedContent = await prisma.generatedContent.create({
      data: {
        projectId,
        sectionId: sectionId || null,
        title: sectionTitle,
        content: generatedText,
        aiProvider: 'claude-sonnet-4-5',
        version: 1,
      },
    })

    res.status(201).json({
      success: true,
      data: { content: generatedContent },
      message: '콘텐츠가 생성되었습니다',
    })
  } catch (error) {
    console.error('Generate content error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '콘텐츠 생성 중 오류가 발생했습니다',
      },
    })
  }
}

export const improveGeneratedContent = async (req: Request, res: Response): Promise<void> => {
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

    const { contentId } = req.params
    const { improvementType } = req.body

    if (
      !improvementType ||
      !['grammar', 'clarity', 'professional', 'concise'].includes(improvementType)
    ) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '유효한 개선 유형을 선택해주세요 (grammar, clarity, professional, concise)',
        },
      })
      return
    }

    // Find content and verify ownership
    const content = await prisma.generatedContent.findFirst({
      where: {
        id: contentId,
      },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!content || content.project.userId !== req.user.id) {
      res.status(404).json({
        success: false,
        error: {
          code: 'CONTENT_NOT_FOUND',
          message: '콘텐츠를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    // Improve content using Claude
    const improvedText = await improveContent(content.content, improvementType)

    // Create new version
    const newVersion = await prisma.generatedContent.create({
      data: {
        projectId: content.projectId,
        sectionId: content.sectionId,
        title: content.title,
        content: improvedText,
        version: content.version + 1,
      } as any,
    })

    res.status(201).json({
      success: true,
      data: { content: newVersion },
      message: '콘텐츠가 개선되었습니다',
    })
  } catch (error) {
    console.error('Improve content error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '콘텐츠 개선 중 오류가 발생했습니다',
      },
    })
  }
}

export const getGeneratedContents = async (req: Request, res: Response): Promise<void> => {
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

    const { projectId } = req.params

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    })

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: '프로젝트를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    const contents = await prisma.generatedContent.findMany({
      where: {
        projectId,
      },
      orderBy: [{ title: 'asc' }, { version: 'desc' }],
    })

    // Group by title and return latest version of each
    const latestContents = contents.reduce(
      (acc, content) => {
        if (!acc[content.title] || acc[content.title].version < content.version) {
          acc[content.title] = content
        }
        return acc
      },
      {} as Record<string, (typeof contents)[0]>
    )

    res.status(200).json({
      success: true,
      data: { contents: Object.values(latestContents) },
    })
  } catch (error) {
    console.error('Get generated contents error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '콘텐츠 조회 중 오류가 발생했습니다',
      },
    })
  }
}

export const chat = async (req: Request, res: Response): Promise<void> => {
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

    const { projectId, message, conversationId } = req.body

    if (!projectId || !message) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '프로젝트 ID와 메시지가 필요합니다',
        },
      })
      return
    }

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
      include: {
        documents: {
          select: {
            extractedText: true,
          },
        },
      },
    })

    if (!project) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: '프로젝트를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          projectId,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: 'asc',
            },
          },
        },
      })
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          projectId,
          userId: req.user.id,
        },
        include: {
          messages: true,
        },
      })
    }

    // Convert DB messages to Claude format
    const history = conversation.messages.map((msg) => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content,
    }))

    // Combine document context
    const documentContext = project.documents
      .map((doc) => doc.extractedText)
      .filter((text) => text)
      .join('\n\n')

    // Get AI response
    const { response, updatedHistory } = await claudeChat(message, history, documentContext)

    // Save messages to database
    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'user',
        content: message,
      },
    })

    await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: 'assistant',
        content: response,
      },
    })

    res.status(200).json({
      success: true,
      data: {
        conversationId: conversation.id,
        message: response,
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '대화 처리 중 오류가 발생했습니다',
      },
    })
  }
}

export const downloadContent = async (req: Request, res: Response): Promise<void> => {
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

    const { contentId } = req.params
    const { format = 'docx' } = req.query

    // Validate format
    if (!['docx', 'pdf', 'txt'].includes(format as string)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_FORMAT',
          message: '지원하지 않는 형식입니다. (docx, pdf, txt만 가능)',
        },
      })
      return
    }

    // Get content
    const content = await prisma.generatedContent.findUnique({
      where: { id: contentId },
      include: {
        project: {
          select: {
            userId: true,
          },
        },
      },
    })

    if (!content) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '생성된 콘텐츠를 찾을 수 없습니다',
        },
      })
      return
    }

    // Check permission
    if (content.project.userId !== req.user.id) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '이 콘텐츠에 접근할 권한이 없습니다',
        },
      })
      return
    }

    // Generate file
    let buffer: Buffer
    let contentType: string
    let filename: string

    const title = content.title || '생성된 문서'
    const safeFilename = title.replace(/[^a-zA-Z0-9가-힣\s]/g, '_')

    switch (format) {
      case 'docx':
        buffer = await exportAsDocx({
          title,
          content: content.content,
          format: 'docx',
        })
        contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        filename = `${safeFilename}.docx`
        break

      case 'pdf':
        buffer = await exportAsPdf({
          title,
          content: content.content,
          format: 'pdf',
        })
        contentType = 'application/pdf'
        filename = `${safeFilename}.pdf`
        break

      case 'txt':
        buffer = exportAsTxt({
          title,
          content: content.content,
          format: 'txt',
        })
        contentType = 'text/plain; charset=utf-8'
        filename = `${safeFilename}.txt`
        break

      default:
        res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_FORMAT',
            message: '지원하지 않는 형식입니다',
          },
        })
        return
    }

    // Set headers
    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`)
    res.setHeader('Content-Length', buffer.length)

    // Send file
    res.send(buffer)
  } catch (error) {
    console.error('Download content error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '문서 다운로드 중 오류가 발생했습니다',
      },
    })
  }
}

export const updateContent = async (req: Request, res: Response): Promise<void> => {
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

    const { contentId } = req.params
    const { content } = req.body

    if (!content) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '내용이 필요합니다',
        },
      })
      return
    }

    // Verify content exists and user owns the project
    const existingContent = await prisma.generatedContent.findFirst({
      where: {
        id: contentId,
        project: {
          userId: req.user.id,
        },
      },
    })

    if (!existingContent) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: '초안을 찾을 수 없습니다',
        },
      })
      return
    }

    // Update content
    const updatedContent = await prisma.generatedContent.update({
      where: {
        id: contentId,
      },
      data: {
        content,
        version: existingContent.version + 1,
      },
    })

    res.json({
      success: true,
      data: {
        content: updatedContent,
      },
    })
  } catch (error) {
    console.error('Update content error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '초안 업데이트 중 오류가 발생했습니다',
      },
    })
  }
}
