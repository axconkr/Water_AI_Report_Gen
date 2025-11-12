import express from 'express'
import authRoutes from './authRoutes'

const router = express.Router()

// API v1 routes
router.use('/auth', authRoutes)

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  })
})

export default router
