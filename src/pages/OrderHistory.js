import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import '../styles/components/OrderHistory.css';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Date range state
  const [startDate, setStartDate] = useState(getLocalDateString(getTodayStart()));
  const [endDate, setEndDate] = useState(getLocalDateString(getTodayEnd()));
  const [quickFilter, setQuickFilter] = useState('today');

  // Get today's start (00:00:00)
  function getTodayStart() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
  }

  // Get today's end (23:59:59)
  function getTodayEnd() {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    return today;
  }

  // Convert Date to local datetime-local string format
  function getLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Convert local datetime-local string to UTC ISO string
  function localToUTC(localDateString) {
    const date = new Date(localDateString);
    return date.toISOString();
  }

  // Fetch orders with useCallback to prevent warning
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const startUTC = localToUTC(startDate);
      const endUTC = localToUTC(endDate);

      const payload = {
        start_time: startUTC,
        end_time: endUTC
      };

      console.log('📅 Fetching orders:', {
        local: { start: startDate, end: endDate },
        utc: payload
      });
      
      const data = await ApiService.getOrderHistory(payload);
      
      console.log('✅ Received orders:', data.length);
      
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error('❌ Error:', err);
      setError(err.message || 'Failed to load order history');
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  // Filter orders with useCallback to prevent warning
  const filterOrders = useCallback(() => {
    let filtered = [...orders];

    console.log('🔍 Filtering:', {
      filterType,
      totalOrders: orders.length,
      orderTypes: orders.map(o => o.order_type)
    });

    if (filterType !== 'all') {
      filtered = filtered.filter(order => {
        const orderTypeNormalized = order.order_type.toLowerCase().replace(/[\s_-]+/g, '');
        const filterNormalized = filterType.toLowerCase().replace(/[\s_-]+/g, '');
        
        const matches = orderTypeNormalized === filterNormalized;
        
        console.log('Compare:', {
          original: order.order_type,
          normalized: orderTypeNormalized,
          filter: filterNormalized,
          matches
        });
        
        return matches;
      });
    }

    console.log('✅ Filtered result:', filtered.length);

    if (searchTerm) {
      filtered = filtered.filter(order => {
        const searchLower = searchTerm.toLowerCase();
        const orderIdMatch = order.id.toString().includes(searchLower);
        const dishMatch = order.items.some(item => 
          item.dish_name.toLowerCase().includes(searchLower)
        );
        return orderIdMatch || dishMatch;
      });
    }

    setFilteredOrders(filtered);
  }, [orders, filterType, searchTerm]);

  // Auto-fetch when dates change
  useEffect(() => {
    if (startDate && endDate) {
      fetchOrders();
    }
  }, [startDate, endDate, fetchOrders]);

  // Filter orders when search or filter changes
  useEffect(() => {
    filterOrders();
  }, [filterOrders]);

  // Quick date filters
  const applyQuickFilter = (filter) => {
    setQuickFilter(filter);
    const now = new Date();

    switch (filter) {
      case 'today':
        setStartDate(getLocalDateString(getTodayStart()));
        setEndDate(getLocalDateString(getTodayEnd()));
        break;
      
      case 'yesterday':
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        const yesterdayEnd = new Date(yesterday);
        yesterdayEnd.setHours(23, 59, 59, 999);
        setStartDate(getLocalDateString(yesterday));
        setEndDate(getLocalDateString(yesterdayEnd));
        break;
      
      case 'week':
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        weekAgo.setHours(0, 0, 0, 0);
        setStartDate(getLocalDateString(weekAgo));
        setEndDate(getLocalDateString(getTodayEnd()));
        break;
      
      case 'month':
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        monthAgo.setHours(0, 0, 0, 0);
        setStartDate(getLocalDateString(monthAgo));
        setEndDate(getLocalDateString(getTodayEnd()));
        break;
      
      default:
        break;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getTotalItems = (items) => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getOrderTypeIcon = (orderType) => {
    const normalized = orderType.toLowerCase().replace(/[\s_-]+/g, '');
    return normalized === 'dinein' ? '🍽️' : '🏍️';
  };

  const getTotalRevenue = () => {
    return orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);
  };

  if (loading && orders.length === 0) {
    return (
      <div className="order-history">
        <LoadingSpinner message="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="order-history">
      {/* Compact Header */}
      <div className="page-header">
        <h1>📋 Orders</h1>
        <div className="header-stats">
          <span className="stat-badge">
            <strong>{orders.length}</strong> orders
          </span>
          <span className="stat-badge gold">
            <strong>₹{getTotalRevenue().toFixed(0)}</strong>
          </span>
        </div>
      </div>

      {/* Date Filters */}
      <div className="date-section">
        <div className="quick-filters">
          {[
            { value: 'today', label: 'Today' },
            { value: 'yesterday', label: 'Yesterday' },
            { value: 'week', label: '7 Days' },
            { value: 'month', label: '30 Days' }
          ].map(filter => (
            <button
              key={filter.value}
              className={`quick-btn ${quickFilter === filter.value ? 'active' : ''}`}
              onClick={() => applyQuickFilter(filter.value)}
              disabled={loading}
            >
              {loading && quickFilter === filter.value ? '⏳' : filter.label}
            </button>
          ))}
        </div>
        
        <details className="custom-date">
          <summary>Custom Range</summary>
          <div className="date-inputs">
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setQuickFilter('custom');
              }}
              className="date-input"
              disabled={loading}
            />
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setQuickFilter('custom');
              }}
              className="date-input"
              disabled={loading}
            />
            <button 
              className="refresh-btn" 
              onClick={fetchOrders}
              disabled={loading}
            >
              {loading ? '⏳' : '🔄'}
            </button>
          </div>
        </details>
      </div>

      {/* Compact Search & Filter */}
      <div className="controls">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button 
              className="clear-search"
              onClick={() => setSearchTerm('')}
            >
              ✕
            </button>
          )}
        </div>

        <div className="type-filters">
          {[
            { value: 'all', label: 'All', title: 'All Orders' },
            { value: 'dinein', label: '🍽️', title: 'Dine In' },
            { value: 'delivery', label: '🏍️', title: 'Delivery' }
          ].map(filter => (
            <button
              key={filter.value}
              className={`type-btn ${filterType === filter.value ? 'active' : ''}`}
              onClick={() => setFilterType(filter.value)}
              title={filter.title}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Indicator */}
      {loading && orders.length > 0 && (
        <div className="loading-bar">
          <div className="loading-progress"></div>
        </div>
      )}

      {/* Results Count */}
      <div className="results-info">
        {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Error State */}
      {error && <ErrorMessage message={error} onRetry={fetchOrders} />}

      {/* Compact Orders List */}
      {filteredOrders.length === 0 && !loading ? (
        <div className="no-orders">
          <span className="icon">📭</span>
          <p>No orders found</p>
          <button className="retry-btn" onClick={fetchOrders}>
            🔄 Refresh
          </button>
        </div>
      ) : (
        <div className="orders-container">
          {filteredOrders.map((order) => (
            <div 
              key={order.id} 
              className="order-item"
              onClick={() => setSelectedOrder(order)}
            >
              <div className="order-main">
                <div className="order-left">
                  <span className="order-number">#{order.id}</span>
                  <span className="order-time">{formatDate(order.created_at)}</span>
                </div>
                <div className="order-right">
                  <span className="order-type">
                    {getOrderTypeIcon(order.order_type)}
                  </span>
                  <span className="order-amount">
                    ₹{parseFloat(order.total_amount).toFixed(2)}
                  </span>
                </div>
              </div>
              <div className="order-preview">
                {getTotalItems(order.items)} items: {order.items.slice(0, 2).map(i => i.dish_name).join(', ')}
                {order.items.length > 2 && ` +${order.items.length - 2} more`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedOrder && (
        <div className="order-modal" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder.id}</h2>
              <button className="modal-close" onClick={() => setSelectedOrder(null)}>✕</button>
            </div>

            <div className="modal-body">
              <div className="modal-info">
                <div className="info-row">
                  <span>Type</span>
                  <span>{getOrderTypeIcon(selectedOrder.order_type)} {selectedOrder.order_type}</span>
                </div>
                <div className="info-row">
                  <span>Date</span>
                  <span>{formatDate(selectedOrder.created_at)}</span>
                </div>
                <div className="info-row">
                  <span>Items</span>
                  <span>{getTotalItems(selectedOrder.items)}</span>
                </div>
              </div>

              <div className="modal-items">
                <h3>Items</h3>
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="modal-item">
                    <span className="item-qty">{item.quantity}×</span>
                    <span className="item-name">{item.dish_name}</span>
                    <span className="item-price">₹{parseFloat(item.price).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="modal-total">
                <span>Total</span>
                <span>₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
