import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/auth/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Not authenticated');
        }

        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        navigate('/login');
      }
    };

    fetchUserData();
  }, [navigate]);

  return (
    <div className="dashboard-container">
      <Navbar />
      <main className="dashboard-content">
        <h1 style={{ fontSize: '2.5rem', color: '#333', marginBottom: '1rem' }}>Dashboard</h1>
        <div className="welcome-section">
          <h1>Welcome, {user?.name || 'User'}!</h1>
          <p>Here's your project overview</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Active Projects</h3>
            <p className="metric">5</p>
            <p className="description">Currently in progress</p>
            <button onClick={() => navigate('/projects')} className="view-all-btn">View All</button>
            <button onClick={() => navigate('/projects/create')} className="create-btn">Create New</button>
          </div>

          <div className="dashboard-card">
            <h3>Tasks</h3>
            <p className="metric">12</p>
            <p className="description">Pending tasks</p>
          </div>

          <div className="dashboard-card">
            <h3>Team Members</h3>
            <p className="metric">8</p>
            <p className="description">Active collaborators</p>
          </div>

          <div className="dashboard-card">
            <h3>Completed</h3>
            <p className="metric">15</p>
            <p className="description">Projects delivered</p>
          </div>
        </div>

        <div className="recent-activity">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-time">2 hours ago</span>
              <p>New project "E-commerce Platform" created</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">5 hours ago</span>
              <p>Task "Update API Documentation" completed</p>
            </div>
            <div className="activity-item">
              <span className="activity-time">1 day ago</span>
              <p>New team member John Doe joined</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;