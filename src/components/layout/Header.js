import React, { useEffect, useState } from 'react';
import { useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/components/Header.css';


const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, isAdmin, logout } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);


  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };


    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);


  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/login');
    }
  };


  const handleLogin = () => {
    navigate('/login');
  };


  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="brand">
            <h1 className="restaurant-name">Appatha's Kitchen</h1>
            <span className="tagline">Restaurant Management System</span>
          </div>


          {isAuthenticated && (
            <nav className="header-main-nav">
              <NavLink to="/billing" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                💰 Billing
              </NavLink>
              <NavLink to="/dishes" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                🍽️ Dishes
              </NavLink>
              <NavLink to="/dish-ordering" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                🔄 Ordering
              </NavLink>
              <NavLink to="/orders" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                📋 Orders
              </NavLink>
              <NavLink to="/expenditure" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                💸 Expenditure
              </NavLink>
              {/* Show Analytics only for Admin */}
              {isAdmin && (
                <NavLink to="/analytics" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
                  📊 Analytics
                </NavLink>
              )}
            </nav>
          )}


          <nav className="header-nav">
            {isAuthenticated ? (
              <div className="header-actions">
                {/* Show user info */}
                {user && (
                  <div className="user-info">
                    <span className="username">{user.username}</span>
                    {isAdmin && <span className="admin-badge">Admin</span>}
                  </div>
                )}
                
                {/* Show Register button only for Admin */}
                {isAdmin && (
                  <button className="btn btn--register" onClick={() => navigate('/register')}>
                    + New User
                  </button>
                )}
                
                <button className="btn btn--outline" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn--outline" onClick={handleLogin}>
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};


export default Header;
