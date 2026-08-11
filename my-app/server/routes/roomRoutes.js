const express = require('express')
const router = express.Router()
const {createRoom, listRooms, deleteRoom} = require('../controllers/roomController')

/*
roomRoutes

Maps the /rooms urls to roomCotroller
Admin only for anything that changes a room, FR2
*/

// admin only
function requireAdmin(req, res, next){
    if (req.headers['userrole'] !== 'admin') return res.status(403).json({message: 'Error Admin Only function'})
    next()
}

// anyone can see the rooms so they cna pick one
router.get('/', listRooms)

// admin only functions
router.post('/', requireAdmin, createRoom)
router.delete('/:id', requireAdmin, deleteRoom)

module.exports = router