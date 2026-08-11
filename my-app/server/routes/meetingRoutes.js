const express = require('express')
const router = express.Router()
const {createMeeting, listMeetings, freeSlots, updateMeeting, addAttendees, removeAttendee, deleteMeeting} = require('../controllers/meetingController')

/*
meetingRoutes

Maps the /meetings urls to meetingController
*/

//get who is signed in so controller knows who owns which meetings
function attachUser(req, res, next){
    const id = req.headers['userid']
    if (!id) return res.status(401).json({message: 'Error, user not signed in'})
    req.userId = id
    next()
}

// depend on user
router.use(attachUser)

router.get('/free', freeSlots) // has to be above /:id or express thinks free is an id
router.get('/', listMeetings)
router.post('/', createMeeting)
router.put('/:id', updateMeeting)
router.delete('/:id', deleteMeeting)

// attendees, use cases 2.7.6 and 2.7.7
router.post('/:id/attendees', addAttendees)
router.delete('/:id/attendees/:email', removeAttendee)

module.exports = router