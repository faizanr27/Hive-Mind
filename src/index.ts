import express, { Request, Response, NextFunction } from 'express';
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'
import contentRoutes from './routes/content.routes'
import shareRoutes from './routes/share.routes'
import cookieParser from "cookie-parser";
import passport from 'passport'
import session from 'express-session';
import MongoStore from 'connect-mongo';
const cors = require('cors')
const app = express()

const PORT = process.env.PORT || 4000;


const corsOptions = {

    origin: ['https://hivee-mind.vercel.app','http://localhost:5173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true

};

app.use(cors(corsOptions));
app.use(
    session({
        secret: process.env.SESSION_SECRET!,
        resave: false,
        saveUninitialized: false,
        store: MongoStore.create({
            mongoUrl: process.env.URI!,
            ttl: 14 * 24 * 60 * 60
        })
    })
);
app.use(passport.initialize())
app.use(passport.session())

app.use(express.json())
app.use(cookieParser(process.env.COOKIE_SECRET));
connectDB()
app.use('/api/auth', authRoutes)
app.use('/api', contentRoutes)
app.use('/api', shareRoutes)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})
