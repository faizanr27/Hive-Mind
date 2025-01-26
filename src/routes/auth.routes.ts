import express from 'express'
import passport from '../config/passport';
import {verifyToken} from '../middlewares/auth.middleware';
const router = express.Router();
const controller = require('../controllers/auth.controllers')

router.post('/signup', controller.signup)
router.post('/login', controller.login)
router.get('/logout', controller.logout)
router.get('/', verifyToken, (req, res) => {
    res.send('Hello World!')
})
router.get(
    '/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );
router.get('/google/callback', controller.googleCallback)
router.get(
    '/github',
    passport.authenticate('github')
  );
router.get('/github/callback', controller.githubCallback)

router.get('/status', verifyToken, controller.verifyUser)
export default router