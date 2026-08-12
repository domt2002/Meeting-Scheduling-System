const mongoose = require('mongoose')
const dotenv = require('dotenv')
const app = require('./app')

dotenv.config()

const PORT = process.env.PORT || 3000
const MONGODB_URI = process.env.MONGODB_URI

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

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })
