import express from 'express'
import { uploadDocument, getDocuments, deleteDocument } from '../controllers/uploadController'
import { authenticate } from '../middlewares/auth'
import { upload } from '../config/multer'

const router = express.Router()

// All routes require authentication
router.post('/', authenticate, upload.single('file'), uploadDocument)
router.get('/:projectId', authenticate, getDocuments)
router.delete('/:documentId', authenticate, deleteDocument)

export default router
