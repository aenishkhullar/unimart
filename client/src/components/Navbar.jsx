import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  // useLocation is used to reliably trigger a re-render when route changes
  // so the Navbar updates its auth state (reading localStorage) automatically on login/logout navigation
  const location = useLocation();

  const token = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user = null;

  try {
    if (userString) {
      user = JSON.parse(userString);
    }
  } catch (e) {
    console.error("Failed to parse user from localStorage", e);
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const navStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 2rem',
    backgroundColor: '#333',
    color: '#fff',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    fontFamily: 'sans-serif'
  };

  const linkStyle = {
    color: '#fff',
    textDecoration: 'none',
    marginLeft: '1rem',
    fontSize: '16px'
  };

  const logoutBtnStyle = {
    backgroundColor: '#dc3545',
    color: '#fff',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '4px',
    cursor: 'pointer',
    marginLeft: '1rem',
    fontSize: '16px',
    fontWeight: 'bold'
  };

  return (
    <nav style={navStyle}>
      <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Link to="/" style={{ color: '#fff', textDecoration: 'none' }}>UniMart</Link>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {token ? (
          <>
            <span style={{ marginRight: '1rem', color: '#ccc', fontSize: '16px' }}>
              Welcome, {user?.name || 'User'}
            </span>
            <Link to="/" style={linkStyle}>Home</Link>
            <Link to="/create-product" style={linkStyle}>Create Product</Link>
            <button onClick={handleLogout} style={logoutBtnStyle}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={linkStyle}>Login</Link>
            <Link to="/register" style={linkStyle}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
