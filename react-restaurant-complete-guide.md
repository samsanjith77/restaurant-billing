
# 🚀 Adding Dish Management with React Router - Complete Implementation Guide

## 📦 Step 1: Install Required Dependencies

```bash
npm install react-router-dom
# For form handling and validation (optional but recommended)
npm install react-hook-form
```

## 📁 Step 2: Files to Modify and Create

### Files to MODIFY:
1. `src/App.js` - Add React Router
2. `src/components/layout/Header.js` - Add navigation
3. `src/services/api.js` - Add dish management APIs
4. `src/utils/constants.js` - Add new constants

### Files to CREATE:
1. `src/routes/AppRoutes.js` - Route definitions
2. `src/pages/DishManagement.js` - Main dish management page
3. `src/components/dishes/DishForm.js` - Form for creating dishes
4. `src/components/dishes/DishImageUpload.js` - Image upload component
5. `src/components/layout/Navigation.js` - Professional navigation
6. `src/contexts/AuthContext.js` - Auth context (future ready)
7. `src/styles/components/DishManagement.css` - Styling
8. `src/styles/components/Navigation.css` - Navigation styling

## 🔧 Step 3: Implementation Details

### 1. Update package.json (add these dependencies)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.1",
    "react-hook-form": "^7.48.2",
    "react-scripts": "5.0.1"
  }
}
```

### 2. src/App.js (MODIFIED)
```jsx
import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/AppRoutes';
import { AuthProvider } from './contexts/AuthContext';
import './styles/App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
```

### 3. src/routes/AppRoutes.js (NEW)
```jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import RestaurantBilling from '../pages/RestaurantBilling';
import DishManagement from '../pages/DishManagement';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Navigate to="/billing" replace />} />
        <Route path="billing" element={<RestaurantBilling />} />
        <Route path="dishes" element={<DishManagement />} />
        {/* Future routes */}
        <Route path="orders" element={<div>Order History Coming Soon</div>} />
        <Route path="analytics" element={<div>Analytics Coming Soon</div>} />
      </Route>
      <Route path="*" element={<Navigate to="/billing" replace />} />
    </Routes>
  );
};

export default AppRoutes;
```

### 4. src/components/layout/MainLayout.js (NEW)
```jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Navigation from './Navigation';

const MainLayout = () => {
  return (
    <>
      <Header />
      <Navigation />
      <main className="main-content">
        <div className="container">
          <Outlet />
        </div>
      </main>
    </>
  );
};

export default MainLayout;
```

### 5. src/components/layout/Header.js (MODIFIED)
```jsx
import React, { useContext } from 'react';
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/components/Header.css';

