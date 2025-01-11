import { NextFunction, Request, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
require('dotenv').config()


declare global {
  namespace Express {
      interface Request {
          userId?: string;
      }
  }
}

const SECRET = process.env.JWT_SECRET as string;

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const header = req.headers["authorization"];
    const decoded = jwt.verify(header as string, SECRET)
    if (decoded) {
        if (typeof decoded === "string") {
            res.status(403).json({
                message: "You are not logged in"
            })
            return;    
        }
        req.userId = (decoded as JwtPayload).userId;
        next()
    } else {
        res.status(403).json({
            message: "You are not logged in"
        })
    }
}