import express,{ Request, Response, NextFunction } from 'express'
import {verifyToken} from '../middlewares/auth.middleware';
const router = express.Router();
import { getContent, createContent, queryEmbeddings, deleteContent } from '../controllers/content.controllers';

const asyncHandler = <T>(fn: (req: Request, res: Response, next: NextFunction) => Promise<T>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).then(() => next()).catch(next);
  };
};

router.get('/Content', verifyToken, asyncHandler(getContent));
router.post('/Content/generate', verifyToken, asyncHandler(createContent));
router.post('/Content/retrieve', verifyToken, asyncHandler(queryEmbeddings));
router.delete('/Content', verifyToken, asyncHandler(deleteContent));

export default router;