const Complaint = require('../models/complaint')
const user = require('../models/user')

function adminRequest(req) {
    const roleHeader = req.user.role
    return roleHeader === 'admin'
}

function clientRequest(req) {
  return req.user && req.user.role === 'client'
}

async function createComplaint(req, res) {
  console.log('createComplaint payload:', req.body)

  const { subject, description, priority } = req.body

  if (!clientRequest(req)) {
    return res.status(403).json({ message: 'Only clients can file a complaint.' })
  }

  if (!subject || !description) {
    return res.status(400).json({ message: 'Subject and description are required.' })
  }

  try {
    const existingUser = await user.findById(req.user.id)
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    const newComplaint = await Complaint.create({
      subject,
      description,
      priority: priority || 'Normal',
      status: 'Open',
      response: '',
      submittedBy: `${existingUser.firstName} ${existingUser.lastName}`,
      submittedByEmail: existingUser.email
    })

    res.status(201).json(newComplaint)
  } catch (e) {
    console.error('createComplaint error:', e)
    res.status(500).json({ message: e.message })
  }
}

async function getComplaints(req, res) {
  try {
    const existingUser = await user.findById(req.user.id)
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    let complaints
    if (req.user.role === 'admin') {
      complaints = await Complaint.find().sort({ createdAt: -1 })
    } else if (req.user.role === 'client') {
      complaints = await Complaint.find({ submittedByEmail: existingUser.email }).sort({ createdAt: -1 })
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
