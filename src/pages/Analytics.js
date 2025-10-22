import React from 'react';
import '../styles/components/Analytics.css';

const Analytics = () => {
  return (
    <div className="analytics">
      {/* Header */}
      <div className="page-header">
        <h1>Analytics Dashboard</h1>
        <p>Business insights and performance metrics</p>
      </div>

      {/* Coming Soon Card */}
      <div className="coming-soon-card">
        <div className="coming-soon-icon">📊</div>
        <h2>Analytics Coming Soon</h2>
        <p>We're building powerful analytics features for you!</p>
        
        <div className="features-preview">
          <div className="feature-item">
            <span className="feature-icon">💰</span>
            <span className="feature-text">Sales Analytics</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span className="feature-text">Revenue Trends</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">👥</span>
            <span className="feature-text">Customer Insights</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">🍽️</span>
            <span className="feature-text">Popular Dishes</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">⏰</span>
            <span className="feature-text">Peak Hours</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">💸</span>
            <span className="feature-text">Expense Analysis</span>
          </div>
        </div>
      </div>

      {/* Placeholder Cards */}
      <div className="placeholder-grid">
        <div className="placeholder-card">
          <div className="placeholder-header">
            <h3>📊 Sales Overview</h3>
          </div>
          <div className="placeholder-content">
            <p>Interactive charts and graphs will be displayed here</p>
          </div>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-header">
            <h3>📈 Revenue Trends</h3>
          </div>
          <div className="placeholder-content">
            <p>Daily, weekly, and monthly revenue analysis</p>
          </div>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-header">
            <h3>🍽️ Top Selling Dishes</h3>
          </div>
          <div className="placeholder-content">
            <p>Most popular menu items and customer favorites</p>
          </div>
        </div>

        <div className="placeholder-card">
          <div className="placeholder-header">
            <h3>💸 Expense Breakdown</h3>
          </div>
          <div className="placeholder-content">
            <p>Category-wise expense analysis and insights</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
