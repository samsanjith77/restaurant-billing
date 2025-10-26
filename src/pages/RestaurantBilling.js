import React, { useState } from 'react';
import useDishes from '../hooks/useDishes';
import ApiService from '../services/api';
import { ORDER_TYPES, MESSAGES } from '../utils/constants';
import '../styles/components/RestaurantBilling.css';

const RestaurantBilling = () => {
  const { dishes, loading, error, refetch } = useDishes();
  const [orderItems, setOrderItems] = useState({});
  const [orderType, setOrderType] = useState(ORDER_TYPES.DINE_IN);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);

  const handleQuantityChange = (dishId, quantity) => {
    setOrderItems(prev => {
      const updated = { ...prev };
      if (quantity > 0) {
        updated[dishId] = quantity;
      } else {
        delete updated[dishId];
      }
      return updated;
    });
  };

  const calculateTotal = () => {
    return Object.entries(orderItems).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find(d => d.id === parseInt(dishId));
      return total + (dish ? parseFloat(dish.price) * quantity : 0);
    }, 0);
  };

  const getOrderedDishes = () => {
    return Object.entries(orderItems)
      .map(([dishId, quantity]) => {
        const dish = dishes.find(d => d.id === parseInt(dishId));
        return dish ? { ...dish, quantity } : null;
      })
      .filter(Boolean);
  };

  const handlePlaceOrder = async () => {
    if (Object.keys(orderItems).length === 0) {
      setMessage({ type: 'error', text: MESSAGES.EMPTY_ORDER });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setIsProcessing(true);
    setMessage(null);

    try {
      const items = Object.entries(orderItems).map(([dishId, quantity]) => ({
        dish_id: parseInt(dishId),
        quantity
      }));

      const orderData = {
        items,
        total_amount: calculateTotal(),
        order_type: orderType
      };

      await ApiService.createOrder(orderData);

      setMessage({ type: 'success', text: MESSAGES.SUCCESS_ORDER });
      
      setOrderItems({});
      setOrderType(ORDER_TYPES.DINE_IN);

      setTimeout(() => setMessage(null), 3000);

    } catch (err) {
      setMessage({ type: 'error', text: err.message || MESSAGES.ERROR_CREATE_ORDER });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClearCart = () => {
    if (Object.keys(orderItems).length === 0) return;
    
    if (window.confirm('Clear all items from cart?')) {
      setOrderItems({});
    }
  };

  const getTotalItems = () => {
    return Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);
  };

  const orderedDishes = getOrderedDishes();

  return (
    <div className="restaurant-billing">
      {message && (
        <div className={`notification notification--${message.type}`}>
          {message.text}
        </div>
      )}

      {/* DISHES SECTION - LEFT SIDE */}
      <div className="dishes-section">
        <div className="section-header">
          <h2>Menu</h2>
          <button className="icon-btn" onClick={refetch} disabled={loading} title="Refresh">
            🔄
          </button>
        </div>

        {loading ? (
          <div className="loading-state">Loading menu...</div>
        ) : error ? (
          <div className="error-state">
            <p>{error}</p>
            <button onClick={refetch} className="retry-btn">Retry</button>
          </div>
        ) : dishes.length === 0 ? (
          <div className="empty-state">
            <p>No dishes available</p>
          </div>
        ) : (
          <div className="dishes-grid-billing">
            {dishes.map((dish) => (
              <div key={dish.id} className="dish-card-billing">
                {dish.image && (
                  <div className="dish-img-billing">
                    <img src={dish.image} alt={dish.name} />
                  </div>
                )}
                <div className="dish-info-billing">
                  <h4 className="dish-name-billing">{dish.name}</h4>
                  <p className="dish-price-billing">₹{parseFloat(dish.price).toFixed(2)}</p>
                </div>
                <div className="dish-quantity-control">
                  {orderItems[dish.id] ? (
                    <div className="qty-controls-billing">
                      <button
                        className="qty-btn-billing qty-minus"
                        onClick={() => handleQuantityChange(dish.id, (orderItems[dish.id] || 0) - 1)}
                      >
                        −
                      </button>
                      <span className="qty-display">{orderItems[dish.id]}</span>
                      <button
                        className="qty-btn-billing qty-plus"
                        onClick={() => handleQuantityChange(dish.id, (orderItems[dish.id] || 0) + 1)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-btn-billing"
                      onClick={() => handleQuantityChange(dish.id, 1)}
                    >
                      + Add
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ORDER SECTION - RIGHT SIDE */}
      <div className="order-section">
        <div className="order-header">
          <h3>Cart ({getTotalItems()})</h3>
          {getTotalItems() > 0 && (
            <button className="text-btn text-btn--danger" onClick={handleClearCart}>
              Clear
            </button>
          )}
        </div>

        {/* Compact Order Type */}
        <div className="order-type-compact">
          <label className="compact-label">Order Type</label>
          <div className="type-toggle">
            <button
              className={`type-option ${orderType === ORDER_TYPES.DINE_IN ? 'active' : ''}`}
              onClick={() => setOrderType(ORDER_TYPES.DINE_IN)}
            >
              🍽️ Dine In
            </button>
            <button
              className={`type-option ${orderType === ORDER_TYPES.DELIVERY ? 'active' : ''}`}
              onClick={() => setOrderType(ORDER_TYPES.DELIVERY)}
            >
              🏍️ Delivery
            </button>
          </div>
        </div>

        {/* Order Items */}
        <div className="order-summary">
          {orderedDishes.length === 0 ? (
            <div className="empty-state">
              <div className="empty-cart-icon">🛒</div>
              <p>Cart is empty</p>
              <span>Add items from menu</span>
            </div>
          ) : (
            <div className="order-items">
              {orderedDishes.map(dish => (
                <div key={dish.id} className="order-item">
                  <div className="item-details">
                    <span className="item-name">{dish.name}</span>
                    <span className="item-price">₹{parseFloat(dish.price).toFixed(2)}</span>
                  </div>
                  <div className="item-actions">
                    <div className="qty-control">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(dish.id, dish.quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{dish.quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(dish.id, dish.quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                    <span className="item-subtotal">
                      ₹{(parseFloat(dish.price) * dish.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order Footer */}
        <div className="order-footer">
          <div className="total-row">
            <span className="total-label">Total</span>
            <span className="total-value">₹{calculateTotal().toFixed(2)}</span>
          </div>

          <button
            className="place-order-btn"
            onClick={handlePlaceOrder}
            disabled={isProcessing || getTotalItems() === 0}
          >
            {isProcessing ? 'Processing...' : `Place Order (${getTotalItems()})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBilling;
