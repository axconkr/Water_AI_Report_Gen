import express, { Application, Request, Response } from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import path from 'path'
import apiRoutes from './routes'
import { errorHandler } from './middlewares/errorHandler'

// Load environment variables
dotenv.config()

const app: Application = express()
const PORT = process.env.PORT || 4000

// Middleware
app.use(
  cors({
    origin: [
      process.env.CORS_ORIGIN || 'http://localhost:3000',
      'http://1.236.245.110:8020',
      'http://localhost:8020',
    ],
    credentials: true,
  })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

// Health check route
app.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'APAS Backend Server is running',
    timestamp: new Date().toISOString(),
  })
})

// API v1 routes
app.use('/api/v1', apiRoutes)

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
  })
})

// Error handler
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`)
  console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 API: http://localhost:${PORT}/api/v1`)
})

export default app
