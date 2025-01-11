import express from 'express'
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'
import contentRoutes from './routes/content.routes'
import shareRoutes from './routes/share.routes'
const cors = require('cors')

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())

const corsOptions = {
    origin: ['https://hivee-mind.vercel.app','http://localhost:5173'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],  
    credentials: true  

};
app.use(cors(corsOptions));

// Add this before your routes in index.ts
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

connectDB()
app.use('/', authRoutes)
app.use('/', contentRoutes)
app.use('/', shareRoutes)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})