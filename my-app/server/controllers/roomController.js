const room = require('../models/room')
const meeting = require('../models/meeting')

/*


roomController

SDD 4.5
Manages rooms. Admins can add/delete/edit rooms. Clients can see the list and pick one when making a meeting


*/

// check room for either create room or update orom

function checkRoom(body){
    if (!body.name || !body.name.trim()) return 'Room has no name.'// no name
    if (!Number.isInteger(body.capacity) || body.capacity < 1) return ' Capacity has to be 1 or more, and a whole num' // invalid capacity
    return null
}

// Fields for a room
function fields(body){
    return{
        name: body.name.trim(),
        capacity: body.capacity,
        special: body. special === true, // to bool
        location: body.location
    }
}

// POST admin creates room. use case 2.7.15
async function createRoom(req, res){
    const invalid = checkRoom(req.body)

    if (invalid) return res.status(400).json({message: invalid})

    try{
        // check name not taken
        const nameTaken = await room.findOne({name:req.body.name.trim()})
        // if taken
        if (nameTaken) return res.status(409).json({message: 'Error, room name already taken'})

        res.status(201).json(await room.create (fields(req.body)))
    } catch (e) {
    res.status(500).json({message: e.message})
    }
}


// GET lists all rooms
async function listRooms(req, res){
    try{
        res.json(await room.find().sort({name:1}))
    } catch (e) {
        res.status(500).json({message:e.message})
    }
}

 // ADMIN DELETES ROOM. use case 2.7.16
 // cannot be deleted if meetings exist in that room
async function deleteRoom(req, res){
    try{
        const booked = await meeting.countDocuments({room: req.params.id})
        if (booked > 0) return res.status(409).json({message: 'Cannot delete room. Existing meetings in room'})

        const gone = await room.findByIdAndDelete(req.params.id)
        if (!gone) return res.status(404).json({message: 'Room does not exist with given ID'})

        res.json({message: 'Successfully deleted room'})

    } catch (e) {

        res.status(400).json({message: 'Room ID invalid'})

    }
}

module.exports = {createRoom, listRooms, deleteRoom}

