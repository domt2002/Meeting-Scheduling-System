const express = require('express')
const cors = require('cors')

const userRoutes = require('./routes/userRoutes')
const complaintRoutes = require('./routes/complaintRoutes')
const roomRoutes = require('./routes/roomRoutes')
const meetingRoutes = require('./routes/meetingRoutes')

const app = express()

app.use(express.json())
app.use(cors())

app.use('/rooms', roomRoutes)
app.use('/meetings', meetingRoutes)
app.use('/users', userRoutes)
app.use('/complaints', complaintRoutes)

module.exports = app
