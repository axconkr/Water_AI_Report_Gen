import Joi from 'joi'

export const registerSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요',
    'any.required': '이메일은 필수 항목입니다',
  }),
  password: Joi.string().min(8).required().messages({
    'string.min': '비밀번호는 최소 8자 이상이어야 합니다',
    'any.required': '비밀번호는 필수 항목입니다',
  }),
  name: Joi.string().min(2).max(50).required().messages({
    'string.min': '이름은 최소 2자 이상이어야 합니다',
    'string.max': '이름은 최대 50자까지 가능합니다',
    'any.required': '이름은 필수 항목입니다',
  }),
  company: Joi.string().max(100).optional().allow(''),
  phone: Joi.string()
    .pattern(/^[0-9-+()]*$/)
    .optional()
    .allow('')
    .messages({
      'string.pattern.base': '유효한 전화번호를 입력해주세요',
    }),
})

export const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': '유효한 이메일 주소를 입력해주세요',
    'any.required': '이메일은 필수 항목입니다',
  }),
  password: Joi.string().required().messages({
    'any.required': '비밀번호는 필수 항목입니다',
  }),
})

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required().messages({
    'any.required': 'Refresh token은 필수 항목입니다',
  }),
})
