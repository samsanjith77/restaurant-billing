import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { path: '/billing', label: 'Billing', icon: '💰' },
    { path: '/dishes', label: 'Dishes', icon: '🍽️' },
    { path: '/orders', label: 'Orders', icon: '📋' },
    { path: '/expenditure', label: 'Expenditure', icon: '💸' },
    { path: '/register', label: 'Register User', icon: '👤' }
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `nav-item ${isActive ? 'nav-item--active' : ''}`
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
