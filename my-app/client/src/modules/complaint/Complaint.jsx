import { useEffect, useState } from 'react'

function Complaint() {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'Normal',
  })
  const [complaints, setComplaints] = useState([])
  const [canSubmit, setCanSubmit] = useState(false)
  const [authMessage, setAuthMessage] = useState('')

  function getStoredUser() {
    const stored = localStorage.getItem('msmAuth')
    if (!stored) return null
    try {
      return JSON.parse(stored)
    } catch (error) {
      return null
    }
  }

  useEffect(() => {
    const user = getStoredUser()
    if (!user) {
      setCanSubmit(false)
      setAuthMessage('Please log in as a client to submit a complaint.')
      return
    }

    if (user.role === 'client') {
      setCanSubmit(true)
      setAuthMessage('')
      fetch('http://localhost:3000/complaints', {
        headers: {
          userRole: user.role,
          userEmail: user.email
        }
      })
        .then((res) => res.json())
        .then((data) => setComplaints(data))
        .catch(() => {
          setComplaints([])
        })
    } else {
      setCanSubmit(false)
      setAuthMessage('Only clients can submit complaints.')
    }
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!canSubmit) {
      setAuthMessage('Only clients can submit complaints.')
      return
    }

    const user = getStoredUser()
    if (!user || user.role !== 'client') {
      setAuthMessage('Only clients can submit complaints.')
      return
    }

    const complaintRequest = {
      subject: formData.subject,
      description: formData.description,
      priority: formData.priority,
      submittedBy: `${user.firstName} ${user.lastName}`,
      submittedByEmail: user.email,
      role: user.role
    }

    try {
      const response = await fetch('http://localhost:3000/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          userRole: user.role,
          userEmail: user.email
        },
        body: JSON.stringify(complaintRequest)
      })

      const data = await response.json()
      if (!response.ok) {
        setAuthMessage(data.message || 'Failed to submit complaint.')
        return
      }

      setComplaints((prev) => [data, ...prev])
      setFormData({ subject: '', description: '', priority: 'Normal' })
      setAuthMessage('Complaint submitted successfully.')
    } catch (error) {
      setAuthMessage('Unable to connect to the server. Please try again.')
    }
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

        <button type="submit" disabled={!canSubmit}>Submit complaint</button>
      </form>

      {authMessage && <p style={{ color: 'red' }}>{authMessage}</p>}

      <div>
        <h2>Complaints</h2>
        {complaints.length === 0 ? (
          <p>No complaints yet.</p>
        ) : (
          complaints.map((complaint) => (
            <div key={complaint._id}>
              <h3>{complaint.subject}</h3>
              <p>{complaint.description}</p>
              <p>Priority: {complaint.priority}</p>
              <p>Status: {complaint.status}</p>
              <p>
                <strong>Response:</strong>{' '}
                {complaint.response ? complaint.response : 'No response yet.'}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Complaint
