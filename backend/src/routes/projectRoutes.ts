import express from 'express'
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
} from '../controllers/projectController'
import { authenticate } from '../middlewares/auth'

const router = express.Router()

// All routes require authentication
router.post('/', authenticate, createProject)
router.get('/', authenticate, getProjects)
router.get('/:projectId', authenticate, getProject)
router.put('/:projectId', authenticate, updateProject)
router.delete('/:projectId', authenticate, deleteProject)

export default router
