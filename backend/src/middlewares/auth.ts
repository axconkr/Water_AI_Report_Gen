import { Request, Response, NextFunction } from 'express'
import { verifyAccessToken } from '../utils/jwt'

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '인증 토큰이 필요합니다',
        },
      })
      return
    }

    const token = authHeader.substring(7) // Remove 'Bearer ' prefix

    try {
      const decoded = verifyAccessToken(token)
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      }
      next()
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: '유효하지 않거나 만료된 토큰입니다',
        },
      })
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '인증 처리 중 오류가 발생했습니다',
      },
    })
  }
}

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
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

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: '접근 권한이 없습니다',
        },
      })
      return
    }

    next()
  }
}
