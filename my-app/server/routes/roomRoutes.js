const express = require('express')
const router = express.Router()
const {createRoom, listRooms, deleteRoom} = require('../controllers/roomController')
const {decodeAuth} = require('../controllers/userController')

/*
roomRoutes

Maps the /rooms urls to roomCotroller
Admin only for anything that changes a room, FR2
*/

// admin only
function requireAdmin(req, res, next){
    if (req.user.role !== 'admin') return res.status(403).json({message: 'Error Admin only function'})
    next()
}

// anyone can see the rooms so they cna pick one
router.get('/', listRooms)

// admin only functions
router.post('/', decodeAuth, requireAdmin, createRoom)
router.delete('/:id', decodeAuth, requireAdmin, deleteRoom)

module.exports = router