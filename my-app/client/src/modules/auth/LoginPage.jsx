import { useState } from 'react'

function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:3000/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.message || 'Login failed')
        setSuccess(false)
        return
      }

      setMessage(data.message || `Welcome back, ${data.firstName}`)
      setSuccess(true)
      setFormData({ email: '', password: '' })
    } catch (error) {
      setMessage('Unable to connect to the server. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <button type="submit">Login</button>
      {message && (
        <p style={{ color: success ? 'green' : 'red' }}>{message}</p>
      )}
    </form>
  )
}

export default LoginPage
