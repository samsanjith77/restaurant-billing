import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import Header from './Header';
import '../../styles/components/Layout.css';

const Layout = () => {
  return (
    <div className="app-layout">
      <Header />
      <main className="content">
        <Outlet />
      </main>
      
      {/* Mobile Bottom Navigation - Inline */}
      <nav className="bottom-nav">
        <NavLink to="/billing" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">💰</span>
          <span className="nav-label">Billing</span>
        </NavLink>
        <NavLink to="/dishes" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">🍽️</span>
          <span className="nav-label">Dishes</span>
        </NavLink>
        <NavLink to="/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Orders</span>
        </NavLink>
        <NavLink to="/expenditure" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">💸</span>
          <span className="nav-label">Expense</span>
        </NavLink>
        <NavLink to="/analytics" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">📊</span>
          <span className="nav-label">Analytics</span>
        </NavLink>
      </nav>
    </div>
  );
};

export default Layout;
