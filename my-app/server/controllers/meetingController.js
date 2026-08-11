const meeting = require('../models/meeting')
const room = require('../models/room')
const {WEEKDAYS, OPEN, CLOSE} = require('../models/meeting')

/*
meetingController

SDD 4.4

Handles creation, cancellation, editing, and attendees for meetings.

FR4 - 1 room cant have 2 meetings in 1 slot.

*/

// Check valid day and hour for meeting slot
function checkSlot(body){
    if (!WEEKDAYS.includes(body.day)) return 'Invalid day! Only Mon-Fri' // check day
    if (!Number.isInteger(body.start) || !Number.isInteger(body.end)) return 'Invalid, time has to be an int'
    if (body.start < OPEN || body.end > CLOSE) return 'Invalid time slot. Meeting has to be between 9:00 and 17:00'
    if (body.end <= body.start) return 'Error, meeting endd has to be after the start'
    return null //valid
}

// Ensure only author can modify meeting
function notAuthor(m, req){
    return String(m.author) !== String(req.userId)
}

// FR4, no 2 meetings in same slot. Null = free slot
// Two slots overlap if one starts before the other ends
// < and > not <= and >= so 10-11 and 11-12 are allowed
// skip == meeting to be edited, cant clash with itself
async function findClash(roomId, day, start, end, skip){
    const q = {
        room: roomId,
        day: day,
        start: {$lt: end},
        end: {$gt: start}
    }

    if (skip) q._id = {$ne: skip}

    return meeting.findOne(q)
}

// POST client makes meeting
// use case 2.7.5
async function createMeeting(req, res){
    if (!req.body.name || !req.body.name.trim()) return res.status(400).json({message: 'Error, meeting without name.'})

    const invalid = checkSlot(req.body)
    if (invalid) return res.status(400).json({message:invalid})

    try{
        const booked = await room.findById(req.body.roomId)
        if (!booked) return res.status(404).json({message: 'Room not found with given id'})

        // FR 5 special rooms need $100 fee paid before saving
        if (booked.special && req.body.specialFeePaid !== true){
            return res.status(402).json({message: '$100 special room fee required first', amount: 100})
        }

        // FR4, slot has to be open
        const clash = await findClash(req.body.roomId, req.body.day, req.body.start, req.body.end)

        if (clash) return res.status(409).json({message: 'Error, room has already been booked for this time slot!'})

        const made = await meeting.create({
            name: req.body.name.trim(),
            room: req.body.roomId,
            author: req.userId,
            day: req.body.day,
            start: req.body.start,
            end: req.body.end,
            attendees: req.body.attendees || [],
            specialFeePaid: booked.special

        })

        res.status(201).json(await made.populate('room'))
    } catch (e){
        res.status(500).json({message: e.message})
    }


}

// GET list meetings, admin filters for FR 8
// ?mine= true ?day= Monday ?roomID, ?author, ?start = 10, ?Attendee = e,ao;
async function listMeetings(req, res){
    try{
        const filter = {}

        if (req.query.mine == 'true') filter.author = req.userId // use case 2.7.9, only my meetings
        if (req.query.author) filter.author = req.query.author
        if (req.query.day) filter.day = req.query.day
        if (req.query.roomId) filter.room = req.query.roomId
        if (req.query.start) filter.start = Number(req.query.start)
        if (req.query.attendee) filter.attendees = String(req.query.attendee)

        res.json(await meeting.find(filter).populate('room').sort({start:1}))


    } catch(e){
    res.status(500).json({message: e.message})
    }
}

// GET every hour in a day, and availability. shown by booking page.
async function freeSlots(req, res){
    if (!req.query.roomId || !WEEKDAYS.includes(req.query.day)) return res.status(400).json({message: 'Need RoomId and weekday'})

    try{
        const taken = await meeting.find({room: req.query.roomId, day: req.query.day})
        const slots = []
        for (let i = OPEN; i < CLOSE; i++){
            const busy = taken.some(m => m.start <= i && m.end > i)
            slots.push({start: i, end: i+1, free: !busy})
        }

        res.json({day: req.query.day, slots: slots})
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

// PUT edit meeting, can also movem eeitng to another rooim. use case 2.7.11
   async function updateMeeting(req, res){
        const invalid = checkSlot(req.body)

        if (invalid) return res.status(400).json({message: invalid})

        try{
            const m = await meeting.findById(req.params.id)
            if (!m) return res.status(404).json({message: 'No meeting with given id'})
            if (notAuthor(m,req)) return res.status(403).json({message:'Error, only meeting creator can edit it.'})

            const roomId = req.body.roomId || m.room
            const target = await room.findById(roomId)
            if (!target) return res.status(404).json({message: 'No room with given ID'})

            // skip cant clash with self

            const clash = await findClash(roomId, req.body.day, req.body.start, req.body.end, m._id)
            if (clash) return res.status(409).json({message: 'Error! Room already booked!'})

            m.name = req.body.name ? req.body.name.trim() : m.name
            m.room = roomId
            m.day = req.body.day
            m.start = req.body.start
            m.end = req.body.end

            await m.save()
            res.json(await m.populate('room'))
        } catch(e){
            res.status(500).json({message: e.message})
        }
   }

// POST add attendees. use case 2.7.6

async function addAttendees(req, res){
    try{
        const m = await meeting.findById(req.params.id)
        if (!m) return res.status(404).json({message: 'No meeting exists with given ID'})
        if (notAuthor(m, req)) return res.status(403).json({message: 'Error, only meeting creator can add attendees'})

        // takes a list or just one
        const emails = req.body.attendees || [req.body.attendee]

        for (const e of emails){
            if (typeof e !== 'string' || !e.includes('@')) return res.status(400).json({message: 'Not a real email: ' + e})
            if (!m.attendees.includes(e)) m.attendees.push(e) // no dupes
        }

        await m.save()
        res.json(m)
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

// DELETE removes an attendee from  a meeting. use case 2.7.7
async function removeAttendee(req, res){
    try{
        const m = await meeting.findById(req.params.id)
        if (!m) return res.status(404).json({message: 'No meeting exists with given ID'})
        if (notAuthor(m, req)) return res.status(403).json({message: 'Error, only meeting creator can remove attendees'})

        const email = decodeURIComponent(req.params.email)
        m.attendees = m.attendees.filter(a => a !== email)

        await m.save()
        res.json(m)
    } catch (e) {
        res.status(500).json({message: e.message})
    }
}

// client cancels meeting. use case 2.7.8
// slot freed
async function deleteMeeting(req, res){
    try{
        const m = await meeting.findById(req.params.id)
        if (!m) return res.status(404).json({message: 'No meeting exists with given ID'})
        if (notAuthor(m, req)) return res.status(403).json({message: 'Error, only meeting creator can cancel it'})

        await meeting.findByIdAndDelete(req.params.id)
        res.json({message: 'Meeting successfully cancelled'})
    } catch (e) {
        res.status(400).json({message: 'Invalid meeting ID'})
    }
}

module.exports = {createMeeting, listMeetings, freeSlots, updateMeeting, addAttendees, removeAttendee, deleteMeeting}