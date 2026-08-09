import { Routes, Route, Link, useLocation} from 'react-router-dom'
import RegisterPage from './modules/auth/RegisterPage.jsx'
import LoginPage from './modules/auth/LoginPage.jsx'
import AdminRegisterPage from './modules/auth/AdminRegisterPage.jsx'
import Complaint from './modules/complaint/Complaint.jsx'
import RespondComplaint from './modules/complaint/respondComplaint.jsx'
import Dashboard from './modules/dashboard/Dashboard.jsx'
import UpdateAccountPage from './modules/Account/UpdateAccountPage.jsx'
import logo from './assets/mss-logo.png'
import './index.css'

function App() {

    const location = useLocation()
    const showAuthNav = location.pathname === '/login' || location.pathname === '/register'
  return (
    <>
        <header className="site-header">
            <Link to="/dashboard" className="site-brand">
                <img src={logo}
                     alt="MSS Logo"
                     className="site-logo"
                />

                <span className="site-name">
                    Meeting Scheduling System
                </span>
            </Link>
        </header>
        {
            showAuthNav && (
                <nav className="main-nav">
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
                </nav>
            )
        }


      <main className="page-content">
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin-register" element={<AdminRegisterPage />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/admin-complaints" element={<RespondComplaint />} />
          <Route path="/profile" element={<UpdateAccountPage />} />
          <Route path="/update-profile" element={<UpdateAccountPage />} />
        </Routes>
      </main>
    </>
  )
}

export default App
