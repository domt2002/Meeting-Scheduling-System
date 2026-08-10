const mongoose = require('mongoose')

/*
Room Class

Single meeting room.
SRS FR2: Administrator manages rooms, and sets them as normal or special
SRS FR5: Special rooms require a $100 fee to be paid.

*/

const roomS = new mongoose.Schema({

    name: {type: String, required: true, unique:true},
    capacity: {type: Number, required: true},
    special: {type: Boolean, default: false},
    location: {type: String},
    created: {type: Date, default: Date.now}
})

const room = mongoose.model('room', roomS)

module.exports = room