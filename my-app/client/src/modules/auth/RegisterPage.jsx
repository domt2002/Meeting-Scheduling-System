import { useState } from 'react'

function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  function handleChange(event) {
    const name = event.target.name
    const value = event.target.value
    setFormData((values) => ({ ...values, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()

    console.log(formData)
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
    </form>
  )
}

export default RegisterPage
