import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

function AdminBillingPage() {
  const [clients, setClients] = useState([])
  const [selected, setSelected] = useState(null)
  const [formData, setFormData] = useState({ billingAddress: '', creditCardNumber: '', expirationDate: '', cvv: '' })
  const [message, setMessage] = useState('')
  const [redirectToLogin, setRedirectToLogin] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('msmAuth')
    if (!stored) {
      setRedirectToLogin(true)
      return
    }

    let auth
    try {
      auth = JSON.parse(stored)
    } catch (e) {
      localStorage.removeItem('msmAuth')
      setRedirectToLogin(true)
      return
    }

    if (auth.role !== 'admin') {
      setMessage('Admin access required')
      return
    }

    async function fetchClients() {
      try {
        const res = await fetch('http://localhost:3000/users/billing/filled', {
          headers: { Authorization: `Bearer ${auth.token}` }
        })
        if (!res.ok) {
          const err = await res.json()
          setMessage(err.message || 'Failed to load clients')
          return
        }
        const data = await res.json()
        setClients(data)
      } catch (e) {
        setMessage('Unable to connect to server')
      }
    }

    fetchClients()
  }, [])

  function handleSelect(client) {
    setMessage('')
    setSelected(client)
    const stored = localStorage.getItem('msmAuth')
    if (!stored) return
    const auth = JSON.parse(stored)

    fetch(`http://localhost:3000/users/${client.id}`, {
      headers: {
        Authorization: `Bearer ${auth.token}`,
        userRole: auth.role,
        userId: auth.id
      }
    }).then(r => r.json()).then(data => {
      setFormData({
        billingAddress: data.billingAddress || '',
        creditCardNumber: data.creditCardNumber || '',
        expirationDate: data.expirationDate || '',
        cvv: data.cvv || ''
      })
    }).catch(() => setMessage('Failed to load client details'))
  }

  function handleChange(e) {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!selected) return
    setMessage('')
    const stored = localStorage.getItem('msmAuth')
    if (!stored) {
      setRedirectToLogin(true)
      return
    }
    const auth = JSON.parse(stored)

    try {
      const res = await fetch(`http://localhost:3000/users/${selected.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
          userRole: auth.role,
          userId: auth.id
        },
        body: JSON.stringify(formData)
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.message || 'Update failed')
        return
      }
      setMessage(data.message || 'Updated successfully')
    } catch (e) {
      setMessage('Unable to connect to server')
    }
  }

  if (redirectToLogin) return <Navigate to="/login" replace />

  return (
    <div>
      <h1>Client Billing Management</h1>
      {message && <p>{message}</p>}

      <div style={{ display: 'flex', gap: '24px' }}>
        <div style={{ minWidth: 240 }}>
          <h3>Clients with billing info</h3>
          <ul>
            {clients.map(c => (
              <li key={c.id}>
                <button onClick={() => handleSelect(c)}>{c.firstName} {c.lastName}</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ flex: 1 }}>
          {selected ? (
            <form onSubmit={handleSubmit}>
              <h3>Update billing for {selected.firstName} {selected.lastName}</h3>
              <div>
                <label>Billing Address</label>
                <input name="billingAddress" value={formData.billingAddress} onChange={handleChange} />
              </div>
              <div>
                <label>Credit Card Number</label>
                <input name="creditCardNumber" value={formData.creditCardNumber} onChange={handleChange} />
              </div>
              <div>
                <label>Expiration Date</label>
                <input name="expirationDate" value={formData.expirationDate} onChange={handleChange} placeholder="MM/YY" />
              </div>
              <div>
                <label>CVV</label>
                <input name="cvv" value={formData.cvv} onChange={handleChange} />
              </div>
              <button type="submit">Save</button>
            </form>
          ) : (
            <p>Select a client to edit billing information.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminBillingPage
