import express from 'express'
const router = express.Router();
import controller from '../controllers/auth.controllers'

router.post('/signup', controller.signup)
router.post('/login', controller.login)

export default router