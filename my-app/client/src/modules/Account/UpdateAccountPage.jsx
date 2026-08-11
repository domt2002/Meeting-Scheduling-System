import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'

function UpdateAccountPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    billingAddress: '',
    creditCardNumber: '',
    expirationDate: '',
    cvv: ''
  })
  const [message, setMessage] = useState('')
  const [redirectToLogin, setRedirectToLogin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('msmAuth')
    if (!stored) {
      setRedirectToLogin(true)
      return
    }

    let user
    try {
      user = JSON.parse(stored)
    } catch (error) {
      localStorage.removeItem('msmAuth')
      setRedirectToLogin(true)
      return
    }

    async function fetchProfile() {
      try {
        const response = await fetch(`http://localhost:3000/users/${user.id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user.token}`,
            userRole: user.role,
            userId: user.id
          }
        })

        if (!response.ok) {
          setMessage('Unable to load profile. Please log in again.')
          setRedirectToLogin(true)
          return
        }

        const data = await response.json()
        setFormData({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          email: data.email || '',
          password: '',
          billingAddress: data.billingAddress || '',
          creditCardNumber: data.creditCardNumber || '',
          expirationDate: data.expirationDate || '',
          cvv: data.cvv || ''
        })
      } catch (error) {
        setMessage('Unable to connect to the server. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setMessage('')

    const stored = localStorage.getItem('msmAuth')
    if (!stored) {
      setRedirectToLogin(true)
      return
    }

    let user
    try {
      user = JSON.parse(stored)
    } catch (error) {
      localStorage.removeItem('msmAuth')
      setRedirectToLogin(true)
      return
    }

    try {
      const response = await fetch(`http://localhost:3000/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
          userRole: user.role,
          userId: user.id
        },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          billingAddress: formData.billingAddress,
          creditCardNumber: formData.creditCardNumber,
          expirationDate: formData.expirationDate,
          cvv: formData.cvv
        })
      })

      const data = await response.json()
      if (!response.ok) {
        setMessage(data.message || 'Profile update failed')
        return
      }

      const updatedAuth = {
        ...user,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email
      }
      localStorage.setItem('msmAuth', JSON.stringify(updatedAuth))
      setMessage(data.message || 'Profile updated successfully')
      setFormData((prev) => ({ ...prev, password: '' }))
    } catch (error) {
      setMessage('Unable to connect to the server. Please try again.')
    }
  }

  if (redirectToLogin) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return <p>Loading profile...</p>
  }

  return (
    <div className="update-profile">
      <h1>Update Profile</h1>
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
          <label>New password</label>
          <input
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Leave blank to keep current password"
          />
        </div>

        <h2>Billing Information</h2>
        <div>
          <label>Billing Address</label>
          <input
            name="billingAddress"
            type="text"
            value={formData.billingAddress}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Credit Card Number</label>
          <input
            name="creditCardNumber"
            type="text"
            value={formData.creditCardNumber}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>Expiration Date</label>
          <input
            name="expirationDate"
            type="text"
            value={formData.expirationDate}
            onChange={handleChange}
            placeholder="MM/YY"
          />
        </div>
        <div>
          <label>CVV</label>
          <input
            name="cvv"
            type="text"
            value={formData.cvv}
            onChange={handleChange}
          />
        </div>

        <button type="submit">Save profile</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  )
}

export default UpdateAccountPage
