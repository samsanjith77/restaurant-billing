# React Restaurant Billing System - Complete File Structure

## Folder Structure
```
restaurant-billing/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── LoadingSpinner.js
│   │   │   └── ErrorMessage.js
│   │   ├── dishes/
│   │   │   ├── DishCard.js
│   │   │   └── DishList.js
│   │   ├── orders/
│   │   │   └── OrderSummary.js
│   │   └── layout/
│   │       └── Header.js
│   ├── pages/
│   │   └── RestaurantBilling.js
│   ├── services/
│   │   └── api.js
│   ├── hooks/
│   │   ├── useOrder.js
│   │   └── useDishes.js
│   ├── utils/
│   │   └── constants.js
│   ├── styles/
│   │   ├── App.css
│   │   └── components/
│   │       ├── DishCard.css
│   │       ├── OrderSummary.css
│   │       └── Header.css
│   ├── App.js
│   └── index.js
├── package.json
└── README.md
```

## File Contents

### package.json
```json
{
  "name": "restaurant-billing",
  "version": "0.1.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-scripts": "5.0.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  },
  "eslintConfig": {
    "extends": [
      "react-app",
      "react-app/jest"
    ]
  },
  "browserslist": {
    "production": [
      ">0.2%",
      "not dead",
      "not op_mini all"
    ],
    "development": [
      "last 1 chrome version",
      "last 1 firefox version",
      "last 1 safari version"
    ]
  }
}
```

### src/index.js
```jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/App.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### src/App.js
```jsx
import React from 'react';
import Header from './components/layout/Header';
import RestaurantBilling from './pages/RestaurantBilling';
import './styles/App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <main className="main-content">
        <RestaurantBilling />
      </main>
    </div>
  );
}

export default App;
```

### src/utils/constants.js
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/billing',
  ENDPOINTS: {
    DISHES: '/dishes/',
    CREATE_ORDER: '/orders/create/'
  }
};

export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  DELIVERY: 'delivery'
};

export const MESSAGES = {
  LOADING_DISHES: 'Loading dishes...',
  ERROR_FETCH_DISHES: 'Failed to load dishes. Please try again.',
  ERROR_CREATE_ORDER: 'Failed to create order. Please try again.',
  SUCCESS_ORDER: 'Order placed successfully!',
  EMPTY_ORDER: 'Please select at least one dish',
  NO_DISHES: 'No dishes available'
};
```

### src/services/api.js
```javascript
import { API_CONFIG } from '../utils/constants';

class ApiService {
  static async getDishes() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`);
      if (!response.ok) throw new Error('Failed to fetch dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

  static async createOrder(orderData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }
}

export default ApiService;
```

### src/hooks/useDishes.js
```javascript
import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const useDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const dishesData = await ApiService.getDishes();
      setDishes(dishesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  return { dishes, loading, error, refetch: fetchDishes };
};

export default useDishes;
```

### src/hooks/useOrder.js
```javascript
import { useState, useCallback } from 'react';
import ApiService from '../services/api';
import { ORDER_TYPES } from '../utils/constants';

