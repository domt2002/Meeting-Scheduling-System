import {Link} from 'react-router-dom'

function Dashboard() {
    return(
        <div className="dashboard">
            <h1>Dashboard</h1>

            <div className="dashboard-options">
                <Link to="/complaint">Submit Complaint</Link>

                <Link to="/admin-complaints">Register Admin</Link>

                <Link to="/admin-complaints">View Complaints</Link>
            </div>
        </div>
    )
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

