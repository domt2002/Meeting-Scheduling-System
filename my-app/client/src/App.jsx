import { Routes, Route, Link } from 'react-router'
import RegisterPage from './modules/auth/RegisterPage.jsx'
import LoginPage from './modules/auth/LoginPage.jsx'

function App() {
  return (
    <>
      <nav>
        <Link to ="/login">Login</Link>
        <Link to ="/register">Register</Link>
      </nav>
      
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage/>} />
      </Routes>
    </>
  )
}

export default App
