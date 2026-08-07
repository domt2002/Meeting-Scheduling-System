import { Routes, Route, Link } from 'react-router-dom'
import RegisterPage from './modules/auth/RegisterPage.jsx'
import LoginPage from './modules/auth/LoginPage.jsx'
import AdminRegisterPage from './modules/auth/AdminRegisterPage.jsx'
import Complaint from './modules/complaint/Complaint.jsx'

function App() {
  return (
    <>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/admin-register">Admin Register</Link>
        <Link to="/complaint">Complaint</Link>
      </nav>
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin-register" element={<AdminRegisterPage />} />
        <Route path="/complaint" element={<Complaint />} />
      </Routes>
    </>
  )
}

export default App
