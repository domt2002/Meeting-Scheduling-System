const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const dotenv = require('dotenv')

dotenv.config()

const userRoutes = require('./routes/userRoutes')

const app = express()
const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI

app.use(express.json())
app.use(cors())

if (!MONGODB_URI) {
  console.error('Missing MONGODB_URI environment variable. Set it in .env or your environment.')
  process.exit(1)
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((error) => {
    console.error('MongoDB connection error:', error)
    process.exit(1)
  })

app.use('/users', userRoutes)

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })
