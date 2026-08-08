import { Navigate } from 'react-router-dom'
import ClientDashboard from './ClientDashboard.jsx'
import AdminDashboard from "./AdminDashboard.jsx";

function Dashboard() {

    function getStoredUser() {
        const stored = localStorage.getItem('msmAuth')
        if (!stored) return null
        try {
            return JSON.parse(stored)
        } catch (error) {
            return null
        }
    }

    const user = getStoredUser()
    if (!user) {
        return <Navigate to="/login" replace />
    }

    if (user.role === 'client') {
        return <ClientDashboard/>
    }
    if (user.role === 'admin') {
        return <AdminDashboard/>
    }

    return <Navigate to="/login" replace />
}

export default Dashboard


/*server is unable to connect to my ip address
import ClientDashboard from './ClientDashboard.jsx'
import AdminDashboard from './AdminDashboard.jsx'

function Dashboard() {
    // TEMPORARY FOR TESTING
    const user = {
        role: 'admin'
    }

    if (user.role === 'admin') {
        return <AdminDashboard />
    }

    return <ClientDashboard />
}

export default Dashboard

 */

