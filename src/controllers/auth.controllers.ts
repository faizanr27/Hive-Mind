require('dotenv').config();
import { Request, Response } from 'express';
import {User} from '../models/user.models'
import { z } from 'zod';
const bcrypt = require('bcryptjs');
import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET as string;


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

        res.status(200).json({
            token
        })
        
    } catch (error) {
        console.log(error)
    }
}
