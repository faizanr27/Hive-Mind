import express from 'express'
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'
import contentRoutes from './routes/content.routes'
import shareRoutes from './routes/share.routes'

const app = express()
const PORT = process.env.PORT || 4000
app.use(express.json())


connectDB()
app.use('/', authRoutes)
app.use('/', contentRoutes)
app.use('/', shareRoutes)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})