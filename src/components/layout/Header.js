import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    // Add event listener
    window.addEventListener('scroll', handleScroll);

    // Cleanup function
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container">
        <div className="header-content">
          <div className="brand">
            <h1 className="restaurant-name">Appatha's Kitchen</h1>
            <span className="tagline">Restaurant Management System</span>
          </div>
          <nav className="header-nav">
            {user ? (
              <div className="user-menu">
                <span className="welcome">Welcome, {user.name}</span>
                <button className="btn btn--outline" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn--outline">
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
