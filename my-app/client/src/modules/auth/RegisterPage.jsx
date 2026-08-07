import { useState } from 'react'

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })
  const [message, setMessage] = useState('')

  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value
    setFormData((values) => ({ ...values, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    try {
      const response = await fetch('http://localhost:3000/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setMessage(errorData.message || 'Registration failed')
        return
      }

      const user = await response.json()
      setMessage(`Account created for ${user.email}`)
      setFormData({ firstName: '', lastName: '', email: '', password: '' })
    } catch (error) {
      setMessage('Unable to connect to the server. Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
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

      <button type="submit">Create account</button>
      {message && <p>{message}</p>}
    </form>
  )
}

export default RegisterPage
