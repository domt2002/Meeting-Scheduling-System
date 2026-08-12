const express = require('express')
const router = express.Router()
const {createMeeting, listMeetings, freeSlots, updateMeeting, addAttendees, removeAttendee,
        deleteMeeting, acceptInvite, rejectInvite, requestTransfer, rejectTransfer, acceptTransfer} = require('../controllers/meetingController')
const {decodeAuth} = require('../controllers/userController')

/*
meetingRoutes

Maps the /meetings urls to meetingController
*/

// verify auth
router.use(decodeAuth)

router.get('/free', freeSlots) // has to be above /:id or express thinks free is an id
router.get('/', listMeetings)
router.post('/', createMeeting)
router.post('/:id/accept', acceptInvite)
router.post('/:id/reject', rejectInvite)
router.post('/:id/transfer', requestTransfer)
router.post('/:id/transfer/accept', acceptTransfer)
router.post('/:id/transfer/reject', rejectTransfer)
router.put('/:id', updateMeeting)
router.delete('/:id', deleteMeeting)

// attendees, use cases 2.7.6 and 2.7.7
router.post('/:id/attendees', addAttendees)
router.delete('/:id/attendees/:email', removeAttendee)

module.exports = router