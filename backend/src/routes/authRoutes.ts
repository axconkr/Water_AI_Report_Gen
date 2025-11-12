import express from 'express'
import { register, login, refresh, getProfile } from '../controllers/authController'
import { authenticate } from '../middlewares/auth'

const router = express.Router()

// Public routes
router.post('/register', register)
router.post('/login', login)
router.post('/refresh', refresh)

// Protected routes
router.get('/profile', authenticate, getProfile)

export default router
