import { User } from "../models/user.models";
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

const signup = async (req: any, res:any) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await User.findOne({name});
        if (existingUser) {
            res.status(409).json({ error: "User already exists" });
            return;
        }
        const hashedPassword = await bcrypt.hash(password, 12);

        const user = new User({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.SECRET_KEY,
            { expiresIn: '30d' }
        );

        res.status(201).json({token});
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });;
        } else {
            console.log('An unknown error occurred');
        }
        
    }
}

const login = async (req: any, res: any) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            res.status(400).json({ error: "Email and password are required" });
        }
        const user = await User.findOne({email});
        if (!user) {
            res.status(404).json({ error: "User not found" });
        }
        if(!(user.email == email && (await bcrypt.compare(password, user.password)))){
            res.status(401).json({ error: "Invalid credentials" });
        }

        const token = jwt.sign(
            { userId: user._id }, 
            process.env.SECRET_KEY,
            { expiresIn: '30d' }
        );
        res.status(200).json({token});  
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });;
        } else {
            console.log('An unknown error occurred');
        }
    }
}
export default { signup, login };