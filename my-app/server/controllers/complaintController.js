const Complaint = require('../models/complaint')

function adminRequest(req) {
  const roleHeader = req.headers['userrole']
  return roleHeader === 'admin'
}

function clientRequest(req) {
  const roleHeader = req.headers['userrole']
  return roleHeader === 'client'
}

async function createComplaint(req, res) {
  console.log('createComplaint payload:', req.body)

  const { subject, description, priority, submittedBy, submittedByEmail, role } = req.body
  const roleHeader = req.headers['userrole']

  if (role !== 'client' || roleHeader !== 'client') {
    return res.status(403).json({ message: 'Only clients can file a complaint.' })
  }

  if (!subject || !description || !submittedBy || !submittedByEmail) {
    return res.status(400).json({ message: 'Subject, description, and client information are required.' })
  }

  try {
    const newComplaint = await Complaint.create({
      subject,
      description,
      priority: priority || 'Normal',
      status: 'Open',
      response: '',
      submittedBy,
      submittedByEmail
    })

    res.status(201).json(newComplaint)
  } catch (e) {
    console.error('createComplaint error:', e)
    res.status(500).json({ message: e.message })
  }
}

async function getComplaints(req, res) {
  const roleHeader = req.headers['userrole']
  const userEmail = req.headers['useremail']

  try {
    let complaints
    if (roleHeader === 'admin') {
      complaints = await Complaint.find().sort({ createdAt: -1 })
    } else if (roleHeader === 'client' && userEmail) {
      complaints = await Complaint.find({ submittedByEmail: userEmail }).sort({ createdAt: -1 })
    } else {
      return res.status(403).json({ message: 'Access denied' })
    }

    res.json(complaints)
  } catch (e) {
    console.error('getComplaints error:', e)
    res.status(500).json({ message: e.message })
  }
}

async function updateComplaintResponse(req, res) {
  if (!adminRequest(req)) {
    return res.status(403).json({ message: 'Admin privileges required' })
  }

  const complaintId = req.params.id
  const { response } = req.body
  if (typeof response !== 'string') {
    return res.status(400).json({ message: 'Response text is required' })
  }

  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      complaintId,
      { response, status: 'Answered' },
      { new: true }
    )

    if (!updatedComplaint) {
      return res.status(404).json({ message: 'Complaint not found' })
    }

    res.json(updatedComplaint)
  } catch (e) {
    console.error('updateComplaintResponse error:', e)
    res.status(500).json({ message: e.message })
  }
}

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaintResponse
}