const Header = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <header className="header">
      <div className="container">
        <div className="header-content">
          <div className="brand">
            <h1 className="restaurant-name">🍽️ Delicious Kitchen</h1>
            <span className="tagline">Restaurant Management System</span>
          </div>
          <nav className="header-nav">
            {user ? (
              <div className="user-menu">
                <span className="welcome">Welcome, {user.name}</span>
                <button className="btn btn--outline" onClick={logout}>
                  Logout
                </button>
              </div>
            ) : (
              <button className="btn btn--outline">
                Login
              </button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
```

### 6. src/components/layout/Navigation.js (NEW)
```jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/components/Navigation.css';

const Navigation = () => {
  const navItems = [
    {
      path: '/billing',
      label: 'Billing System',
      icon: '💳'
    },
    {
      path: '/dishes',
      label: 'Dish Management',
      icon: '🍽️'
    },
    {
      path: '/orders',
      label: 'Order History',
      icon: '📋'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: '📊'
    }
  ];

  return (
    <nav className="main-navigation">
      <div className="container">
        <div className="nav-content">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `nav-item ${isActive ? 'nav-item--active' : ''}`
              }
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
```

### 7. src/contexts/AuthContext.js (NEW - Future Ready)
```jsx
import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token/user
    // For now, just set loading to false
    // In future, check localStorage or make API call
    const checkAuth = async () => {
      try {
        // const token = localStorage.getItem('authToken');
        // if (token) {
        //   const userData = await verifyToken(token);
        //   setUser(userData);
        // }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (credentials) => {
    try {
      setLoading(true);
      // const response = await apiLogin(credentials);
      // setUser(response.user);
      // localStorage.setItem('authToken', response.token);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    // localStorage.removeItem('authToken');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
```

### 8. src/services/api.js (MODIFIED - Add dish management)
```javascript
import { API_CONFIG } from '../utils/constants';

class ApiService {
  // Existing methods...
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

  // NEW: Dish Management Methods
  static async createDish(dishData) {
    try {
      const formData = new FormData();
      formData.append('name', dishData.name);
      formData.append('price', dishData.price);

      if (dishData.image) {
        formData.append('image', dishData.image);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_DISH}`, {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create dish: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  }

  static async updateDishImage(dishId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_IMAGE.replace('<dish_id>', dishId)}`, 
        {
          method: 'PATCH',
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update dish image: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating dish image:', error);
      throw error;
    }
  }
}

export default ApiService;
```

### 9. src/utils/constants.js (MODIFIED - Add new endpoints)
```javascript
export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/api',
  ENDPOINTS: {
    DISHES: '/dishes/',
    CREATE_ORDER: '/orders/create/',
    // NEW endpoints
    CREATE_DISH: '/dishes/create/',
    UPDATE_DISH_IMAGE: '/dishes/<dish_id>/update-image/'
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
  NO_DISHES: 'No dishes available',
  // NEW messages
  SUCCESS_DISH_CREATED: 'Dish created successfully!',
  SUCCESS_IMAGE_UPDATED: 'Dish image updated successfully!',
  ERROR_CREATE_DISH: 'Failed to create dish. Please try again.',
  ERROR_UPDATE_IMAGE: 'Failed to update image. Please try again.',
  CREATING_DISH: 'Creating dish...',
  UPDATING_IMAGE: 'Updating image...'
};

export const FILE_TYPES = {
  ACCEPTED_IMAGES: 'image/jpeg,image/jpg,image/png,image/webp',
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};
```

### 10. src/pages/DishManagement.js (NEW)
```jsx
import React, { useState } from 'react';
import DishForm from '../components/dishes/DishForm';
import DishList from '../components/dishes/DishList';
import useDishes from '../hooks/useDishes';
import '../styles/components/DishManagement.css';

const DishManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const { dishes, loading, error, refetch } = useDishes();

  const handleDishCreated = () => {
    refetch(); // Refresh the dish list
    setActiveTab('list'); // Switch back to list view
  };

  const handleImageUpdated = () => {
    refetch(); // Refresh the dish list
  };

  return (
    <div className="dish-management">
      <div className="dish-management__header">
        <h1>🍽️ Dish Management</h1>
        <p>Create and manage your restaurant dishes</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'list' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 All Dishes ({dishes.length})
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Add New Dish
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' && (
          <div className="tab-panel">
            <DishList
              dishes={dishes}
              loading={loading}
              error={error}
              onRetry={refetch}
              showActions={true}
              onImageUpdated={handleImageUpdated}
            />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="tab-panel">
            <DishForm onDishCreated={handleDishCreated} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DishManagement;
```

### 11. src/components/dishes/DishForm.js (NEW)
```jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ApiService from '../../services/api';
import Button from '../common/Button';
import { MESSAGES, FILE_TYPES } from '../../utils/constants';

const DishForm = ({ onDishCreated }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    watch 
  } = useForm();

  const watchedImage = watch('image');

  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [watchedImage]);

  const validateImage = (files) => {
    if (!files || files.length === 0) return true; // Image is optional

    const file = files[0];
    if (file.size > FILE_TYPES.MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB';
    }

    const acceptedTypes = FILE_TYPES.ACCEPTED_IMAGES.split(',');
    if (!acceptedTypes.includes(file.type)) {
      return 'Only JPEG, JPG, PNG, and WEBP images are allowed';
    }

    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const dishData = {
        name: data.name,
        price: parseFloat(data.price),
        image: data.image && data.image[0] ? data.image[0] : null
      };

      const result = await ApiService.createDish(dishData);

      setMessage({
        type: 'success',
        text: result.message || MESSAGES.SUCCESS_DISH_CREATED
      });

      reset();
      setImagePreview(null);

      if (onDishCreated) {
        onDishCreated();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || MESSAGES.ERROR_CREATE_DISH
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dish-form">
      <div className="dish-form__header">
        <h2>➕ Create New Dish</h2>
        <p>Add a new dish to your menu</p>
      </div>

      {message && (
        <div className={`message message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Dish Name *
            </label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="Enter dish name (e.g., Margherita Pizza)"
              {...register('name', {
                required: 'Dish name is required',
                minLength: {
                  value: 2,
                  message: 'Dish name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Dish name must be less than 100 characters'
                }
              })}
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              step="0.01"
              min="0"
              className={`form-input ${errors.price ? 'form-input--error' : ''}`}
              placeholder="Enter price (e.g., 299.00)"
              {...register('price', {
                required: 'Price is required',
                min: {
                  value: 0.01,
                  message: 'Price must be greater than 0'
                },
                max: {
                  value: 9999.99,
                  message: 'Price must be less than ₹10,000'
                }
              })}
            />
            {errors.price && (
              <span className="form-error">{errors.price.message}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">
            Dish Image (Optional)
          </label>
          <div className="image-upload-area">
            <input
              type="file"
              id="image"
              accept={FILE_TYPES.ACCEPTED_IMAGES}
              className={`form-input form-input--file ${errors.image ? 'form-input--error' : ''}`}
              {...register('image', {
                validate: validateImage
              })}
            />
            <div className="image-upload-info">
              <span>📷 Choose an image file (JPEG, PNG, WEBP)</span>
              <span>Maximum size: 5MB</span>
            </div>
          </div>
          {errors.image && (
            <span className="form-error">{errors.image.message}</span>
          )}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <span>Preview</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? MESSAGES.CREATING_DISH : '✨ Create Dish'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setImagePreview(null);
              setMessage(null);
            }}
            disabled={loading}
          >
            🔄 Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DishForm;
```

### 12. src/components/dishes/DishImageUpload.js (NEW)
```jsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ApiService from '../../services/api';
import Button from '../common/Button';
import { MESSAGES, FILE_TYPES } from '../../utils/constants';

const DishImageUpload = ({ dish, onImageUpdated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm();

  const watchedImage = watch('image');

  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [watchedImage]);

  const validateImage = (files) => {
    if (!files || files.length === 0) {
      return 'Please select an image file';
    }

    const file = files[0];
    if (file.size > FILE_TYPES.MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB';
    }

    const acceptedTypes = FILE_TYPES.ACCEPTED_IMAGES.split(',');
    if (!acceptedTypes.includes(file.type)) {
      return 'Only JPEG, JPG, PNG, and WEBP images are allowed';
    }

    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const result = await ApiService.updateDishImage(dish.id, data.image[0]);

      setMessage({
        type: 'success',
        text: result.message || MESSAGES.SUCCESS_IMAGE_UPDATED
      });

      if (onImageUpdated) {
        onImageUpdated();
      }

      // Auto close after success
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || MESSAGES.ERROR_UPDATE_IMAGE
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload-modal">
      <div className="modal-backdrop" onClick={onCancel}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>🖼️ Update Image for "{dish.name}"</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <div className="current-image">
            <img 
              src={dish.image || '/placeholder-dish.jpg'} 
              alt={dish.name}
              className="current-image__img"
            />
            <p>Current Image</p>
          </div>

          {message && (
            <div className={`message message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="new-image" className="form-label">
                Select New Image *
              </label>
              <input
                type="file"
                id="new-image"
                accept={FILE_TYPES.ACCEPTED_IMAGES}
                className={`form-input form-input--file ${errors.image ? 'form-input--error' : ''}`}
                {...register('image', {
                  validate: validateImage
                })}
              />
              {errors.image && (
                <span className="form-error">{errors.image.message}</span>
              )}
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="New preview" />
                <p>New Image Preview</p>
              </div>
            )}

            <div className="modal-actions">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || !watchedImage || watchedImage.length === 0}
              >
                {loading ? MESSAGES.UPDATING_IMAGE : '📤 Update Image'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                ❌ Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DishImageUpload;
```

### 13. src/components/dishes/DishList.js (MODIFIED - Add image update action)
```jsx
import React, { useState } from 'react';
import DishCard from './DishCard';
import DishImageUpload from './DishImageUpload';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import { MESSAGES } from '../../utils/constants';

const DishList = ({ 
  dishes, 
  loading, 
  error, 
  orderItems, 
  onQuantityChange, 
  onRetry,
  showActions = false,
  onImageUpdated 
}) => {
  const [selectedDish, setSelectedDish] = useState(null);

  if (loading) {
    return <LoadingSpinner message={MESSAGES.LOADING_DISHES} />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={onRetry} />;
  }

  if (!dishes.length) {
    return (
      <div className="no-dishes">
        <div className="no-dishes__content">
          <span className="no-dishes__icon">🍽️</span>
          <h3>No dishes found</h3>
          <p>{MESSAGES.NO_DISHES}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dishes-grid">
        {dishes.map(dish => (
          <DishCard
            key={dish.id}
            dish={dish}
            quantity={orderItems ? orderItems[dish.id] || 0 : 0}
            onQuantityChange={onQuantityChange}
            showActions={showActions}
            onUpdateImage={() => setSelectedDish(dish)}
          />
        ))}
      </div>

      {selectedDish && (
        <DishImageUpload
          dish={selectedDish}
          onImageUpdated={() => {
            if (onImageUpdated) onImageUpdated();
            setSelectedDish(null);
          }}
          onCancel={() => setSelectedDish(null)}
        />
      )}
    </>
  );
};

export default DishList;
```

### 14. src/components/dishes/DishCard.js (MODIFIED - Add update image action)
```jsx
import React from 'react';
import '../../styles/components/DishCard.css';

const DishCard = ({ 
  dish, 
  quantity = 0, 
  onQuantityChange, 
  showActions = false,
  onUpdateImage 
}) => {
  const handleQuantityChange = (e) => {
    if (onQuantityChange) {
      const newQuantity = parseInt(e.target.value) || 0;
      onQuantityChange(dish.id, newQuantity);
    }
  };

  const handleIncrement = () => {
    if (onQuantityChange) {
      onQuantityChange(dish.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (onQuantityChange && quantity > 0) {
      onQuantityChange(dish.id, quantity - 1);
    }
  };

  return (
    <div className="dish-card">
      {showActions && (
        <div className="dish-actions">
          <button 
            className="action-btn action-btn--update"
            onClick={onUpdateImage}
            title="Update Image"
          >
            📷
          </button>
        </div>
      )}

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

        {onQuantityChange && (
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
        )}
      </div>
    </div>
  );
};

export default DishCard;
```

## 🎨 Step 4: Professional Styling

### src/styles/components/Navigation.css (NEW)
```css
.main-navigation {
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-bottom: 3px solid #3b82f6;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.nav-content {
  display: flex;
  gap: 0;
  overflow-x: auto;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 24px;
  text-decoration: none;
  color: #cbd5e1;
  font-weight: 500;
  transition: all 0.3s ease;
  border-bottom: 3px solid transparent;
  white-space: nowrap;
  min-width: max-content;
}

.nav-item:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.nav-item--active {
  background-color: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-bottom-color: #3b82f6;
}

.nav-icon {
  font-size: 1.2rem;
}

.nav-label {
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .nav-item {
    padding: 12px 16px;
    flex-direction: column;
    gap: 4px;
  }

  .nav-icon {
    font-size: 1.1rem;
  }

  .nav-label {
    font-size: 0.75rem;
  }
}
```

### src/styles/components/DishManagement.css (NEW)
```css
.dish-management {
  padding: 20px 0;
}

.dish-management__header {
  text-align: center;
  margin-bottom: 30px;
}

.dish-management__header h1 {
  font-size: 2rem;
  color: #1e293b;
  margin-bottom: 8px;
}

.dish-management__header p {
  color: #64748b;
  font-size: 1.1rem;
}

/* Tabs */
.tabs {
  display: flex;
  background-color: #f1f5f9;
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 30px;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.tab {
  flex: 1;
  padding: 12px 20px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
}

.tab:hover {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.tab--active {
  background-color: #3b82f6;
  color: white;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
}

/* Tab Content */
.tab-content {
  min-height: 400px;
}

.tab-panel {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Dish Form */
.dish-form {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  padding: 30px;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dish-form__header {
  text-align: center;
  margin-bottom: 30px;
}

.dish-form__header h2 {
  color: #1e293b;
  margin-bottom: 8px;
}

.dish-form__header p {
  color: #64748b;
}

/* Form Styles */
.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-label {
  font-weight: 600;
  color: #374151;
  margin-bottom: 8px;
  font-size: 0.9rem;
}

.form-input {
  padding: 12px 16px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input--error {
  border-color: #ef4444;
}

.form-input--file {
  padding: 8px;
}

.form-error {
  color: #ef4444;
  font-size: 0.875rem;
  margin-top: 4px;
}

/* Image Upload */
.image-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  transition: border-color 0.2s ease;
}

.image-upload-area:hover {
  border-color: #3b82f6;
}

.image-upload-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.image-preview {
  margin-top: 15px;
  text-align: center;
}

.image-preview img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.image-preview span {
  display: block;
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 15px;
  justify-content: center;
  margin-top: 20px;
}

/* Messages */
.message {
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-weight: 500;
}

.message--success {
  background-color: #ecfdf5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.message--error {
  background-color: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Image Upload Modal */
.image-upload-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-backdrop {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  position: relative;
  background: white;
  border-radius: 16px;
  max-width: 600px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  margin: 0;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6b7280;
  padding: 4px;
}

.modal-close:hover {
  color: #374151;
}

.modal-body {
  padding: 20px;
}

.current-image {
  text-align: center;
  margin-bottom: 20px;
}

.current-image__img {
  max-width: 200px;
  max-height: 150px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.current-image p {
  margin-top: 8px;
  color: #6b7280;
  font-size: 0.875rem;
}

.modal-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

/* Dish Actions */
.dish-actions {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.action-btn {
  background: rgba(59, 130, 246, 0.9);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
}

.action-btn:hover {
  background: rgba(59, 130, 246, 1);
  transform: scale(1.1);
}

/* No dishes state */
.no-dishes {
  text-align: center;
  padding: 60px 20px;
}

.no-dishes__content {
  max-width: 400px;
  margin: 0 auto;
}

.no-dishes__icon {
  font-size: 4rem;
  display: block;
  margin-bottom: 20px;
}

.no-dishes h3 {
  color: #1e293b;
  margin-bottom: 10px;
}

.no-dishes p {
  color: #64748b;
}
```

### src/styles/components/Header.css (MODIFIED - More professional)
```css
.header {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  color: white;
  padding: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand {
  display: flex;
  flex-direction: column;
}

.restaurant-name {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
  background: linear-gradient(45deg, #ffffff, #e0e7ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  font-size: 0.875rem;
  color: #e0e7ff;
  font-weight: 400;
  margin-top: 2px;
}

.header-nav {
  display: flex;
  align-items: center;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.welcome {
  font-weight: 500;
  color: #e0e7ff;
}

@media (max-width: 768px) {
  .restaurant-name {
    font-size: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }

  .brand {
    align-items: center;
  }
}
```

## 🚀 Step 5: Getting Started

1. **Install dependencies:**
   ```bash
   npm install react-router-dom react-hook-form
   ```

2. **Copy all the new files** into your React project structure

3. **Update your existing files** with the modifications shown above

4. **Update your Django API base URL** in `src/utils/constants.js`

5. **Start the development server:**
   ```bash
   npm start
   ```

## 🎯 What You Get

✅ **Professional Navigation** - Tab-based navigation with active states
✅ **Dish Management Page** - Create dishes with image upload
✅ **Image Update Functionality** - Modal for updating dish images
✅ **Form Validation** - Comprehensive form validation with React Hook Form
✅ **File Upload** - Multipart form data handling for images
✅ **Responsive Design** - Mobile-friendly UI
✅ **Loading States** - Professional loading and error handling
✅ **Authentication Ready** - Context and structure for future auth
✅ **Router Integration** - Clean URL routing with React Router v6
✅ **Extensible Architecture** - Easy to add more features

## 🔮 Future Extensions Ready

- **Authentication**: Context is already set up
- **More Pages**: Just add routes and components
- **Permissions**: Easy to add role-based access
- **Analytics**: Structure supports data visualization
- **Mobile App**: API-first design supports mobile

This implementation gives you a professional, production-ready restaurant management system! 🎉