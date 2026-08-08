const express = require('express')
const router = express.Router()
const { createComplaint, getComplaints, updateComplaintResponse } = require('../controllers/complaintController')

router.get('/', getComplaints)
router.post('/', createComplaint)
router.put('/:id/response', updateComplaintResponse)

module.exports = router
