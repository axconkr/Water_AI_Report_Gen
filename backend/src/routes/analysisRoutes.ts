import express from 'express'
import { analyzeDocumentById, getDocumentAnalysis } from '../controllers/analysisController'
import { authenticate } from '../middlewares/auth'

const router = express.Router()

// All routes require authentication
router.post('/documents/:documentId', authenticate, analyzeDocumentById)
router.get('/documents/:documentId', authenticate, getDocumentAnalysis)

export default router
