import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/dashboard" onClick={closeMobileMenu}>🏋️ Gym Management</Link>
        </div>
        
        <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
          ☰
        </button>
        
        <ul className={`navbar-menu ${mobileMenuOpen ? 'active' : ''}`}>
          <li className={location.pathname === '/dashboard' ? 'active' : ''}>
            <Link to="/dashboard" onClick={closeMobileMenu}>Dashboard</Link>
          </li>
          <li className={location.pathname === '/members' ? 'active' : ''}>
            <Link to="/members" onClick={closeMobileMenu}>Members</Link>
          </li>
          <li className={location.pathname === '/attendance' ? 'active' : ''}>
            <Link to="/attendance" onClick={closeMobileMenu}>Attendance</Link>
          </li>
          <li className={location.pathname === '/payments' ? 'active' : ''}>
            <Link to="/payments" onClick={closeMobileMenu}>Payments</Link>
          </li>
          {user.role === 'Admin' && (
            <li className={location.pathname === '/settings' ? 'active' : ''}>
              <Link to="/settings" onClick={closeMobileMenu}>Settings</Link>
            </li>
          )}
          <li className="mobile-only">
            <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="mobile-logout-btn">
              Logout ({user.name})
            </button>
          </li>
        </ul>
        
        <div className="navbar-user">
          <span className="user-name">
            {user.name} ({user.role})
          </span>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
