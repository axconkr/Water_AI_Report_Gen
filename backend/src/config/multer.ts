import multer from 'multer'
import path from 'path'
import { AppError } from '../middlewares/errorHandler'

// File filter for allowed types
const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allowed file types
  const allowedMimes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]

  const allowedExtensions = ['.pdf', '.docx', '.doc']
  const ext = path.extname(file.originalname).toLowerCase()

  if (allowedMimes.includes(file.mimetype) && allowedExtensions.includes(ext)) {
    cb(null, true)
  } else {
    cb(
      new AppError(
        'INVALID_FILE_TYPE',
        '지원하지 않는 파일 형식입니다. PDF 또는 DOCX 파일만 업로드 가능합니다',
        400
      )
    )
  }
}

// Configure multer for memory storage
export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter,
})