const useOrder = () => {
  const [orderItems, setOrderItems] = useState({});
  const [loading, setLoading] = useState(false);

  const updateQuantity = useCallback((dishId, quantity) => {
    setOrderItems(prev => {
      if (quantity <= 0) {
        const { [dishId]: removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [dishId]: quantity };
    });
  }, []);

  const calculateTotal = useCallback((dishes) => {
    return Object.entries(orderItems).reduce((total, [dishId, quantity]) => {
      const dish = dishes.find(d => d.id === parseInt(dishId));
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  }, [orderItems]);

  const placeOrder = useCallback(async (dishes) => {
    if (Object.keys(orderItems).length === 0) {
      throw new Error('Please select at least one dish');
    }

    setLoading(true);
    try {
      const items = Object.entries(orderItems).map(([dish_id, quantity]) => ({
        dish_id: parseInt(dish_id),
        quantity
      }));

      const payload = {
        order_type: ORDER_TYPES.DINE_IN,
        total_amount: calculateTotal(dishes),
        items
      };

      const result = await ApiService.createOrder(payload);
      
      // Reset order after successful placement
      setOrderItems({});
      
      return result;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [orderItems, calculateTotal]);

  const resetOrder = useCallback(() => {
    setOrderItems({});
  }, []);

  return {
    orderItems,
    updateQuantity,
    calculateTotal,
    placeOrder,
    resetOrder,
    loading
  };
};

export default useOrder;
```

### src/components/layout/Header.js
```jsx
import React from 'react';
import '../../styles/components/Header.css';

const Header = () => {
  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <h1 className="restaurant-name">Delicious Kitchen</h1>
          <nav className="nav">
            {/* Future: Add login/logout functionality */}
            <button className="btn btn--outline">
              Login
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### src/components/common/LoadingSpinner.js
```jsx
import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div className="loading-spinner">
      <div className="spinner"></div>
      <span>{message}</span>
    </div>
  );
};

export default LoadingSpinner;
```

### src/components/common/Button.js
```jsx
import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  loading = false,
  onClick,
  ...props 
}) => {
  const className = `btn btn--${variant} btn--${size} ${disabled || loading ? 'btn--disabled' : ''}`;

  return (
    <button 
      className={className}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
```

### src/components/common/ErrorMessage.js
```jsx
import React from 'react';

const ErrorMessage = ({ message, onRetry }) => {
  return (
    <div className="error-message">
      <p>{message}</p>
      {onRetry && (
        <button className="btn btn--primary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
```

### src/components/dishes/DishCard.js
```jsx
import React from 'react';
import '../../styles/components/DishCard.css';

const DishCard = ({ dish, quantity, onQuantityChange }) => {
  const handleQuantityChange = (e) => {
    const newQuantity = parseInt(e.target.value) || 0;
    onQuantityChange(dish.id, newQuantity);
  };

  const handleIncrement = () => {
    onQuantityChange(dish.id, quantity + 1);
  };

  const handleDecrement = () => {
    if (quantity > 0) {
      onQuantityChange(dish.id, quantity - 1);
    }
  };

  return (
    <div className="dish-card">
      <div className="dish-image-container">
        <img 
          src={dish.image || '/placeholder-dish.jpg'} 
          alt={dish.name}
          className="dish-image"
          onError={(e) => {
            e.target.src = '/placeholder-dish.jpg';
          }}
        />
      </div>
      <div className="dish-content">
        <h3 className="dish-name">{dish.name}</h3>
        <p className="dish-price">₹{dish.price}</p>
        <div className="quantity-control">
          <button 
            className="quantity-btn" 
            onClick={handleDecrement}
            disabled={quantity <= 0}
          >
            -
          </button>
          <input 
            type="number" 
            min="0" 
            value={quantity}
            onChange={handleQuantityChange}
            className="quantity-input"
          />
          <button 
            className="quantity-btn" 
            onClick={handleIncrement}
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default DishCard;
```

### src/components/dishes/DishList.js
```jsx
import React from 'react';
import DishCard from './DishCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { MESSAGES } from '../../utils/constants';

const DishList = ({ dishes, loading, error, orderItems, onQuantityChange, onRetry }) => {
  if (loading) {
    return <LoadingSpinner message={MESSAGES.LOADING_DISHES} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!dishes.length) {
    return <div className="no-dishes">{MESSAGES.NO_DISHES}</div>;
  }

  return (
    <div className="dishes-grid">
      {dishes.map(dish => (
        <DishCard
          key={dish.id}
          dish={dish}
          quantity={orderItems[dish.id] || 0}
          onQuantityChange={onQuantityChange}
        />
      ))}
    </div>
  );
};

export default DishList;
```

### src/components/orders/OrderSummary.js
```jsx
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
```

### src/pages/RestaurantBilling.js
```jsx
import React from 'react';
import DishList from '../components/dishes/DishList';
import OrderSummary from '../components/orders/OrderSummary';
import useDishes from '../hooks/useDishes';
import useOrder from '../hooks/useOrder';

const RestaurantBilling = () => {
  const { dishes, loading: dishesLoading, error: dishesError, refetch } = useDishes();
  const { 
    orderItems, 
    updateQuantity, 
    calculateTotal, 
    placeOrder, 
    resetOrder,
    loading: orderLoading 
  } = useOrder();

  const total = calculateTotal(dishes);

  return (
    <div className="restaurant-billing">
      <div className="container">
        <div className="billing-layout">
          <section className="dishes-section">
            <div className="section-header">
              <h2>Our Menu</h2>
            </div>
            <DishList
              dishes={dishes}
              loading={dishesLoading}
              error={dishesError}
              orderItems={orderItems}
              onQuantityChange={updateQuantity}
              onRetry={refetch}
            />
          </section>
          
          <aside className="order-section">
            <OrderSummary
              orderItems={orderItems}
              dishes={dishes}
              total={total}
              onPlaceOrder={() => placeOrder(dishes)}
              onReset={resetOrder}
              loading={orderLoading}
            />
          </aside>
        </div>
      </div>
    </div>
  );
};

export default RestaurantBilling;
```

### src/styles/App.css
```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f8fafc;
  color: #1e293b;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.main-content {
  padding: 20px 0;
}

.billing-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  align-items: start;
}

@media (max-width: 768px) {
  .billing-layout {
    grid-template-columns: 1fr;
    gap: 20px;
  }
  
  .order-section {
    order: -1;
  }
}

.section-header {
  margin-bottom: 20px;
}

.section-header h2 {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 600;
}

.dishes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

/* Button Styles */
.btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.btn--primary {
  background-color: #2563eb;
  color: white;
}

.btn--primary:hover:not(.btn--disabled) {
  background-color: #1d4ed8;
}

.btn--outline {
  background-color: transparent;
  color: #2563eb;
  border: 1px solid #2563eb;
}

.btn--outline:hover:not(.btn--disabled) {
  background-color: #2563eb;
  color: white;
}

.btn--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading Spinner */
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #64748b;
}

.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #2563eb;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error Message */
.error-message {
  text-align: center;
  padding: 40px;
  color: #dc2626;
}

.error-message p {
  margin-bottom: 15px;
  font-size: 16px;
}

.no-dishes {
  text-align: center;
  padding: 40px;
  color: #64748b;
  font-size: 16px;
}
```

### src/styles/components/Header.css
```css
.header {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 15px 0;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.restaurant-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.nav {
  display: flex;
  align-items: center;
}

@media (max-width: 768px) {
  .restaurant-name {
    font-size: 1.5rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
}
```

### src/styles/components/DishCard.css
```css
.dish-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #e2e8f0;
}

.dish-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.dish-image-container {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.dish-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.dish-content {
  padding: 16px;
}

.dish-name {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1e293b;
}

.dish-price {
  font-size: 1.25rem;
  font-weight: 700;
  color: #f97316;
  margin-bottom: 12px;
}

.quantity-control {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #f1f5f9;
  border-radius: 8px;
  padding: 4px;
}

.quantity-btn {
  width: 36px;
  height: 36px;
  border: none;
  background-color: #2563eb;
  color: white;
  border-radius: 6px;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.quantity-btn:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.quantity-btn:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.quantity-input {
  flex: 1;
  border: none;
  background: transparent;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  padding: 8px;
  margin: 0 8px;
}

.quantity-input:focus {
  outline: none;
}

/* Remove number input arrows */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.quantity-input[type=number] {
  -moz-appearance: textfield;
}
```

### src/styles/components/OrderSummary.css
```css
.order-summary {
  background: white;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 20px;
}

.order-summary__header {
  padding: 20px 20px 0;
  border-bottom: 1px solid #e2e8f0;
}

.order-summary__header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 15px;
}

.order-summary__body {
  padding: 20px;
  max-height: 400px;
  overflow-y: auto;
}

.empty-order {
  text-align: center;
  color: #64748b;
  font-style: italic;
  padding: 20px 0;
}

.order-items {
  space: 12px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 12px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
}

.order-item__details {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.item-name {
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 4px;
}

.item-quantity {
  font-size: 0.875rem;
  color: #64748b;
}

.item-total {
  font-weight: 600;
  color: #f97316;
}

.order-total {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
  text-align: right;
  font-size: 1.125rem;
}

.order-status {
  margin-top: 12px;
  padding: 10px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.order-status.success {
  background-color: #dcfce7;
  color: #166534;
  border: 1px solid #bbf7d0;
}

.order-status.error {
  background-color: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.order-summary__footer {
  padding: 20px;
  border-top: 1px solid #e2e8f0;
}

@media (max-width: 768px) {
  .order-summary {
    position: relative;
    top: auto;
  }
  
  .order-summary__body {
    max-height: none;
  }
}
```

## Getting Started

1. **Install dependencies:**
   ```bash
   cd restaurant-billing
   npm install
   ```

2. **Update API configuration:**
   - Modify `src/utils/constants.js` to match your Django backend URL
   
3. **Start development server:**
   ```bash
   npm start
   ```

## Future Extensions

This structure is designed to be easily extensible:

### Adding Authentication
1. Create `src/contexts/AuthContext.js` for auth state management
2. Add `src/components/auth/LoginForm.js` and `src/pages/Login.js`
3. Update `src/components/layout/Header.js` to show login/logout

### Adding Routing
1. Install React Router: `npm install react-router-dom`
2. Create `src/routes/AppRoutes.js`
3. Add more pages in `src/pages/`

### Adding More Features
- **Order History**: `src/pages/OrderHistory.js`
- **Menu Management**: `src/pages/MenuManagement.js` (admin)
- **Analytics**: `src/pages/Analytics.js`
- **Settings**: `src/pages/Settings.js`

## Key Benefits of This Structure

1. **Separation of Concerns**: Clear separation between API calls, business logic, and UI
2. **Reusable Components**: Common components can be reused across the app
3. **Custom Hooks**: Business logic is encapsulated in reusable hooks
4. **Scalable**: Easy to add new features without restructuring
5. **Maintainable**: Well-organized code that's easy to understand and modify
6. **Future-Ready**: Structure supports adding authentication, routing, and more complex features