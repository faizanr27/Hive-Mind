import express from 'express'
import {verifyToken} from '../middlewares/auth.middleware';
const router = express.Router();
const controller = require('../controllers/content.controllers')

router.get('/Content', verifyToken, controller.getContent)
router.post('/Content', verifyToken, controller.createContent)
router.delete('/Content', verifyToken, controller.deleteContent)

export default router