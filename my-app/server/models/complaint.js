const mongoose = require('mongoose')

const complaintSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, default: 'Normal' },
  status: { type: String, default: 'Open' },
  response: { type: String, default: '' },
  submittedBy: { type: String, required: true },
  submittedByEmail: { type: String, required: true }
}, {
  timestamps: true
})

const Complaint = mongoose.model('complaint', complaintSchema)

module.exports = Complaint
