import {Link} from 'react-router-dom'

function AdminDashboard() {
    return (
        <div className="dashboard">
            <div className="dashboard-topbar">
                <Link to="/login" className="logout-button">
                    Log Out
                </Link>
            </div>

            <div className="dashboard-header">
                <h1>Administrator Dashboard</h1>
            </div>

            <div className="dashboard-grid">
                <Link to="/meetings" className="dashboard-card">
                    <h2>Meetings</h2>
                    <p>View and manage meetings.</p>
                </Link>

                <Link to="/rooms" className="dashboard-card">
                    <h2>Rooms</h2>
                    <p>View and manage rooms.</p>
                </Link>

                <Link to="/admin-complaints" className="dashboard-card">
                    <h2>Complaints</h2>
                    <p>Review and respond to complaints</p>
                </Link>

                <Link to="/billing" className="dashboard-card">
                    <h2>Client Billing</h2>
                    <p>Update Client Billing Information</p>
                </Link>

                <Link to="/reports" className="dashboard-card">
                    <h2>Generate Report</h2>
                    <p>Generate system report</p>
                </Link>

                <Link to="/admin-register" className="dashboard-card">
                    <h2>Create New Admin Account</h2>
                    <p>Create a new admin account</p>
                </Link>
            </div>
        </div>
    )
}

export default AdminDashboard