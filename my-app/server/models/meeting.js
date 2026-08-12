const mongoose = require('mongoose')

/*
Meeting Class

Single meeting.. = Room booked for one hour during week. 1 slot

SRS 2.1 meeting schedules a work week. meeting id'd by hour and day of week
SRS FR3. Available times from 9 am to 5pm mon - fri
SRS FR4: A room may only hold one meeting for one slot. no two overlapping meetings

*/

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
const OPEN = 9 // 9 am
const CLOSE = 17 // 5 pm

const meetingS = new mongoose.Schema({
    name: {type: String, required: true},
    room: {type: mongoose.Schema.Types.ObjectId, ref: 'room', required: true},
    author: {type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true},
    day: {type: String, required: true, enum: WEEKDAYS},
    start: {type: Number, required: true, min: OPEN, max: CLOSE-1},
    end: {type: Number, required: true, min: OPEN +1, max: CLOSE},
    invited: {type: [String], default: []}, // pending invite accept
    attendees: {type: [String], default: []},
    specialFeePaid: {type: Boolean, default: false},
    created: {type: Date, default: Date.now},
    // for transferring ownership
    pendingTransfer: {type: String, default: ''} // email of new requested owner use case 2.7.12, 2.7.13
})



meetingS.index({room: 1, day: 1})

const meeting = mongoose.model('meeting', meetingS)
module.exports = meeting
module.exports.WEEKDAYS = WEEKDAYS
module.exports.OPEN = OPEN
module.exports.CLOSE = CLOSE