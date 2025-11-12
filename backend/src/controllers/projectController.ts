import { Request, Response } from 'express'
import prisma from '../config/database'

export const createProject = async (req: Request, res: Response): Promise<void> => {
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

    const { name, description, projectType, targetDate } = req.body

    if (!name) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '프로젝트 이름을 입력해주세요',
        },
      })
      return
    }

    const project = await prisma.project.create({
      data: {
        userId: req.user.id,
        name,
        description: description || null,
        projectType: projectType || 'GENERAL',
        endDate: targetDate ? new Date(targetDate) : null,
      },
    })

    res.status(201).json({
      success: true,
      data: { project },
      message: '프로젝트가 생성되었습니다',
    })
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로젝트 생성 중 오류가 발생했습니다',
      },
    })
  }
}

export const getProjects = async (req: Request, res: Response): Promise<void> => {
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

    const { status } = req.query

    const projects = await prisma.project.findMany({
      where: {
        userId: req.user.id,
        ...(status ? { status: status as string } : {}),
      },
      include: {
        _count: {
          select: {
            documents: true,
            generatedContents: true,
          },
        },
        documents: {
          select: {
            fileName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    res.status(200).json({
      success: true,
      data: { projects },
    })
  } catch (error) {
    console.error('Get projects error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로젝트 조회 중 오류가 발생했습니다',
      },
    })
  }
}

export const getProject = async (req: Request, res: Response): Promise<void> => {
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

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
      include: {
        documents: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            fileSize: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            documents: true,
            generatedContents: true,
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

    res.status(200).json({
      success: true,
      data: { project },
    })
  } catch (error) {
    console.error('Get project error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로젝트 조회 중 오류가 발생했습니다',
      },
    })
  }
}

export const updateProject = async (req: Request, res: Response): Promise<void> => {
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
    const { name, description, projectType, status, targetDate } = req.body

    // Verify project belongs to user
    const existingProject = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user.id,
      },
    })

    if (!existingProject) {
      res.status(404).json({
        success: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: '프로젝트를 찾을 수 없거나 접근 권한이 없습니다',
        },
      })
      return
    }

    const project = await prisma.project.update({
      where: {
        id: projectId,
      },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(projectType && { projectType }),
        ...(status && { status }),
        ...(targetDate && { endDate: new Date(targetDate) }),
      },
    })

    res.status(200).json({
      success: true,
      data: { project },
      message: '프로젝트가 수정되었습니다',
    })
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로젝트 수정 중 오류가 발생했습니다',
      },
    })
  }
}

export const deleteProject = async (req: Request, res: Response): Promise<void> => {
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

    // Delete project (cascades to related records)
    await prisma.project.delete({
      where: {
        id: projectId,
      },
    })

    res.status(200).json({
      success: true,
      message: '프로젝트가 삭제되었습니다',
    })
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로젝트 삭제 중 오류가 발생했습니다',
      },
    })
  }
}
