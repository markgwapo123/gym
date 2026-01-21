import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import './Settings.css';

function Settings() {
  const { user } = useAuth();
  const [prices, setPrices] = useState({
    Daily: 50,
    Monthly: 500,
    Quarterly: 1350,
    Annual: 5000
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Load prices from localStorage
    const savedPrices = localStorage.getItem('membershipPrices');
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
  }, []);

  const handleSave = () => {
    // Save prices to localStorage
    localStorage.setItem('membershipPrices', JSON.stringify(prices));
    setMessage({ type: 'success', text: 'Membership prices updated successfully!' });
    setIsEditing(false);
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('pricesUpdated', { detail: prices }));
  };

  const handleCancel = () => {
    // Reload prices from localStorage
    const savedPrices = localStorage.getItem('membershipPrices');
    if (savedPrices) {
      setPrices(JSON.parse(savedPrices));
    }
    setIsEditing(false);
  };

  if (user.role !== 'Admin') {
    return (
      <div className="container">
        <div className="card">
          <h2>Access Denied</h2>
          <p>Only administrators can access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Settings</h1>
        {!isEditing && (
          <button className="btn btn-primary" onClick={() => setIsEditing(true)}>
            ✏️ Edit Prices
          </button>
        )}
      </div>

      {message.text && (
        <div className={`alert alert-${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Membership Subscription Prices</h2>
        <p style={{ color: '#666', marginBottom: '20px' }}>
          Set the default prices for each membership type. These prices will be used when adding new members.
        </p>

        <div className="settings-grid">
          <div className="price-item">
            <label>
              <strong>Daily Membership</strong>
              <span style={{ fontSize: '0.9em', color: '#666' }}> (1 day access)</span>
            </label>
            <div className="price-input-group">
              <span className="currency-symbol">₱</span>
              <input
                type="number"
                value={prices.Daily}
                onChange={(e) => setPrices({ ...prices, Daily: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="price-item">
            <label>
              <strong>Monthly Membership</strong>
              <span style={{ fontSize: '0.9em', color: '#666' }}> (30 days access)</span>
            </label>
            <div className="price-input-group">
              <span className="currency-symbol">₱</span>
              <input
                type="number"
                value={prices.Monthly}
                onChange={(e) => setPrices({ ...prices, Monthly: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="price-item">
            <label>
              <strong>Quarterly Membership</strong>
              <span style={{ fontSize: '0.9em', color: '#666' }}> (3 months access)</span>
            </label>
            <div className="price-input-group">
              <span className="currency-symbol">₱</span>
              <input
                type="number"
                value={prices.Quarterly}
                onChange={(e) => setPrices({ ...prices, Quarterly: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="1"
              />
            </div>
          </div>

          <div className="price-item">
            <label>
              <strong>Annual Membership</strong>
              <span style={{ fontSize: '0.9em', color: '#666' }}> (1 year access)</span>
            </label>
            <div className="price-input-group">
              <span className="currency-symbol">₱</span>
              <input
                type="number"
                value={prices.Annual}
                onChange={(e) => setPrices({ ...prices, Annual: parseFloat(e.target.value) || 0 })}
                disabled={!isEditing}
                min="0"
                step="1"
              />
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="settings-actions">
            <button className="btn btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button className="btn btn-success" onClick={handleSave}>
              Save Changes
            </button>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '20px' }}>
        <h3>Note</h3>
        <ul style={{ paddingLeft: '20px', color: '#666' }}>
          <li>These prices will be automatically suggested when adding new members</li>
          <li>You can still manually adjust the payment amount for individual members</li>
          <li>Changes take effect immediately for new member registrations</li>
        </ul>
      </div>
    </div>
  );
}

export default Settings;
