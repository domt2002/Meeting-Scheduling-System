import { useState } from 'react'

function Complaint() {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Normal',
  })
  const [complaints, setComplaints] = useState([])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    const newComplaint = {
      id: Date.now(),
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority,
      status: 'Open',
    }

    setComplaints((prev) => [newComplaint, ...prev])
    setFormData({ subject: '', description: '', priority: 'Normal' })
  }

  return (
    <div>
      <h1>Submit a complaint</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Subject</label>
          <input
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Description</label>
          <textarea
            name="description"
            rows="4"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Normal">Normal</option>
            <option value="High">High</option>
          </select>
        </div>

        <button type="submit">Submit complaint</button>
      </form>

      <div>
        <h2>Complaints</h2>
        {complaints.length === 0 ? (
          <p>No complaints yet.</p>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint.id}>
              <h3>{complaint.subject}</h3>
              <p>{complaint.description}</p>
              <p>Priority: {complaint.priority}</p>
              <p>Status: {complaint.status}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Complaint
