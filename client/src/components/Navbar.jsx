import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import '../pages/Home.css';

const Navbar = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef   = useRef(null);

  const token      = localStorage.getItem('token');
  const userString = localStorage.getItem('user');
  let user         = null;

  try {
    if (userString) user = JSON.parse(userString);
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
  }

  /* Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  /* Close on route change */
  useEffect(() => { setMenuOpen(false); }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setMenuOpen(false);
    navigate('/login');
  };

  /* Generate initials for avatar */
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <header className="editorial-nav">
      <nav className="editorial-nav-inner" aria-label="Main navigation">

        {/* ─── Brand ─── */}
        <Link to="/" className="nav-brand" id="nav-brand-link">
          Uni<span>Mart</span>
        </Link>

        {/* ─── Centre links ─── */}
        <div className="nav-links">
          <Link to="/" id="nav-home-link" className="nav-link">Home</Link>
          <Link to="/browse" id="nav-browse-link" className="nav-link">Browse</Link>
          {token && (
            <Link to="/create-product" id="nav-list-link" className="nav-link">
              List Item
            </Link>
          )}
        </div>

        {/* ─── Auth actions ─── */}
        <div className="nav-actions">
          {token ? (
            <div className="nav-profile-wrapper" ref={menuRef}>
              {/* Circular avatar button */}
              <button
                id="nav-profile-btn"
                className="nav-avatar-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-label="Profile menu"
                aria-expanded={menuOpen}
              >
                <span className="nav-avatar-initials">
                  {getInitials(user?.name)}
                </span>
                <span className="nav-avatar-chevron" style={{
                  transform: menuOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s ease',
                }}>
                  ▾
                </span>
              </button>

              {/* Dropdown menu */}
              {menuOpen && (
                <div className="nav-profile-dropdown" role="menu">
                  <div className="nav-dropdown-header">
                    <div className="nav-dropdown-avatar">
                      {getInitials(user?.name)}
                    </div>
                    <div>
                      <div className="nav-dropdown-name">{user?.name || 'Student'}</div>
                      <div className="nav-dropdown-email">{user?.email || ''}</div>
                    </div>
                  </div>
                  <div className="nav-dropdown-divider" />
                  <Link to="/my-orders" id="nav-my-orders-link" className="nav-dropdown-item" role="menuitem">
                    <span>🛍️</span> My Orders
                  </Link>
                  <Link to="/wishlist" id="nav-wishlist-link" className="nav-dropdown-item" role="menuitem">
                    <span>🔖</span> Saved Items
                  </Link>
                  <Link to="/messages" id="nav-messages-link" className="nav-dropdown-item" role="menuitem">
                    <span>💬</span> Messages
                  </Link>
                  <Link to="/seller-dashboard" id="nav-seller-dashboard-link" className="nav-dropdown-item" role="menuitem">
                    <span>📈</span> Seller Dashboard
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <Link to="/create-product" className="nav-dropdown-item" role="menuitem">
                    <span>➕</span> List an Item
                  </Link>
                  <div className="nav-dropdown-divider" />
                  <button
                    id="nav-logout-btn"
                    className="nav-dropdown-item nav-dropdown-logout"
                    onClick={handleLogout}
                    role="menuitem"
                  >
                    <span>🚪</span> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" id="nav-login-link" className="nav-btn-ghost">
                Log in
              </Link>
              <Link to="/register" id="nav-register-link" className="nav-btn-primary">
                Sign up →
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
