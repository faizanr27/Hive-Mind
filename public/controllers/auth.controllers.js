"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require('dotenv').config();
const user_models_1 = require("../models/user.models");
const zod_1 = require("zod");
const bcrypt = require('bcryptjs');
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET = process.env.JWT_SECRET;
const inputSchema = zod_1.z.object({
    name: zod_1.z.string().min(3, "Name must be at least 3 characters").transform(name => name.trim().toLowerCase()),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(6, "Password must be at least 6 characters")
});
exports.signup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = inputSchema.parse(req.body);
        const { name, email, password } = validatedData;
        const existingUser = yield user_models_1.User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User with this email already exists" });
        }
        const myEncPassword = yield bcrypt.hash(password, 10);
        const user = new user_models_1.User({ name, email, password: myEncPassword });
        yield user.save();
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
        res.status(200).json({
            token
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const user = yield user_models_1.User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: "User with this email does not exist" });
        }
        if (!(email && (yield bcrypt.compare(password, user.password)))) {
            res.status(400).json('Invalid email or password');
        }
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, SECRET, { expiresIn: '30d' });
        res.status(200).json({
            token
        });
    }
    catch (error) {
        console.log(error);
    }
});
