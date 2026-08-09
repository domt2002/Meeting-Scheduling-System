import {Link} from 'react-router-dom'

function ClientDashboard() {
    return(
    <div className="dashboard">
        <div className="dashboard-topbar">
            <Link to="/profile" className="topbar-link">
                Profile
            </Link>

            <Link to="/login" className="logout-button">
                Log Out
            </Link>
        </div>



        <div className="dashboard-grid">
            <Link to="/meetings" className="dashboard-card">
                <h2>Meetings</h2>
                <p>View your scheduled meetings.</p>
            </Link>

            <Link to="/complaint" className="dashboard-card">
                <h2>Complaints</h2>
                <p>View and manage your complaints</p>
            </Link>

            <Link to="/inbox" className="dashboard-card">
                <h2>Inbox</h2>
                <p>View meeting invitations and ownership transfer requests</p>
            </Link>
            <Link to="/update-profile" className="dashboard-card">
                <h2>Update Profile</h2>
                <p>Update your profile information and set billing information.</p>
            </Link>
        </div>
    </div>
    )
}

export default ClientDashboard