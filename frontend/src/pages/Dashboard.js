import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import './Dashboard.css';

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load dashboard statistics');
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!stats) return null;

  return (
    <div className="container">
      <h1>Dashboard</h1>
      
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_members}</div>
            <div className="stat-label">Total Members</div>
          </div>
        </div>

        <div className="stat-card stat-success">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.active_members}</div>
            <div className="stat-label">Active Members</div>
          </div>
        </div>

        <div className="stat-card stat-warning">
          <div className="stat-icon">⚠️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.expiring_soon}</div>
            <div className="stat-label">Expiring Soon</div>
          </div>
        </div>

        <div className="stat-card stat-info">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.today_attendance}</div>
            <div className="stat-label">Today's Attendance</div>
          </div>
        </div>

        <div className="stat-card stat-active">
          <div className="stat-icon">🏃</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currently_checked_in}</div>
            <div className="stat-label">Currently In Gym</div>
          </div>
        </div>

        <div className="stat-card stat-revenue">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">₱{stats.monthly_revenue.toLocaleString()}</div>
            <div className="stat-label">Monthly Revenue</div>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button className="btn btn-primary" onClick={() => window.location.href = '/attendance'}>
            Check-In Member
          </button>
          <button className="btn btn-secondary" onClick={() => window.location.href = '/members'}>
            Add New Member
          </button>
          <button className="btn btn-success" onClick={() => window.location.href = '/payments'}>
            Record Payment
          </button>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
