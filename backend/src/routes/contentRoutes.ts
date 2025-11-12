import express from 'express'
import {
  generateContent,
  improveGeneratedContent,
  getGeneratedContents,
  chat,
  downloadContent,
  updateContent,
} from '../controllers/contentController'
import { authenticate } from '../middlewares/auth'

const router = express.Router()

// All routes require authentication
router.post('/generate', authenticate, generateContent)
router.post('/:contentId/improve', authenticate, improveGeneratedContent)
router.get('/project/:projectId', authenticate, getGeneratedContents)
router.post('/chat', authenticate, chat)
router.get('/:contentId/download', authenticate, downloadContent)
router.patch('/:contentId', authenticate, updateContent)

export default router
