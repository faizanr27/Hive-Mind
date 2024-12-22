import express from 'express'
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())


connectDB()
app.use('/', authRoutes)


app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})