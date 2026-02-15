// Load environment variables from .env file
require('dotenv').config();

const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 3001

const cors = require('cors')
const router = require('./Routes/router')
const authRoutes = require('./Routes/auth')

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// Product routes
app.use(router);

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

