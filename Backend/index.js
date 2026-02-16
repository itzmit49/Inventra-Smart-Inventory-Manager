// Load environment variables from .env file
const path = require('path');

require('dotenv').config();

const connectToMongo = require('./db')
connectToMongo();

const express = require('express')
const app = express()
const port = process.env.PORT || 3001
const _dirname = path.resolve();

const cors = require('cors')
const router = require('./Routes/router')
const authRoutes = require('./Routes/auth')

app.use(cors());
app.use(express.json());

// Authentication routes
app.use('/api/auth', authRoutes);

// Product routes
app.use(router);

app.use(express.static(path.join(_dirname, 'Frontend/inventory_management_system/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(_dirname, 'Frontend/inventory_management_system/dist/index.html',"dist","index.html"));

})

app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})

