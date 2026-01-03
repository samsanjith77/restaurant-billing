import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import ApiService from '../services/api';
import { ANALYTICS_FILTERS } from '../utils/constants';
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
  const [activeSection, setActiveSection] = useState('overview');

  // Chart colors
  const COLORS = {
    primary: '#6366f1',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    purple: '#8b5cf6',
    pink: '#ec4899',
    teal: '#14b8a6'
  };

  const CATEGORY_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#14b8a6', '#f97316'];


  // Format currency
  const formatCurrency = (amount) => {
    const num = parseFloat(amount);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format compact currency for charts
  const formatCompactCurrency = (value) => {
    if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
    if (value >= 1000) return `₹${(value / 1000).toFixed(1)}K`;
    return `₹${value.toFixed(0)}`;
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

  // Get trend indicator
  const getTrendIndicator = (value) => {
    const num = parseFloat(value);
    if (num > 0) return { icon: '↑', class: 'trend-up' };
    if (num < 0) return { icon: '↓', class: 'trend-down' };
    return { icon: '→', class: 'trend-neutral' };
  };


  // Load dashboard data
  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined,
        timezone: 'Asia/Kolkata'
      };

      const data = await ApiService.getAnalyticsDashboard(params);
      setDashboard(data);
    } catch (err) {
      console.error('Dashboard error:', err);
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
        date: filterType === 'custom' ? selectedDate : undefined,
        timezone: 'Asia/Kolkata'
      };
      
      const data = await ApiService.getCategoryPerformance(params);
      setCategoryPerformance(data);
    } catch (err) {
      console.error('Category performance error:', err);
    }
  }, [filterType, selectedDate]);


  // Load hourly trends
  const loadHourlyTrends = useCallback(async () => {
    try {
      const params = {
        date: selectedDate,
        timezone: 'Asia/Kolkata'
      };
      
      const data = await ApiService.getHourlyTrends(params);
      setHourlyTrends(data);
    } catch (err) {
      console.error('Hourly trends error:', err);
    }
  }, [selectedDate]);


  // Load comparison
  const loadComparison = useCallback(async () => {
    try {
      const data = await ApiService.getComparison({ type: 'day', timezone: 'Asia/Kolkata' });
      setComparison(data);
    } catch (err) {
      console.error('Comparison error:', err);
    }
  }, []);


  // Load worker expenses
  const loadWorkerExpenses = useCallback(async () => {
    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined,
        timezone: 'Asia/Kolkata'
      };
      
      const data = await ApiService.getWorkerExpenseBreakdown(params);
      setWorkerExpenses(data);
    } catch (err) {
      console.error('Worker expenses error:', err);
    }
  }, [filterType, selectedDate]);


  // Load material expenses
  const loadMaterialExpenses = useCallback(async () => {
    try {
      const params = {
        filter: filterType,
        date: filterType === 'custom' ? selectedDate : undefined,
        timezone: 'Asia/Kolkata'
      };
      
      const data = await ApiService.getMaterialExpenseBreakdown(params);
      setMaterialExpenses(data);
    } catch (err) {
      console.error('Material expenses error:', err);
    }
  }, [filterType, selectedDate]);


  // Load weekly summary
  const loadWeeklySummary = useCallback(async () => {
    try {
      const data = await ApiService.getWeeklySummary({ timezone: 'Asia/Kolkata' });
      setWeeklySummary(data);
    } catch (err) {
      console.error('Weekly summary error:', err);
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


  // Custom tooltip for charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.name.includes('Revenue') || entry.name.includes('Amount') ? formatCurrency(entry.value) : entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
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
      <div className="analytics-header">
        <div className="header-content">
          <h1 className="page-title">Analytics Dashboard</h1>
          <p className="page-subtitle">Comprehensive business insights and performance metrics</p>
        </div>
        <button className="btn-refresh" onClick={refreshAll} disabled={loading}>
          <svg className="icon-refresh" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>


      {/* Date Filter */}
      <div className="analytics-filters">
        <div className="filter-group">
          <button
            className={`filter-btn ${filterType === ANALYTICS_FILTERS.TODAY ? 'active' : ''}`}
            onClick={() => setFilterType(ANALYTICS_FILTERS.TODAY)}
          >
            Today
          </button>
          <button
            className={`filter-btn ${filterType === ANALYTICS_FILTERS.YESTERDAY ? 'active' : ''}`}
            onClick={() => setFilterType(ANALYTICS_FILTERS.YESTERDAY)}
          >
            Yesterday
          </button>
          <button
            className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => setFilterType('custom')}
          >
            Custom Date
          </button>
        </div>

        {filterType === 'custom' && (
          <div className="date-picker">
            <label htmlFor="analytics-date">Select Date:</label>
            <input
              type="date"
              id="analytics-date"
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
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </span>
          Overview
        </button>
        <button
          className={`nav-btn ${activeSection === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveSection('performance')}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </span>
          Performance
        </button>
        <button
          className={`nav-btn ${activeSection === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveSection('expenses')}
        >
          <span className="nav-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </span>
          Expenses
        </button>
      </div>


      {dashboard && (
        <>
          {/* OVERVIEW SECTION */}
          {activeSection === 'overview' && (
            <div className="overview-section">
              {/* Key Metrics */}
              <div className="metrics-grid">
                <div className="metric-card metric-revenue">
                  <div className="metric-header">
                    <span className="metric-label">Total Revenue</span>
                    <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="metric-value">{formatCurrency(dashboard.overall.total_revenue)}</div>
                  {comparison && (
                    <div className={`metric-change ${getTrendIndicator(comparison.change.revenue_percentage).class}`}>
                      <span className="change-icon">{getTrendIndicator(comparison.change.revenue_percentage).icon}</span>
                      <span>{formatPercentage(Math.abs(parseFloat(comparison.change.revenue_percentage)))}</span>
                      <span className="change-label">vs yesterday</span>
                    </div>
                  )}
                </div>

                <div className="metric-card metric-profit">
                  <div className="metric-header">
                    <span className="metric-label">Total Profit</span>
                    <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className={`metric-value ${getBalanceClass(dashboard.overall.total_profit)}`}>
                    {formatCurrency(dashboard.overall.total_profit)}
                  </div>
                  <div className="metric-secondary">
                    Margin: {formatPercentage((parseFloat(dashboard.overall.total_profit) / parseFloat(dashboard.overall.total_revenue)) * 100)}
                  </div>
                </div>

                <div className="metric-card metric-expenses">
                  <div className="metric-header">
                    <span className="metric-label">Total Expenses</span>
                    <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="metric-value">{formatCurrency(dashboard.overall.total_expenses)}</div>
                  <div className="metric-secondary">
                    {formatPercentage((parseFloat(dashboard.overall.total_expenses) / parseFloat(dashboard.overall.total_revenue)) * 100)} of revenue
                  </div>
                </div>

                <div className="metric-card metric-orders">
                  <div className="metric-header">
                    <span className="metric-label">Total Orders</span>
                    <svg className="metric-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                    </svg>
                  </div>
                  <div className="metric-value">{dashboard.overall.total_orders}</div>
                  <div className="metric-secondary">
                    Avg: {formatCurrency(dashboard.overall.avg_order_value)}
                  </div>
                </div>
              </div>

              {/* Balance Flow */}
              <div className="balance-flow-section">
                <h2 className="section-title">Balance Flow</h2>
                <div className="balance-flow-chart">
                  <div className="balance-item">
                    <div className="balance-label">Opening Balance</div>
                    <div className={`balance-amount ${getBalanceClass(dashboard.opening_balance)}`}>
                      {formatCurrency(dashboard.opening_balance)}
                    </div>
                    <div className="balance-source">From previous night</div>
                  </div>

                  <div className="flow-arrow-large">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  <div className="balance-item">
                    <div className="balance-label">Afternoon Closing</div>
                    <div className={`balance-amount ${getBalanceClass(dashboard.afternoon_shift.closing_balance)}`}>
                      {formatCurrency(dashboard.afternoon_shift.closing_balance)}
                    </div>
                    <div className="balance-source">
                      Profit: {formatCurrency(dashboard.afternoon_shift.profit)}
                    </div>
                  </div>

                  <div className="flow-arrow-large">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </div>

                  <div className="balance-item highlight">
                    <div className="balance-label">Final Closing</div>
                    <div className={`balance-amount ${getBalanceClass(dashboard.overall.final_closing_balance)}`}>
                      {formatCurrency(dashboard.overall.final_closing_balance)}
                    </div>
                    <div className="balance-source">
                      Night Profit: {formatCurrency(dashboard.night_shift.profit)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Shift Comparison */}
              <div className="shift-comparison-section">
                <h2 className="section-title">Shift Performance Comparison</h2>
                <div className="comparison-charts">
                  <div className="chart-container">
                    <h3 className="chart-title">Revenue by Shift</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart
                        data={[
                          {
                            shift: 'Afternoon',
                            revenue: parseFloat(dashboard.afternoon_shift.revenue),
                            expenses: parseFloat(dashboard.afternoon_shift.expenses),
                            profit: parseFloat(dashboard.afternoon_shift.profit)
                          },
                          {
                            shift: 'Night',
                            revenue: parseFloat(dashboard.night_shift.revenue),
                            expenses: parseFloat(dashboard.night_shift.expenses),
                            profit: parseFloat(dashboard.night_shift.profit)
                          }
                        ]}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="shift" />
                        <YAxis tickFormatter={formatCompactCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="revenue" fill={COLORS.success} name="Revenue" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="expenses" fill={COLORS.danger} name="Expenses" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="profit" fill={COLORS.primary} name="Profit" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="chart-container">
                    <h3 className="chart-title">Orders by Shift</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Afternoon', value: dashboard.afternoon_shift.order_count },
                            { name: 'Night', value: dashboard.night_shift.order_count }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.warning} />
                          <Cell fill={COLORS.purple} />
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Shift Details Cards */}
              <div className="shift-cards-grid">
                {/* Afternoon Shift */}
                <div className="shift-detail-card afternoon">
                  <div className="shift-card-header">
                    <div>
                      <h3>Afternoon Shift</h3>
                      <p className="shift-timing">
                        {dashboard.afternoon_shift.start_time} - {dashboard.afternoon_shift.end_time}
                      </p>
                    </div>
                    <div className={`shift-profit-badge ${getBalanceClass(dashboard.afternoon_shift.profit)}`}>
                      {formatCurrency(dashboard.afternoon_shift.profit)}
                    </div>
                  </div>

                  <div className="shift-stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-label">Revenue</span>
                      <span className="stat-mini-value">{formatCurrency(dashboard.afternoon_shift.revenue)}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Orders</span>
                      <span className="stat-mini-value">{dashboard.afternoon_shift.order_count}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Avg Order</span>
                      <span className="stat-mini-value">{formatCurrency(dashboard.afternoon_shift.avg_order_value)}</span>
                    </div>
                  </div>

                  {dashboard.afternoon_shift.top_dishes && dashboard.afternoon_shift.top_dishes.length > 0 && (
                    <div className="top-dish-mini">
                      <div className="top-dish-label">Top Dish</div>
                      <div className="top-dish-name">{dashboard.afternoon_shift.top_dishes[0].name}</div>
                      <div className="top-dish-stats">
                        {dashboard.afternoon_shift.top_dishes[0].quantity_sold} sold · {formatCurrency(dashboard.afternoon_shift.top_dishes[0].total_revenue)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Night Shift */}
                <div className="shift-detail-card night">
                  <div className="shift-card-header">
                    <div>
                      <h3>Night Shift</h3>
                      <p className="shift-timing">
                        {dashboard.night_shift.start_time} - {dashboard.night_shift.end_time}
                      </p>
                    </div>
                    <div className={`shift-profit-badge ${getBalanceClass(dashboard.night_shift.profit)}`}>
                      {formatCurrency(dashboard.night_shift.profit)}
                    </div>
                  </div>

                  <div className="shift-stats-mini">
                    <div className="stat-mini">
                      <span className="stat-mini-label">Revenue</span>
                      <span className="stat-mini-value">{formatCurrency(dashboard.night_shift.revenue)}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Orders</span>
                      <span className="stat-mini-value">{dashboard.night_shift.order_count}</span>
                    </div>
                    <div className="stat-mini">
                      <span className="stat-mini-label">Avg Order</span>
                      <span className="stat-mini-value">{formatCurrency(dashboard.night_shift.avg_order_value)}</span>
                    </div>
                  </div>

                  {dashboard.night_shift.top_dishes && dashboard.night_shift.top_dishes.length > 0 && (
                    <div className="top-dish-mini">
                      <div className="top-dish-label">Top Dish</div>
                      <div className="top-dish-name">{dashboard.night_shift.top_dishes[0].name}</div>
                      <div className="top-dish-stats">
                        {dashboard.night_shift.top_dishes[0].quantity_sold} sold · {formatCurrency(dashboard.night_shift.top_dishes[0].total_revenue)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}


          {/* PERFORMANCE SECTION */}
          {activeSection === 'performance' && (
            <div className="performance-section">
              {/* Hourly Trends */}
              {hourlyTrends && hourlyTrends.hourly_data && hourlyTrends.hourly_data.length > 0 && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Hourly Revenue Trend</h2>
                    <p className="card-subtitle">Identify peak hours and optimize operations</p>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={350}>
                      <LineChart data={hourlyTrends.hourly_data.map(item => ({
                        hour: item.hour,
                        revenue: parseFloat(item.revenue),
                        orders: item.order_count
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="hour" 
                          angle={-45}
                          textAnchor="end"
                          height={80}
                          interval={0}
                        />
                        <YAxis yAxisId="left" tickFormatter={formatCompactCurrency} />
                        <YAxis yAxisId="right" orientation="right" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Line 
                          yAxisId="left"
                          type="monotone" 
                          dataKey="revenue" 
                          stroke={COLORS.primary} 
                          strokeWidth={3}
                          dot={{ fill: COLORS.primary, r: 5 }}
                          activeDot={{ r: 8 }}
                          name="Revenue"
                        />
                        <Line 
                          yAxisId="right"
                          type="monotone" 
                          dataKey="orders" 
                          stroke={COLORS.success} 
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          name="Orders"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="insights-box">
                    <div className="insight-item">
                      <svg className="insight-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      <span>Peak Hour: {hourlyTrends.hourly_data.reduce((max, item) => 
                        parseFloat(item.revenue) > parseFloat(max.revenue) ? item : max
                      ).hour}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Summary */}
              {weeklySummary && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">7-Day Performance Trend</h2>
                    <p className="card-subtitle">Weekly revenue and order patterns</p>
                  </div>
                  
                  <div className="weekly-summary-stats">
                    <div className="summary-stat-card">
                      <span className="summary-stat-label">Week Total Revenue</span>
                      <span className="summary-stat-value">{formatCurrency(weeklySummary.summary.total_revenue)}</span>
                    </div>
                    <div className="summary-stat-card">
                      <span className="summary-stat-label">Week Total Profit</span>
                      <span className="summary-stat-value">{formatCurrency(weeklySummary.summary.total_profit)}</span>
                    </div>
                    <div className="summary-stat-card">
                      <span className="summary-stat-label">Daily Average</span>
                      <span className="summary-stat-value">{formatCurrency(weeklySummary.summary.avg_daily_revenue)}</span>
                    </div>
                    {weeklySummary.best_day && (
                      <div className="summary-stat-card highlight">
                        <span className="summary-stat-label">Best Day</span>
                        <span className="summary-stat-value">{weeklySummary.best_day.day_name}</span>
                        <span className="summary-stat-sub">{formatCurrency(weeklySummary.best_day.revenue)}</span>
                      </div>
                    )}
                  </div>

                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={weeklySummary.daily_breakdown.map(day => ({
                        day: day.day_name.substring(0, 3),
                        revenue: parseFloat(day.revenue),
                        profit: parseFloat(day.profit),
                        orders: day.orders
                      }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" />
                        <YAxis tickFormatter={formatCompactCurrency} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend />
                        <Bar dataKey="revenue" fill={COLORS.primary} name="Revenue" radius={[8, 8, 0, 0]} />
                        <Bar dataKey="profit" fill={COLORS.success} name="Profit" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Category Performance */}
              {categoryPerformance && categoryPerformance.categories && categoryPerformance.categories.length > 0 && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Category Performance</h2>
                    <p className="card-subtitle">Revenue distribution by menu category</p>
                  </div>

                  <div className="category-chart-grid">
                    <div className="chart-wrapper">
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={categoryPerformance.categories.map((cat, index) => ({
                              name: cat.category_display,
                              value: parseFloat(cat.total_revenue)
                            }))}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {categoryPerformance.categories.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="category-list">
                      {categoryPerformance.categories.map((cat, index) => (
                        <div key={index} className="category-item">
                          <div className="category-item-header">
                            <div className="category-color-dot" style={{ backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length] }}></div>
                            <span className="category-item-name">{cat.category_display}</span>
                            <span className="category-item-percentage">{cat.revenue_percentage}%</span>
                          </div>
                          <div className="category-item-stats">
                            <span>{formatCurrency(cat.total_revenue)}</span>
                            <span className="category-item-qty">{cat.total_quantity} items sold</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Top Dishes */}
              {dashboard.overall.top_dishes && dashboard.overall.top_dishes.length > 0 && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Best Selling Dishes</h2>
                    <p className="card-subtitle">Top 10 performing menu items</p>
                  </div>

                  <div className="top-dishes-table">
                    <div className="table-header-row">
                      <span className="col-rank">Rank</span>
                      <span className="col-dish-name">Dish Name</span>
                      <span className="col-category">Category</span>
                      <span className="col-quantity">Quantity</span>
                      <span className="col-revenue">Revenue</span>
                    </div>
                    {dashboard.overall.top_dishes.map((dish, index) => (
                      <div key={index} className="table-body-row">
                        <span className="col-rank">
                          <div className={`rank-badge rank-${index + 1}`}>#{index + 1}</div>
                        </span>
                        <span className="col-dish-name">
                          <div className="dish-name-wrapper">
                            <div className="dish-main-name">{dish.name}</div>
                            {dish.secondary_name && (
                              <div className="dish-sub-name">{dish.secondary_name}</div>
                            )}
                          </div>
                        </span>
                        <span className="col-category">
                          <span className="category-badge">{dish.category}</span>
                        </span>
                        <span className="col-quantity">
                          <span className="quantity-value">{dish.quantity_sold}</span>
                        </span>
                        <span className="col-revenue">
                          <span className="revenue-value">{formatCurrency(dish.total_revenue)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* EXPENSES SECTION */}
          {activeSection === 'expenses' && (
            <div className="expenses-section">
              {/* Expense Overview */}
              <div className="expense-overview-grid">
                <div className="expense-overview-card total">
                  <div className="expense-card-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="expense-card-content">
                    <span className="expense-card-label">Total Expenses</span>
                    <span className="expense-card-value">{formatCurrency(dashboard.overall.total_expenses)}</span>
                    <span className="expense-card-percentage">
                      {formatPercentage((parseFloat(dashboard.overall.total_expenses) / parseFloat(dashboard.overall.total_revenue)) * 100)} of revenue
                    </span>
                  </div>
                </div>

                {workerExpenses && (
                  <div className="expense-overview-card worker">
                    <div className="expense-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                    <div className="expense-card-content">
                      <span className="expense-card-label">Worker Expenses</span>
                      <span className="expense-card-value">{formatCurrency(workerExpenses.total_worker_expense)}</span>
                      <span className="expense-card-percentage">
                        {formatPercentage((parseFloat(workerExpenses.total_worker_expense) / parseFloat(dashboard.overall.total_expenses)) * 100)} of total
                      </span>
                    </div>
                  </div>
                )}

                {materialExpenses && (
                  <div className="expense-overview-card material">
                    <div className="expense-card-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <div className="expense-card-content">
                      <span className="expense-card-label">Material Expenses</span>
                      <span className="expense-card-value">{formatCurrency(materialExpenses.total_material_expense)}</span>
                      <span className="expense-card-percentage">
                        {formatPercentage((parseFloat(materialExpenses.total_material_expense) / parseFloat(dashboard.overall.total_expenses)) * 100)} of total
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Expense Distribution Chart */}
              {workerExpenses && materialExpenses && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Expense Distribution</h2>
                    <p className="card-subtitle">Breakdown of operational costs</p>
                  </div>
                  <div className="chart-wrapper">
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={[
                            { name: 'Worker Expenses', value: parseFloat(workerExpenses.total_worker_expense) },
                            { name: 'Material Expenses', value: parseFloat(materialExpenses.total_material_expense) }
                          ]}
                          cx="50%"
                          cy="50%"
                          labelLine={true}
                          label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          <Cell fill={COLORS.warning} />
                          <Cell fill={COLORS.info} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Worker Expenses Detail */}
              {workerExpenses && workerExpenses.worker_breakdown && workerExpenses.worker_breakdown.length > 0 && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Worker Expense Breakdown</h2>
                    <p className="card-subtitle">Individual worker costs and transactions</p>
                  </div>

                  <div className="expense-detail-list">
                    {workerExpenses.worker_breakdown.map((worker, index) => (
                      <div key={index} className="expense-detail-item">
                        <div className="expense-detail-header">
                          <div className="expense-detail-info">
                            <span className="expense-detail-name">{worker.worker_name}</span>
                            <span className="expense-detail-badge">{worker.worker_role}</span>
                          </div>
                          <span className="expense-detail-amount">{formatCurrency(worker.total_amount)}</span>
                        </div>
                        <div className="expense-detail-meta">
                          <span className="expense-meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            {worker.category}
                          </span>
                          <span className="expense-meta-item">
                            <svg className="meta-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            {worker.transaction_count} transactions
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Material Expenses Detail */}
              {materialExpenses && materialExpenses.material_breakdown && materialExpenses.material_breakdown.length > 0 && (
                <div className="analytics-card">
                  <div className="card-header">
                    <h2 className="card-title">Material Expense Breakdown</h2>
                    <p className="card-subtitle">Inventory and supply costs</p>
                  </div>

                  <div className="material-table">
                    <div className="table-header-row">
                      <span className="col-material-name">Material</span>
                      <span className="col-material-unit">Unit</span>
                      <span className="col-material-qty">Quantity</span>
                      <span className="col-material-price">Avg Price</span>
                      <span className="col-material-total">Total</span>
                    </div>
                    {materialExpenses.material_breakdown.map((material, index) => (
                      <div key={index} className="table-body-row">
                        <span className="col-material-name">
                          <div className="material-name-wrapper">
                            {material.material_name}
                            <span className="material-purchases">{material.purchase_count} purchases</span>
                          </div>
                        </span>
                        <span className="col-material-unit">
                          <span className="unit-badge">{material.unit}</span>
                        </span>
                        <span className="col-material-qty">{material.total_quantity}</span>
                        <span className="col-material-price">{formatCurrency(material.avg_unit_price)}</span>
                        <span className="col-material-total">
                          <span className="material-total-value">{formatCurrency(material.total_amount)}</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Insights */}
              <div className="insights-panel">
                <div className="insights-panel-header">
                  <svg className="insights-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3>Cost Optimization Insights</h3>
                </div>
                <div className="insights-list">
                  {parseFloat(dashboard.overall.total_expenses) > parseFloat(dashboard.overall.total_revenue) * 0.6 && (
                    <div className="insight-alert warning">
                      <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <div>
                        <strong>High Expense Ratio</strong>
                        <p>Expenses are {formatPercentage((parseFloat(dashboard.overall.total_expenses) / parseFloat(dashboard.overall.total_revenue)) * 100)} of revenue. Consider reviewing costs.</p>
                      </div>
                    </div>
                  )}
                  {workerExpenses && parseFloat(workerExpenses.total_worker_expense) > parseFloat(materialExpenses.total_material_expense) * 2 && (
                    <div className="insight-alert info">
                      <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <strong>Worker Cost Dominance</strong>
                        <p>Worker expenses significantly exceed material costs. Review labor efficiency.</p>
                      </div>
                    </div>
                  )}
                  {parseFloat(dashboard.overall.total_profit) < 0 && (
                    <div className="insight-alert danger">
                      <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <strong>Operating at Loss</strong>
                        <p>Today's operations resulted in a loss. Immediate cost reduction or revenue increase needed.</p>
                      </div>
                    </div>
                  )}
                  {parseFloat(dashboard.overall.total_profit) > 0 && parseFloat(dashboard.overall.total_profit) / parseFloat(dashboard.overall.total_revenue) > 0.3 && (
                    <div className="insight-alert success">
                      <svg className="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <strong>Healthy Profit Margin</strong>
                        <p>Excellent performance with {formatPercentage((parseFloat(dashboard.overall.total_profit) / parseFloat(dashboard.overall.total_revenue)) * 100)} profit margin.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};


export default Analytics;
