import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import { ANALYTICS_FILTERS, SHIFT_INFO } from '../utils/constants';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import '../styles/components/Analytics.css';

const Analytics = () => {
  // State management
  const [dashboard, setDashboard] = useState(null);
  const [categoryPerformance, setCategoryPerformance] = useState(null);
  const [hourlyTrends, setHourlyTrends] = useState(null);
  const [comparison, setComparison] = useState(null);
  const [workerExpenses, setWorkerExpenses] = useState(null);
  const [materialExpenses, setMaterialExpenses] = useState(null);
  const [weeklySummary, setWeeklySummary] = useState(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filterType, setFilterType] = useState(ANALYTICS_FILTERS.TODAY);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Active section
  const [activeSection, setActiveSection] = useState('overview'); // overview, details, expenses

  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${parseFloat(value).toFixed(1)}%`;
  };

  // Get balance class
  const getBalanceClass = (balance) => {
    const num = parseFloat(balance);
    if (num > 0) return 'positive';
    if (num < 0) return 'negative';
    return 'neutral';
  };

  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined
      };

      console.log('📊 Loading dashboard with params:', params);
      
      const data = await ApiService.getAnalyticsDashboard(params);
      console.log('✅ Dashboard data:', data);
      
      setDashboard(data);
    } catch (err) {
      console.error('❌ Dashboard error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [filterType, selectedDate]);

  // Load category performance
  const loadCategoryPerformance = useCallback(async () => {
    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined
      };
      
      const data = await ApiService.getCategoryPerformance(params);
      setCategoryPerformance(data);
    } catch (err) {
      console.error('❌ Category performance error:', err);
    }
  }, [filterType, selectedDate]);

  // Load hourly trends
  const loadHourlyTrends = useCallback(async () => {
    try {
      const params = {
        date: selectedDate
      };
      
      const data = await ApiService.getHourlyTrends(params);
      setHourlyTrends(data);
    } catch (err) {
      console.error('❌ Hourly trends error:', err);
    }
  }, [selectedDate]);

  // Load comparison
  const loadComparison = useCallback(async () => {
    try {
      const data = await ApiService.getComparison({ type: 'day' });
      setComparison(data);
    } catch (err) {
      console.error('❌ Comparison error:', err);
    }
  }, []);

  // Load worker expenses
  const loadWorkerExpenses = useCallback(async () => {
    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined
      };
      
      const data = await ApiService.getWorkerExpenseBreakdown(params);
      setWorkerExpenses(data);
    } catch (err) {
      console.error('❌ Worker expenses error:', err);
    }
  }, [filterType, selectedDate]);

  // Load material expenses
  const loadMaterialExpenses = useCallback(async () => {
    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined
      };
      
      const data = await ApiService.getMaterialExpenseBreakdown(params);
      setMaterialExpenses(data);
    } catch (err) {
      console.error('❌ Material expenses error:', err);
    }
  }, [filterType, selectedDate]);

  // Load weekly summary
  const loadWeeklySummary = useCallback(async () => {
    try {
      const data = await ApiService.getWeeklySummary();
      setWeeklySummary(data);
    } catch (err) {
      console.error('❌ Weekly summary error:', err);
    }
  }, []);

  // Load all data
  useEffect(() => {
    loadDashboard();
    loadCategoryPerformance();
    loadHourlyTrends();
    loadComparison();
    loadWorkerExpenses();
    loadMaterialExpenses();
    loadWeeklySummary();
  }, [
    loadDashboard,
    loadCategoryPerformance,
    loadHourlyTrends,
    loadComparison,
    loadWorkerExpenses,
    loadMaterialExpenses,
    loadWeeklySummary
  ]);

  // Refresh all data
  const refreshAll = () => {
    loadDashboard();
    loadCategoryPerformance();
    loadHourlyTrends();
    loadComparison();
    loadWorkerExpenses();
    loadMaterialExpenses();
    loadWeeklySummary();
  };

  if (loading && !dashboard) {
    return (
      <div className="analytics">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="analytics">
        <ErrorMessage message={error} onRetry={loadDashboard} />
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>📊 Analytics Dashboard</h1>
          <p>Comprehensive business insights and performance metrics</p>
        </div>
        <button className="refresh-btn" onClick={refreshAll} disabled={loading}>
          {loading ? '⏳' : '🔄'} Refresh
        </button>
      </div>

      {/* Date Filter */}
      <div className="analytics-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filterType === ANALYTICS_FILTERS.TODAY ? 'active' : ''}`}
            onClick={() => setFilterType(ANALYTICS_FILTERS.TODAY)}
          >
            📅 Today
          </button>
          <button
            className={`filter-btn ${filterType === ANALYTICS_FILTERS.YESTERDAY ? 'active' : ''}`}
            onClick={() => setFilterType(ANALYTICS_FILTERS.YESTERDAY)}
          >
            📆 Yesterday
          </button>
          <button
            className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setFilterType('custom')}
          >
            📋 Custom Date
          </button>
        </div>

        {filterType === 'custom' && (
          <div className="date-picker">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        )}
      </div>

      {/* Section Navigation */}
      <div className="section-nav">
        <button
          className={`nav-btn ${activeSection === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveSection('overview')}
        >
          🏠 Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'details' ? 'active' : ''}`}
          onClick={() => setActiveSection('details')}
        >
          📈 Details
        </button>
        <button
          className={`nav-btn ${activeSection === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveSection('expenses')}
        >
          💰 Expenses
        </button>
      </div>

      {dashboard && (
        <>
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <>
              {/* Opening Balance */}
              <div className="balance-section opening-balance">
                <div className="balance-header">
                  <h2>🏦 Opening Balance</h2>
                  <p>Starting balance for {dashboard.date}</p>
                </div>
                <div className={`balance-amount ${getBalanceClass(dashboard.opening_balance)}`}>
                  {formatCurrency(dashboard.opening_balance)}
                </div>
              </div>

              {/* Morning Shift */}
              <div className="shift-section morning-shift">
                <div className="shift-header">
                  <div className="shift-title">
                    <span className="shift-icon">{SHIFT_INFO.MORNING.icon}</span>
                    <div>
                      <h2>{SHIFT_INFO.MORNING.name}</h2>
                      <p>{dashboard.morning_shift.start_time} - {dashboard.morning_shift.end_time}</p>
                    </div>
                  </div>
                </div>

                <div className="shift-balance-flow">
                  <div className="balance-item opening">
                    <span className="balance-label">Opening</span>
                    <span className="balance-value">{formatCurrency(dashboard.morning_shift.opening_balance)}</span>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="balance-item closing">
                    <span className="balance-label">Closing</span>
                    <span className={`balance-value ${getBalanceClass(dashboard.morning_shift.closing_balance)}`}>
                      {formatCurrency(dashboard.morning_shift.closing_balance)}
                    </span>
                  </div>
                </div>

                <div className="shift-metrics">
                  <div className="metric-card revenue">
                    <div className="metric-icon">💵</div>
                    <div className="metric-content">
                      <span className="metric-label">Revenue</span>
                      <span className="metric-value">{formatCurrency(dashboard.morning_shift.revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-card expense">
                    <div className="metric-icon">💸</div>
                    <div className="metric-content">
                      <span className="metric-label">Expenses</span>
                      <span className="metric-value">{formatCurrency(dashboard.morning_shift.expenses)}</span>
                    </div>
                  </div>
                  
                  <div className={`metric-card profit ${getBalanceClass(dashboard.morning_shift.profit)}`}>
                    <div className="metric-icon">
                      {parseFloat(dashboard.morning_shift.profit) > 0 ? '📈' : '📉'}
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Profit</span>
                      <span className="metric-value">{formatCurrency(dashboard.morning_shift.profit)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-card orders">
                    <div className="metric-icon">🛒</div>
                    <div className="metric-content">
                      <span className="metric-label">Orders</span>
                      <span className="metric-value">{dashboard.morning_shift.order_count}</span>
                    </div>
                  </div>
                </div>

                {/* Morning Top Dishes */}
                {dashboard.morning_shift.top_dishes && dashboard.morning_shift.top_dishes.length > 0 && (
                  <div className="shift-top-dishes">
                    <h3>🏆 Top Performing Dishes</h3>
                    <div className="top-dishes-grid">
                      {dashboard.morning_shift.top_dishes.slice(0, 3).map((dish, index) => (
                        <div key={index} className="top-dish-card">
                          <div className="dish-rank">#{index + 1}</div>
                          <div className="dish-info">
                            <div className="dish-name">{dish.name}</div>
                            {dish.secondary_name && (
                              <div className="dish-secondary">{dish.secondary_name}</div>
                            )}
                            <div className="dish-stats">
                              <span>Qty: {dish.quantity_sold}</span>
                              <span className="dish-revenue">{formatCurrency(dish.total_revenue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Night Shift */}
              <div className="shift-section night-shift">
                <div className="shift-header">
                  <div className="shift-title">
                    <span className="shift-icon">{SHIFT_INFO.NIGHT.icon}</span>
                    <div>
                      <h2>{SHIFT_INFO.NIGHT.name}</h2>
                      <p>{dashboard.night_shift.start_time} - {dashboard.night_shift.end_time}</p>
                    </div>
                  </div>
                </div>

                <div className="shift-balance-flow">
                  <div className="balance-item opening">
                    <span className="balance-label">Opening</span>
                    <span className="balance-value">{formatCurrency(dashboard.night_shift.opening_balance)}</span>
                  </div>
                  <div className="flow-arrow">→</div>
                  <div className="balance-item closing">
                    <span className="balance-label">Closing</span>
                    <span className={`balance-value ${getBalanceClass(dashboard.night_shift.closing_balance)}`}>
                      {formatCurrency(dashboard.night_shift.closing_balance)}
                    </span>
                  </div>
                </div>

                <div className="shift-metrics">
                  <div className="metric-card revenue">
                    <div className="metric-icon">💵</div>
                    <div className="metric-content">
                      <span className="metric-label">Revenue</span>
                      <span className="metric-value">{formatCurrency(dashboard.night_shift.revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-card expense">
                    <div className="metric-icon">💸</div>
                    <div className="metric-content">
                      <span className="metric-label">Expenses</span>
                      <span className="metric-value">{formatCurrency(dashboard.night_shift.expenses)}</span>
                    </div>
                  </div>
                  
                  <div className={`metric-card profit ${getBalanceClass(dashboard.night_shift.profit)}`}>
                    <div className="metric-icon">
                      {parseFloat(dashboard.night_shift.profit) > 0 ? '📈' : '📉'}
                    </div>
                    <div className="metric-content">
                      <span className="metric-label">Profit</span>
                      <span className="metric-value">{formatCurrency(dashboard.night_shift.profit)}</span>
                    </div>
                  </div>
                  
                  <div className="metric-card orders">
                    <div className="metric-icon">🛒</div>
                    <div className="metric-content">
                      <span className="metric-label">Orders</span>
                      <span className="metric-value">{dashboard.night_shift.order_count}</span>
                    </div>
                  </div>
                </div>

                {/* Night Top Dishes */}
                {dashboard.night_shift.top_dishes && dashboard.night_shift.top_dishes.length > 0 && (
                  <div className="shift-top-dishes">
                    <h3>🏆 Top Performing Dishes</h3>
                    <div className="top-dishes-grid">
                      {dashboard.night_shift.top_dishes.slice(0, 3).map((dish, index) => (
                        <div key={index} className="top-dish-card">
                          <div className="dish-rank">#{index + 1}</div>
                          <div className="dish-info">
                            <div className="dish-name">{dish.name}</div>
                            {dish.secondary_name && (
                              <div className="dish-secondary">{dish.secondary_name}</div>
                            )}
                            <div className="dish-stats">
                              <span>Qty: {dish.quantity_sold}</span>
                              <span className="dish-revenue">{formatCurrency(dish.total_revenue)}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Final Closing Balance */}
              <div className="balance-section closing-balance">
                <div className="balance-header">
                  <h2>🏁 Final Closing Balance</h2>
                  <p>End of day balance for {dashboard.date}</p>
                </div>
                <div className={`balance-amount ${getBalanceClass(dashboard.overall.final_closing_balance)}`}>
                  {formatCurrency(dashboard.overall.final_closing_balance)}
                </div>
              </div>

              {/* Overall Summary */}
              <div className="overall-summary">
                <h2>📊 Overall Day Summary</h2>
                <div className="summary-grid">
                  <div className="summary-card total-revenue">
                    <div className="card-icon">💰</div>
                    <div className="card-content">
                      <span className="card-label">Total Revenue</span>
                      <span className="card-value">{formatCurrency(dashboard.overall.total_revenue)}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card total-expenses">
                    <div className="card-icon">💸</div>
                    <div className="card-content">
                      <span className="card-label">Total Expenses</span>
                      <span className="card-value">{formatCurrency(dashboard.overall.total_expenses)}</span>
                    </div>
                  </div>
                  
                  <div className={`summary-card total-profit ${getBalanceClass(dashboard.overall.total_profit)}`}>
                    <div className="card-icon">📈</div>
                    <div className="card-content">
                      <span className="card-label">Total Profit</span>
                      <span className="card-value">{formatCurrency(dashboard.overall.total_profit)}</span>
                    </div>
                  </div>
                  
                  <div className="summary-card total-orders">
                    <div className="card-icon">🛒</div>
                    <div className="card-content">
                      <span className="card-label">Total Orders</span>
                      <span className="card-value">{dashboard.overall.total_orders}</span>
                    </div>
                  </div>
                </div>

                {/* Profit Margin */}
                {parseFloat(dashboard.overall.total_revenue) > 0 && (
                  <div className="profit-margin-card">
                    <div className="margin-header">
                      <span>Profit Margin</span>
                      <span className="margin-value">
                        {formatPercentage((parseFloat(dashboard.overall.total_profit) / parseFloat(dashboard.overall.total_revenue)) * 100)}
                      </span>
                    </div>
                    <div className="margin-bar">
                      <div 
                        className="margin-fill"
                        style={{
                          width: `${(parseFloat(dashboard.overall.total_profit) / parseFloat(dashboard.overall.total_revenue)) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Comparison with Yesterday */}
              {comparison && (
                <div className="comparison-section">
                  <h2>📊 Today vs Yesterday</h2>
                  <div className="comparison-grid">
                    <div className="comparison-card">
                      <div className="comparison-label">Revenue Change</div>
                      <div className={`comparison-value ${parseFloat(comparison.change.revenue_percentage) >= 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(comparison.change.revenue_percentage) >= 0 ? '↑' : '↓'} 
                        {formatPercentage(Math.abs(parseFloat(comparison.change.revenue_percentage)))}
                      </div>
                      <div className="comparison-amount">{formatCurrency(comparison.change.revenue_difference)}</div>
                    </div>
                    
                    <div className="comparison-card">
                      <div className="comparison-label">Orders Change</div>
                      <div className={`comparison-value ${comparison.change.orders_difference >= 0 ? 'positive' : 'negative'}`}>
                        {comparison.change.orders_difference >= 0 ? '↑' : '↓'} 
                        {Math.abs(comparison.change.orders_difference)} orders
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* DETAILS SECTION */}
          {activeSection === 'details' && (
            <>
              {/* Overall Top Dishes */}
              {dashboard.overall.top_dishes && dashboard.overall.top_dishes.length > 0 && (
                <div className="analytics-section">
                  <h2>🏆 Best Selling Dishes (Overall)</h2>
                  <div className="dishes-table">
                    <div className="table-header">
                      <span className="col-rank">Rank</span>
                      <span className="col-name">Dish Name</span>
                      <span className="col-qty">Quantity</span>
                      <span className="col-revenue">Revenue</span>
                    </div>
                    {dashboard.overall.top_dishes.map((dish, index) => (
                      <div key={index} className="table-row">
                        <span className="col-rank">#{index + 1}</span>
                        <span className="col-name">
                          <div className="dish-name-cell">
                            {dish.name}
                            {dish.secondary_name && (
                              <span className="dish-secondary">{dish.secondary_name}</span>
                            )}
                            <span className="dish-category-badge">{dish.category}</span>
                          </div>
                        </span>
                        <span className="col-qty">{dish.quantity_sold}</span>
                        <span className="col-revenue">{formatCurrency(dish.total_revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Category Performance */}
              {categoryPerformance && categoryPerformance.categories && categoryPerformance.categories.length > 0 && (
                <div className="analytics-section">
                  <h2>📊 Category Performance</h2>
                  <div className="category-grid">
                    {categoryPerformance.categories.map((cat, index) => (
                      <div key={index} className="category-card">
                        <div className="category-header">
                          <span className="category-name">{cat.category_display}</span>
                          <span className="category-percentage">{cat.revenue_percentage}%</span>
                        </div>
                        <div className="category-stats">
                          <div className="stat">
                            <span className="stat-label">Revenue</span>
                            <span className="stat-value">{formatCurrency(cat.total_revenue)}</span>
                          </div>
                          <div className="stat">
                            <span className="stat-label">Quantity</span>
                            <span className="stat-value">{cat.total_quantity}</span>
                          </div>
                        </div>
                        <div className="category-bar">
                          <div 
                            className="category-bar-fill"
                            style={{ width: `${cat.revenue_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hourly Trends */}
              {hourlyTrends && hourlyTrends.hourly_data && hourlyTrends.hourly_data.length > 0 && (
                <div className="analytics-section">
                  <h2>⏰ Hourly Sales Trend</h2>
                  <div className="hourly-chart">
                    {hourlyTrends.hourly_data.map((item, index) => {
                      const maxRevenue = Math.max(...hourlyTrends.hourly_data.map(d => parseFloat(d.revenue)));
                      const height = maxRevenue > 0 ? (parseFloat(item.revenue) / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={index} className="hourly-bar">
                          <div 
                            className="bar-fill"
                            style={{ height: `${height}%` }}
                            title={`${item.hour}: ${formatCurrency(item.revenue)} (${item.order_count} orders)`}
                          >
                            <span className="bar-value">{formatCurrency(item.revenue)}</span>
                          </div>
                          <div className="bar-label">{item.hour}</div>
                          <div className="bar-orders">{item.order_count}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Weekly Summary */}
              {weeklySummary && (
                <div className="analytics-section">
                  <h2>📅 Last 7 Days Performance</h2>
                  <div className="weekly-stats">
                    <div className="stat-card">
                      <div className="stat-icon">💰</div>
                      <div className="stat-content">
                        <span className="stat-label">Total Revenue</span>
                        <span className="stat-value">{formatCurrency(weeklySummary.summary.total_revenue)}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📈</div>
                      <div className="stat-content">
                        <span className="stat-label">Total Profit</span>
                        <span className="stat-value">{formatCurrency(weeklySummary.summary.total_profit)}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">📊</div>
                      <div className="stat-content">
                        <span className="stat-label">Avg Daily Revenue</span>
                        <span className="stat-value">{formatCurrency(weeklySummary.summary.avg_daily_revenue)}</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon">🛒</div>
                      <div className="stat-content">
                        <span className="stat-label">Total Orders</span>
                        <span className="stat-value">{weeklySummary.summary.total_orders}</span>
                      </div>
                    </div>
                  </div>

                  {weeklySummary.best_day && (
                    <div className="best-day-card">
                      <span className="best-day-label">🏆 Best Day:</span>
                      <span className="best-day-date">{weeklySummary.best_day.day_name}</span>
                      <span className="best-day-revenue">{formatCurrency(weeklySummary.best_day.revenue)}</span>
                    </div>
                  )}

                  <div className="daily-breakdown-chart">
                    {weeklySummary.daily_breakdown.map((day, index) => {
                      const maxRevenue = Math.max(...weeklySummary.daily_breakdown.map(d => parseFloat(d.revenue)));
                      const height = maxRevenue > 0 ? (parseFloat(day.revenue) / maxRevenue) * 100 : 0;
                      
                      return (
                        <div key={index} className="daily-bar">
                          <div 
                            className="bar-fill"
                            style={{ height: `${height}%` }}
                            title={`${day.day_name}: ${formatCurrency(day.revenue)}`}
                          >
                            <span className="bar-value">{formatCurrency(day.revenue)}</span>
                          </div>
                          <div className="bar-label">{day.day_name.slice(0, 3)}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* EXPENSES SECTION */}
          {activeSection === 'expenses' && (
            <>
              {/* Worker Expenses */}
              {workerExpenses && (
                <div className="analytics-section">
                  <h2>👷 Worker Expenses</h2>
                  <div className="total-expense-card">
                    <span className="total-label">Total Worker Expense</span>
                    <span className="total-value">{formatCurrency(workerExpenses.total_worker_expense)}</span>
                  </div>

                  {workerExpenses.worker_breakdown && workerExpenses.worker_breakdown.length > 0 && (
                    <div className="expense-breakdown">
                      {workerExpenses.worker_breakdown.map((worker, index) => (
                        <div key={index} className="expense-item">
                          <div className="expense-header">
                            <span className="worker-name">{worker.worker_name}</span>
                            <span className="worker-role-badge">{worker.worker_role}</span>
                          </div>
                          <div className="expense-details">
                            <span className="expense-category">{worker.category}</span>
                            <span className="expense-amount">{formatCurrency(worker.total_amount)}</span>
                          </div>
                          <div className="expense-count">{worker.transaction_count} transactions</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Material Expenses */}
              {materialExpenses && (
                <div className="analytics-section">
                  <h2>📦 Material Expenses</h2>
                  <div className="total-expense-card">
                    <span className="total-label">Total Material Expense</span>
                    <span className="total-value">{formatCurrency(materialExpenses.total_material_expense)}</span>
                  </div>

                  {materialExpenses.material_breakdown && materialExpenses.material_breakdown.length > 0 && (
                    <div className="expense-breakdown">
                      {materialExpenses.material_breakdown.map((material, index) => (
                        <div key={index} className="expense-item">
                          <div className="expense-header">
                            <span className="material-name">{material.material_name}</span>
                            <span className="material-unit-badge">{material.unit}</span>
                          </div>
                          <div className="expense-details">
                            <div className="expense-stat">
                              <span className="stat-label">Quantity</span>
                              <span className="stat-value">{material.total_quantity}</span>
                            </div>
                            <div className="expense-stat">
                              <span className="stat-label">Avg Price</span>
                              <span className="stat-value">{formatCurrency(material.avg_unit_price)}</span>
                            </div>
                            <div className="expense-stat">
                              <span className="stat-label">Total</span>
                              <span className="stat-value">{formatCurrency(material.total_amount)}</span>
                            </div>
                          </div>
                          <div className="expense-count">{material.purchase_count} purchases</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default Analytics;
