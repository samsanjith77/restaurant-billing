import React from 'react';
import '../../styles/components/OrderSummary.css';

const OrderSummary = ({ dishes, orderItems, onQuantityChange }) => {
  const getOrderedDishes = () => {
    return Object.entries(orderItems)
      .map(([dishId, quantity]) => {
        const dish = dishes.find(d => d.id === parseInt(dishId));
        return dish ? { ...dish, quantity } : null;
      })
      .filter(Boolean);
  };

  const orderedDishes = getOrderedDishes();

  if (orderedDishes.length === 0) {
    return (
      <div className="order-summary">
        <div className="empty-cart">
          <span className="empty-icon">🛒</span>
          <p>Your cart is empty</p>
          <span className="empty-hint">Add dishes from menu</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-summary">
      <div className="order-items">
        {orderedDishes.map(dish => (
          <div key={dish.id} className="order-item">
            <div className="item-info">
              <span className="item-name">{dish.name}</span>
              <span className="item-price">₹{parseFloat(dish.price).toFixed(2)}</span>
            </div>
            <div className="item-controls">
              <button
                className="qty-btn qty-btn--minus"
                onClick={() => onQuantityChange(dish.id, dish.quantity - 1)}
                disabled={dish.quantity <= 1}
              >
                −
              </button>
              <span className="item-quantity">{dish.quantity}</span>
              <button
                className="qty-btn qty-btn--plus"
                onClick={() => onQuantityChange(dish.id, dish.quantity + 1)}
              >
                +
              </button>
            </div>
            <div className="item-total">
              ₹{(parseFloat(dish.price) * dish.quantity).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderSummary;
