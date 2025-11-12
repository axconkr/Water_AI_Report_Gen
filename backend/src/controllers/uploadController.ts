import { Request, Response } from 'express'
import { supabase } from '../config/supabase'
import { parseDocument } from '../utils/fileParser'
import prisma from '../config/database'
import path from 'path'
import fs from 'fs'
import { promisify } from 'util'

const writeFile = promisify(fs.writeFile)
const mkdir = promisify(fs.mkdir)

export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
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

    if (!req.file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'NO_FILE',
          message: '파일을 선택해주세요',
        },
      })
      return
    }

    const { projectId } = req.body

    if (!projectId) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '프로젝트 ID가 필요합니다',
        },
      })
      return
    }

    // Verify project belongs to user
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

    // Generate unique filename
    const timestamp = Date.now()
    const ext = path.extname(req.file.originalname)
    const filename = `${req.user.id}/${projectId}/${timestamp}${ext}`

    // Local file storage for development
    const uploadDir = path.join(process.cwd(), 'uploads', req.user.id, projectId)
    const filePath = path.join(uploadDir, `${timestamp}${ext}`)

    // Create directory if it doesn't exist
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Directory might already exist
    }

    // Save file locally
    try {
      await writeFile(filePath, req.file.buffer)
    } catch (uploadError) {
      console.error('File upload error:', uploadError)
      res.status(500).json({
        success: false,
        error: {
          code: 'UPLOAD_FAILED',
          message: '파일 업로드에 실패했습니다',
        },
      })
      return
    }

    // Generate public URL (local path for development)
    const publicUrl = `/uploads/${req.user.id}/${projectId}/${timestamp}${ext}`

    // Parse document content
    let parsedContent
    try {
      parsedContent = await parseDocument(req.file.buffer, req.file.mimetype)
    } catch (parseError) {
      console.error('Document parsing error:', parseError)
      // Continue without parsed content
      parsedContent = null
    }

    // Fix Korean filename encoding
    let originalFileName = req.file.originalname
    try {
      // Try to fix encoding if it's garbled
      originalFileName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    } catch (err) {
      // If conversion fails, use original
      originalFileName = req.file.originalname
    }

    // Save document metadata to database
    const document = await prisma.document.create({
      data: {
        projectId,
        userId: req.user.id,
        fileName: originalFileName,
        fileType: ext.substring(1).toUpperCase(),
        fileUrl: publicUrl,
        fileSize: req.file.size,
        status: 'completed',
        extractedText: parsedContent?.text || null,
        metadata: parsedContent
          ? {
              pages: parsedContent.metadata.pages,
              wordCount: parsedContent.metadata.wordCount,
              charCount: parsedContent.metadata.charCount,
            }
          : null,
      },
    })

    res.status(201).json({
      success: true,
      data: {
        document: {
          id: document.id,
          fileName: document.fileName,
          fileType: document.fileType,
          fileUrl: document.fileUrl,
          fileSize: document.fileSize,
          createdAt: document.createdAt,
          metadata: document.metadata,
        },
      },
      message: '파일이 성공적으로 업로드되었습니다',
    })
  } catch (error) {
    console.error('Upload document error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '파일 업로드 처리 중 오류가 발생했습니다',
      },
    })
  }
}

export const getDocuments = async (req: Request, res: Response): Promise<void> => {
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

    // Verify project belongs to user
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

    const documents = await prisma.document.findMany({
      where: {
        projectId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        fileName: true,
        fileType: true,
        fileUrl: true,
        fileSize: true,
        createdAt: true,
        metadata: true,
      },
    })

    res.status(200).json({
      success: true,
      data: { documents },
    })
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '문서 조회 중 오류가 발생했습니다',
      },
    })
  }
}

export const deleteDocument = async (req: Request, res: Response): Promise<void> => {
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

    // Delete from local file system
    const filePath = path.join(process.cwd(), document.fileUrl)

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath)
      }
    } catch (deleteError) {
      console.error('File delete error:', deleteError)
    }

    // Delete from database
    await prisma.document.delete({
      where: {
        id: documentId,
      },
    })

    res.status(200).json({
      success: true,
      message: '문서가 삭제되었습니다',
    })
  } catch (error) {
    console.error('Delete document error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '문서 삭제 중 오류가 발생했습니다',
      },
    })
  }
}
