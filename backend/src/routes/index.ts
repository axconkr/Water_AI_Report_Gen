import express from 'express'
import authRoutes from './authRoutes'
import uploadRoutes from './uploadRoutes'
import projectRoutes from './projectRoutes'
import analysisRoutes from './analysisRoutes'
import contentRoutes from './contentRoutes'

const router = express.Router()

// API v1 routes
router.use('/auth', authRoutes)
router.use('/upload', uploadRoutes)
router.use('/projects', projectRoutes)
router.use('/analysis', analysisRoutes)
router.use('/content', contentRoutes)

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
