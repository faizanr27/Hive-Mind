import express, { Request, Response, NextFunction } from 'express';
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'
import contentRoutes from './routes/content.routes'
import shareRoutes from './routes/share.routes'
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const corsOptions = {
  origin: 'https://hivee-mind.vercel.app',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
    'Origin'
  ],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.use((req: Request, res: Response, next:  NextFunction): any => {
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  else{
    next();
  }
});


app.use(express.json())
connectDB()
app.use('/api/auth', authRoutes)
app.use('/api', contentRoutes)
app.use('/api', shareRoutes)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})
