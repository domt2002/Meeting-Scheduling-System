import { useEffect, useState } from 'react'

function RespondComplaint() {
  const [complaints, setComplaints] = useState([])
  const [message, setMessage] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('msmAuth')
    if (!stored) {
      setMessage('Please log in as an admin to answer complaints.')
      return
    }

    try {
      const user = JSON.parse(stored)
      if (user.role !== 'admin') {
        setMessage('Only admins can view and answer complaints.')
        return
      }

      setIsAdmin(true)
      setAdminEmail(user.email)
      fetchComplaints(user.email)
    } catch {
      setMessage('Please log in as an admin to answer complaints.')
    }
  }, [])

  function fetchComplaints(email) {
    fetch('http://localhost:3000/complaints', {
        headers: {
        Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('msmAuth')).token
      }
    })
      .then((res) => res.json())
      .then(setComplaints)
      .catch(() => setMessage('Unable to load complaints.'))
  }

  async function handleResponseSubmit(id, responseText) {
    if (!responseText.trim()) {
      setMessage('Enter a response before saving.')
      return
    }

    const res = await fetch(`http://localhost:3000/complaints/${id}/response`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json',
              Authorization: 'Bearer ' + JSON.parse(localStorage.getItem('msmAuth')).token
      },
      body: JSON.stringify({ response: responseText })
    })

    const data = await res.json()
    if (!res.ok) {
      setMessage(data.message || 'Failed to save response.')
      return
    }

    setComplaints((items) => items.map((item) => (item._id === data._id ? data : item)))
    setMessage('Response saved successfully.')
  }

  function updateDraft(id, value) {
    setComplaints((items) => items.map((item) => item._id === id ? { ...item, responseDraft: value } : item))
  }

  return (
    <div>
      <h1>Admin Complaint Responses</h1>
      {message && <p style={{ color: 'red' }}>{message}</p>}
      {!isAdmin && <p>Access restricted to admins only.</p>}

      {isAdmin && complaints.length === 0 && <p>No complaints available.</p>}

      {isAdmin && complaints.map((complaint) => (
        <div key={complaint._id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
          <p><strong>Subject:</strong> {complaint.subject}</p>
          <p><strong>Description:</strong> {complaint.description}</p>
          <p><strong>Submitted by:</strong> {complaint.submittedBy} ({complaint.submittedByEmail})</p>
          <p><strong>Priority:</strong> {complaint.priority}</p>
          <p><strong>Status:</strong> {complaint.status}</p>
          <p><strong>Response:</strong> {complaint.response || 'No response yet.'}</p>

          <div>
            <label>Answer complaint</label>
            <textarea
              rows="3"
              value={complaint.responseDraft || ''}
              onChange={(event) => updateDraft(complaint._id, event.target.value)}
            />
          </div>

          <button type="button" onClick={() => handleResponseSubmit(complaint._id, complaint.responseDraft || '')}>
            Save Response
          </button>
        </div>
      ))}
    </div>
  )
}

export default RespondComplaint
