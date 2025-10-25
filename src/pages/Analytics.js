import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import '../styles/components/Analytics.css';

const Analytics = () => {
  const [summary, setSummary] = useState(null);
  const [workerExpense, setWorkerExpense] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter state
  const [filterType, setFilterType] = useState('today');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [workerDate, setWorkerDate] = useState(getTodayString());

  // Get today's date in YYYY-MM-DD format
  function getTodayString() {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }

  // Fetch analytics summary
  const fetchSummary = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      let params = {};

      if (filterType === 'all') {
        params.filter = 'all';
      } else if (filterType === 'custom' && startDate && endDate) {
        params.start_date = startDate;
        params.end_date = endDate;
      }
      // If 'today' or no params, API defaults to today

      console.log('📊 Fetching analytics with params:', params);
      const data = await ApiService.getAnalyticsSummary(params);
      console.log('✅ Analytics data:', data);
      setSummary(data);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, [filterType, startDate, endDate]);

  // Fetch worker expense
  const fetchWorkerExpense = useCallback(async () => {
    try {
      console.log('👷 Fetching worker expense for:', workerDate);
      const data = await ApiService.getWorkerExpense(workerDate);
      console.log('✅ Worker expense:', data);
      setWorkerExpense(data);
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }, [workerDate]);

  // Fetch on mount and when filters change
  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    fetchWorkerExpense();
  }, [fetchWorkerExpense]);

  // Quick filter handlers
  const applyFilter = (type) => {
    setFilterType(type);
    if (type === 'today') {
      setStartDate('');
      setEndDate('');
    } else if (type === 'all') {
      setStartDate('');
      setEndDate('');
    }
  };

  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount).toFixed(2)}`;
  };

  const getBalanceColor = (balance) => {
    if (balance > 0) return 'positive';
    if (balance < 0) return 'negative';
    return 'neutral';
  };

  if (loading && !summary) {
    return (
      <div className="analytics">
        <LoadingSpinner message="Loading analytics..." />
      </div>
    );
  }

  return (
    <div className="analytics">
      {/* Header */}
      <div className="page-header">
        <h1>📊 Analytics Dashboard</h1>
        <p>Business insights and performance metrics</p>
      </div>

      {/* Filter Section */}
      <div className="analytics-filters">
        <div className="filter-buttons">
          <button
            className={`filter-btn ${filterType === 'today' ? 'active' : ''}`}
            onClick={() => applyFilter('today')}
            disabled={loading}
          >
            Today
          </button>
          <button
            className={`filter-btn ${filterType === 'all' ? 'active' : ''}`}
            onClick={() => applyFilter('all')}
            disabled={loading}
          >
            All Time
          </button>
          <button
            className={`filter-btn ${filterType === 'custom' ? 'active' : ''}`}
            onClick={() => applyFilter('custom')}
            disabled={loading}
          >
            Custom Range
          </button>
        </div>

        {filterType === 'custom' && (
          <div className="custom-range">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="date-input"
            />
            <span className="date-separator">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="date-input"
            />
            <button 
              className="apply-btn" 
              onClick={fetchSummary}
              disabled={!startDate || !endDate || loading}
            >
              Apply
            </button>
          </div>
        )}
      </div>

      {/* Error State */}
      {error && (
        <div className="error-banner">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
          <button onClick={fetchSummary} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Summary Cards */}
      {summary && (
        <div className="analytics-section">
          <div className="section-header">
            <h2>{summary.label}</h2>
            <button onClick={fetchSummary} className="refresh-btn" disabled={loading}>
              {loading ? '⏳' : '🔄'}
            </button>
          </div>

          <div className="summary-grid">
            {/* Income Card */}
            <div className="summary-card income-card">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-label">Total Income</div>
                <div className="card-value">{formatCurrency(summary.total_income)}</div>
              </div>
            </div>

            {/* Expense Card */}
            <div className="summary-card expense-card">
              <div className="card-icon">💸</div>
              <div className="card-content">
                <div className="card-label">Total Expense</div>
                <div className="card-value">{formatCurrency(summary.total_expense)}</div>
              </div>
            </div>

            {/* Balance Card */}
            <div className={`summary-card balance-card ${getBalanceColor(summary.balance)}`}>
              <div className="card-icon">
                {summary.balance > 0 ? '📈' : summary.balance < 0 ? '📉' : '➖'}
              </div>
              <div className="card-content">
                <div className="card-label">Balance</div>
                <div className="card-value">{formatCurrency(summary.balance)}</div>
              </div>
            </div>
          </div>

          {/* Percentage Bar */}
          {summary.total_income > 0 && (
            <div className="breakdown-bar">
              <div className="breakdown-header">
                <span>Income vs Expense</span>
                <span className="profit-margin">
                  Profit Margin: {((summary.balance / summary.total_income) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="bar-container">
                <div 
                  className="bar-segment income" 
                  style={{ width: '100%' }}
                  title={`Income: ${formatCurrency(summary.total_income)}`}
                >
                  <span className="bar-label">Income</span>
                </div>
                <div 
                  className="bar-segment expense" 
                  style={{ width: `${(summary.total_expense / summary.total_income) * 100}%` }}
                  title={`Expense: ${formatCurrency(summary.total_expense)}`}
                >
                  <span className="bar-label">Expense</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Worker Expense Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h2>👷 Worker Expense</h2>
          <div className="worker-date-filter">
            <input
              type="date"
              value={workerDate}
              onChange={(e) => setWorkerDate(e.target.value)}
              className="date-input"
            />
          </div>
        </div>

        {workerExpense && (
          <div className="worker-expense-card">
            <div className="worker-icon">👨‍🔧</div>
            <div className="worker-content">
              <div className="worker-label">
                Total Worker Expense on {workerExpense.date}
              </div>
              <div className="worker-value">
                {formatCurrency(workerExpense.total_worker_expense)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {summary && summary.total_income > 0 && (
        <div className="quick-stats">
          <div className="stat-item">
            <div className="stat-label">Expense Ratio</div>
            <div className="stat-value">
              {((summary.total_expense / summary.total_income) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Savings Rate</div>
            <div className="stat-value">
              {((summary.balance / summary.total_income) * 100).toFixed(1)}%
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-label">Net Profit</div>
            <div className="stat-value">{formatCurrency(summary.balance)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
