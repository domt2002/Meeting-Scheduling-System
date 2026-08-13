const express = require('express')
const router = express.Router()
const { createComplaint, getComplaints, updateComplaintResponse } = require('../controllers/complaintController')
const { decodeAuth } = require('../controllers/userController')

router.get('/', decodeAuth, getComplaints)
router.post('/', decodeAuth, createComplaint)
router.put('/:id/response', decodeAuth, updateComplaintResponse)

module.exports = router
