import { Request, Response } from 'express'
import prisma from '../config/database'
import { hashPassword, comparePassword, validatePasswordStrength } from '../utils/password'
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt'
import { registerSchema, loginSchema, refreshTokenSchema } from '../utils/validation'
import { AppError } from '../middlewares/errorHandler'

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = registerSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      })
      return
    }

    const { email, password, name, company, phone } = value

    // Validate password strength
    if (!validatePasswordStrength(password)) {
      res.status(400).json({
        success: false,
        error: {
          code: 'WEAK_PASSWORD',
          message: '비밀번호는 최소 8자 이상이며, 대소문자, 숫자, 특수문자를 포함해야 합니다',
        },
      })
      return
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      res.status(409).json({
        success: false,
        error: {
          code: 'USER_EXISTS',
          message: '이미 등록된 이메일입니다',
        },
      })
      return
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        company: company || null,
        phone: phone || null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        role: true,
        createdAt: true,
      },
    })

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    res.status(201).json({
      success: true,
      data: {
        user,
        accessToken,
        refreshToken,
      },
      message: '회원가입이 완료되었습니다',
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '회원가입 처리 중 오류가 발생했습니다',
      },
    })
  }
}

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = loginSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      })
      return
    }

    const { email, password } = value

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
      })
      return
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: '이메일 또는 비밀번호가 올바르지 않습니다',
        },
      })
      return
    }

    // Check email verification (optional for now)
    // if (!user.emailVerified) {
    //   res.status(403).json({
    //     success: false,
    //     error: {
    //       code: 'EMAIL_NOT_VERIFIED',
    //       message: '이메일 인증이 필요합니다',
    //     },
    //   })
    //   return
    // }

    // Generate tokens
    const accessToken = generateAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    const refreshToken = generateRefreshToken({
      id: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    res.status(200).json({
      success: true,
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken,
      },
      message: '로그인 성공',
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '로그인 처리 중 오류가 발생했습니다',
      },
    })
  }
}

export const refresh = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate request body
    const { error, value } = refreshTokenSchema.validate(req.body)
    if (error) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: error.details[0].message,
        },
      })
      return
    }

    const { refreshToken } = value

    // Verify refresh token
    let decoded
    try {
      decoded = verifyRefreshToken(refreshToken)
    } catch (error) {
      res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_REFRESH_TOKEN',
          message: '유효하지 않거나 만료된 Refresh Token입니다',
        },
      })
      return
    }

    // Generate new tokens
    const newAccessToken = generateAccessToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    })

    const newRefreshToken = generateRefreshToken({
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    })

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      },
      message: '토큰 갱신 성공',
    })
  } catch (error) {
    console.error('Refresh token error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '토큰 갱신 중 오류가 발생했습니다',
      },
    })
  }
}

export const getProfile = async (req: Request, res: Response): Promise<void> => {
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

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        company: true,
        phone: true,
        avatarUrl: true,
        emailVerified: true,
        role: true,
        subscriptionTier: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: '사용자를 찾을 수 없습니다',
        },
      })
      return
    }

    res.status(200).json({
      success: true,
      data: { user },
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({
      success: false,
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: '프로필 조회 중 오류가 발생했습니다',
      },
    })
  }
}
