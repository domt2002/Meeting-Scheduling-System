import { useState, useEffect } from 'react'

function AdminRegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [isAdmin, setIsAdmin] = useState(false)
  const [userRole, setUserRole] = useState('')

  function getStoredUser() {
    const stored = localStorage.getItem('msmAuth')
    if (!stored) return {}
    try {
      return JSON.parse(stored)
    } catch (error) {
      return {}
    }
  }

  useEffect(() => {
    const user = getStoredUser()
    setIsAdmin(user.role === 'admin')
    setUserRole(user.role || '')
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((values) => ({ ...values, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const user = getStoredUser()
    const admin = user.role === 'admin'
    setIsAdmin(admin)
    setUserRole(user.role || '')

    if (!admin) {
      setMessage('Must be logged in as an admin to register another admin.')
      return
    }

    try {
      const response = await fetch('http://localhost:3000/users/admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': 'admin'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.message || 'Admin registration failed')
        return
      }

      setMessage(`Admin account created for ${data.email}`)
      setFormData({ firstName: '', lastName: '', email: '', password: '' })
    } catch (error) {
      setMessage('Unable to connect to the server. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>{isAdmin ? 'Admin mode enabled' : 'Please login as admin first.'}</p>
      <div>
        <label>First name</label>
        <input
          name="firstName"
          type="text"
          value={formData.firstName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Last name</label>
        <input
          name="lastName"
          type="text"
          value={formData.lastName}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Email</label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div>
        <label>Password</label>
        <input
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit">Create admin account</button>
      {message && <p>{message}</p>}
    </form>
  )
}

export default AdminRegisterPage
