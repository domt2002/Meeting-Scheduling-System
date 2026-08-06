const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const userRoutes = require('./routes/userRoutes')

const app = express()
const PORT = 3000

app.use(express.json())
app.use(cors())

// add mongoose connection string later
// mongoose.connect()
// const db = mongoose.connection()
// db.on('error', console.error.bind(console, 'MongoDB connection error:'))
// db.once('open', () => { console.log('Connected to MongoDB') })

app.use('/users', userRoutes)

app.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })
