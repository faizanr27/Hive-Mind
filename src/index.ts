import express from 'express'
require('dotenv').config()
import connectDB from './db/db'
import authRoutes from './routes/auth.routes'
import contentRoutes from './routes/content.routes'
import shareRoutes from './routes/share.routes'
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 4000

const corsOptions = {
  origin: "https://hivee-mind.vercel.app",
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

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle OPTIONS requests
app.options('*', cors(corsOptions));

// Additional headers middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', 'https://hivee-mind.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header(
    'Access-Control-Allow-Headers',
    'Origin,X-Requested-With,Content-Type,Accept,Authorization'
  );
  next();
});

app.use(express.json())
connectDB()

app.use('/', authRoutes)
app.use('/', contentRoutes)
app.use('/', shareRoutes)

app.listen(PORT, ()=>{
    console.log(`server running on port ${PORT}`)
})
