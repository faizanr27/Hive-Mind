import { User } from "../models/user.models";

const signup = async (req: any, res:any) => {
    try {
        const { name, email, password } = req.body;
        const user = await User.create({ name, email, password });
        res.status(201).json(user);
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
        const user = await User.findOne({   email, password });
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(404).json({ error: "User not found" });
        }
    } catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });;
        } else {
            console.log('An unknown error occurred');
        }
    }
}
export default { signup, login };