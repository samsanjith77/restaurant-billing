import React from 'react';
import '../../styles/components/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="restaurant-name">Delicious Kitchen</h1>
          <nav className="nav">
            {/* Future: Add login/logout functionality */}
            <button className="btn btn--outline">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;