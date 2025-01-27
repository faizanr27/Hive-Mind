require('dotenv').config();
import { Request, Response,NextFunction } from 'express';
import {User} from '../models/user.models'
import { z } from 'zod';
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET
import passport from '../config/passport';

const SECRET = process.env.JWT_SECRET as string;
const COOKIE_NAME = "auth_token";
const isProduction = process.env.NODE_ENV === "production";

const inputSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters").transform(name => name.trim().toLowerCase()),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters")
  });

exports.signup =  async (req: Request, res: Response) => {
    try {
        const validatedData = inputSchema.parse(req.body);
        const {name, email, password} = validatedData;

        const existingUser = await User.findOne({email})

        if(existingUser){
            return res.status(400).json({error: "User with this email already exists"})
        }

        const myEncPassword = await bcrypt.hash(password, 10)

        const user = new User({name, email, password: myEncPassword})
        await user.save()

        const token =  jwt.sign(
            {userId: user._id},
            SECRET,
            {expiresIn: '30d'})

            res.status(200).json({
                token
            })
    } catch (error) {
        console.log(error)
    }
}

exports.login = async (req: Request, res: Response) => {
    try {
        const {email, password} = req.body
        const user = await User.findOne({email})
        if(!user){
            return res.status(400).json({error: "User with this email does not exist"})
        }

        if(!(email && (await bcrypt.compare(password, user.password)))){
            return res.status(400).json('Invalid email or password')
        }

        const token =  jwt.sign(
            {userId: user._id},
            SECRET,
            {expiresIn: '30d'}
        )

        const oldToken = req.signedCookies[`${COOKIE_NAME}`];
        if (oldToken) {
            res.clearCookie(COOKIE_NAME);
        }

        const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000;
        const expires = new Date(Date.now() + expiresInMilliseconds);
        console.log("reached here 1")
        res.cookie(COOKIE_NAME, token, {
          domain: isProduction ? "hive-mind.up.railway.app" : undefined, // Production Mode
          expires,
          httpOnly: true,
          signed: true,
          secure: isProduction,
          sameSite : isProduction ? "none" : "lax"
      });
      console.log("reached here 2")

      res.status(200).json({message:`${user.name} has been successfully logged in.`,id:user._id})
        // res.status(200).json({
        //     token
        // })

    } catch (error:any) {
        console.log({message:`${error.message}`})
    }
}

exports.verifyUser = async (
  req : Request,
  res : Response,
  next : NextFunction
) =>{
  try {
      if(!res.locals.jwtData){
          return res.status(403).json({message : "Not authorised."})
      }


      const existingUser = await User.findById(res.locals.jwtData);
      if(!existingUser){
          return res.status(401).json({
              message : "User not registered or Token malfunctioned."
          })
      }

      if(existingUser._id?.toString() != res.locals.jwtData){
          return res.status(401).send("Permissions did not match.");
      }

      return res.status(200).json({
          message : "User successfully verified.",
          id : existingUser._id,
          username : existingUser.name
      });
  }
  catch (error : any) {
      console.log(`Error in logging in user : ${error.message}`);

      return res.status(500).json({
          message : "Error in verifying in user",
          reason : error.message
      })
  }
};

//GOOGLE oAUth 2.0
exports.googleCallback = [
  passport.authenticate('google', { failureRedirect: '/' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET as string, { expiresIn: '30d' });

      // Clear old token if it exists
      const oldToken = req.signedCookies[`${COOKIE_NAME}`];
      if (oldToken) {
        res.clearCookie(COOKIE_NAME);
      }

      // Set cookie expiration and cookie itself
      const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days
      const expires = new Date(Date.now() + expiresInMilliseconds);

      res.cookie(COOKIE_NAME, token, {
        domain: isProduction ? "hive-mind.up.railway.app" : undefined,
        expires,
        httpOnly: true,
        signed: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });

      console.log('Successfully authenticated, redirecting...');
      res.redirect('https://hivee-mind.vercel.app/dashboard');
      // res.redirect('http://localhost:5173/dashboard');
    } catch (error) {
      console.error('Google callback error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },
];

exports.githubCallback = [
  passport.authenticate('github', { failureRedirect: '/' }),
  async (req: Request, res: Response) => {
    try {
      const user = req.user as any;

      if (!user) {
        res.status(401).json({ message: 'User not authenticated.' });
        return;
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user._id }, JWT_SECRET as string, { expiresIn: '30d' });

      // Clear old token if it exists
      const oldToken = req.signedCookies[`${COOKIE_NAME}`];
      if (oldToken) {
        res.clearCookie(COOKIE_NAME);
      }

      // Set cookie expiration and cookie itself
      const expiresInMilliseconds = 7 * 24 * 60 * 60 * 1000; // 7 days
      const expires = new Date(Date.now() + expiresInMilliseconds);

      res.cookie(COOKIE_NAME, token, {
        domain: isProduction ? "hive-mind.up.railway.app" : undefined,
        expires,
        httpOnly: true,
        signed: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
      });

      console.log('Successfully authenticated, redirecting...');
      // res.redirect('http://localhost:5173/dashboard');
      res.redirect('https://hivee-mind.vercel.app/dashboard');
    } catch (error) {
      console.error('Github callback error:', error);
      res.status(500).json({ message: 'Internal server error.' });
    }
  },
];

  exports.logout = async (
    req : Request,
    res : Response,
    next : NextFunction
) =>{
    try {
      const oldToken = req.signedCookies[`${COOKIE_NAME}`];
      if (oldToken) {
        res.clearCookie(COOKIE_NAME);
      }
        return res.status(200).json({
            message : "User successfully logged out."
        });
    }
    catch (error : any) {
        console.log(`Error in logging out user : ${error.message}`);

        return res.status(500).json({
            message : "Error in logging in user",
            reason : error.message
        })
    }
};
