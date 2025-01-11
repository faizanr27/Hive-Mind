import express from 'express'
import {verifyToken} from '../middlewares/auth.middleware';
const router = express.Router();
const controller = require('../controllers/auth.controllers')

router.post('/signup', controller.signup)

router.post('/auth/login', controller.login)


router.get('/', verifyToken, (req, res) => {
    res.send('Hello World!')
})
export default router