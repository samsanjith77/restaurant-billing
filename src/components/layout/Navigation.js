import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/Navigation.css';

const Navigation = () => {
  const navItems = [
    {
      path: '/billing',
      label: 'Billing System',
      icon: '💳'
    },
    {
      path: '/dishes',
      label: 'Dish Management',
      icon: '🍽️'
    },
    {
      path: '/orders',
      label: 'Order History',
      icon: '📋'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📊'
    },
    {
      path: '/expenditure',
      label: 'Expenditure',
      icon: '📊'
    }
  ];

  return (
    <nav className="main-navigation">
      <div className="container">
        <div className="nav-content">
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
        </div>
      </div>
    </nav>
  );
};

export default Navigation;