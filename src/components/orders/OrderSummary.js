import React, { useState } from 'react';
import Button from '../common/Button';
import '../../styles/components/OrderSummary.css';

const OrderSummary = ({ 
  orderItems, 
  dishes, 
  total, 
  onPlaceOrder, 
  onReset,
  loading 
}) => {
  const [orderStatus, setOrderStatus] = useState(null);

  const handlePlaceOrder = async () => {
    try {
      setOrderStatus(null);
      const result = await onPlaceOrder();
      setOrderStatus({
        type: 'success',
        message: `Order placed successfully! Order ID: ${result.order?.id || 'N/A'}`
      });
    } catch (error) {
      setOrderStatus({
        type: 'error',
        message: error.message
      });
    }
  };

  const orderItemsList = Object.entries(orderItems).map(([dishId, quantity]) => {
    const dish = dishes.find(d => d.id === parseInt(dishId));
    return dish ? { ...dish, quantity } : null;
  }).filter(Boolean);

  return (
    <div className="order-summary">
      <div className="order-summary__header">
        <h3>Order Summary</h3>
      </div>
      
      <div className="order-summary__body">
        {orderItemsList.length === 0 ? (
          <p className="empty-order">No items selected</p>
        ) : (
          <div className="order-items">
            {orderItemsList.map(item => (
              <div key={item.id} className="order-item">
                <div className="order-item__details">
                  <span className="item-name">{item.name}</span>
                  <span className="item-quantity">x{item.quantity}</span>
                </div>
                <span className="item-total">₹{item.price * item.quantity}</span>
              </div>
            ))}
          </div>
        )}
        
        <div className="order-total">
          <strong>Total: ₹{total.toFixed(2)}</strong>
        </div>

        {orderStatus && (
          <div className={`order-status ${orderStatus.type}`}>
            {orderStatus.message}
          </div>
        )}
      </div>
      
      <div className="order-summary__footer">
        <Button
          variant="primary"
          disabled={orderItemsList.length === 0}
          loading={loading}
          onClick={handlePlaceOrder}
          style={{ width: '100%', marginBottom: '10px' }}
        >
          Place Order
        </Button>
        <Button
          variant="outline"
          disabled={orderItemsList.length === 0 || loading}
          onClick={onReset}
          style={{ width: '100%' }}
        >
          Reset Order
        </Button>
      </div>
    </div>
  );
};

export default OrderSummary;