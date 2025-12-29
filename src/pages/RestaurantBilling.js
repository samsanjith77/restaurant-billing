import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import AddonsModal from '../components/AddonsModal';
import '../styles/components/RestaurantBilling.css';


const RestaurantBilling = () => {
  const navigate = useNavigate();

  // State management
  const [selectedMealType, setSelectedMealType] = useState('afternoon');
  const [categoriesData, setCategoriesData] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredDishesCount, setFilteredDishesCount] = useState(0);
  const [showExtrasModal, setShowExtrasModal] = useState(false);
  const [showSecondaryLanguage, setShowSecondaryLanguage] = useState(false); // Language toggle state

  // Order details
  const [orderType, setOrderType] = useState('dine-in');
  const [paymentType, setPaymentType] = useState('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);


  // Meal type options
  const mealTypes = [
    { value: 'morning', label: 'Morning' },
    { value: 'afternoon', label: 'Afternoon' },
    { value: 'night', label: 'Night' }
  ];


  // Fetch dishes grouped by category - wrapped with useCallback
  const fetchDishesByCategory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch dishes grouped by category (automatically excludes extras)
      const data = await ApiService.getDishesByCategory(selectedMealType);
      setCategoriesData(data);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err.message || 'Failed to load menu');
    } finally {
      setLoading(false);
    }
  }, [selectedMealType]);


  // Filter dishes by search query - wrapped with useCallback
  const filterDishesBySearch = useCallback((dishes) => {
    if (!searchQuery.trim()) return dishes;

    const query = searchQuery.toLowerCase();
    return dishes.filter(dish => 
      dish.name.toLowerCase().includes(query) ||
      (dish.secondary_name && dish.secondary_name.toLowerCase().includes(query))
    );
  }, [searchQuery]);


  // Fetch dishes on mount and meal type change
  useEffect(() => {
    fetchDishesByCategory();
  }, [fetchDishesByCategory]);


  // Update filtered dishes count when search changes
  useEffect(() => {
    let count = 0;
    categoriesData.forEach(category => {
      const filtered = filterDishesBySearch(category.dishes);
      count += filtered.length;
    });
    setFilteredDishesCount(count);
  }, [categoriesData, filterDishesBySearch]);


  // Open extras modal
  const handleOpenExtrasModal = () => {
    setShowExtrasModal(true);
  };


  // Handle extras confirmation
  const handleExtrasConfirm = (addons) => {
    setSelectedAddons(addons);
    if (addons.length > 0) {
      showNotification(`${addons.length} extras added`);
    }
  };


  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };


  // Toggle language display
  const toggleLanguage = () => {
    setShowSecondaryLanguage(!showSecondaryLanguage);
  };


  // Get dish name based on language preference
  const getDishName = (dish) => {
    if (showSecondaryLanguage && dish.secondary_name) {
      return dish.secondary_name;
    }
    return dish.name;
  };


  // Cart functions
  const addToCart = (dish) => {
    const existingItem = cart.find(item => item.id === dish.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === dish.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...dish, quantity: 1 }]);
    }
    const displayName = getDishName(dish);
    showNotification(`${displayName} added to cart`);
  };


  const updateQuantity = (dishId, change) => {
    setCart(cart.map(item => {
      if (item.id === dishId) {
        const newQuantity = item.quantity + change;
        return newQuantity > 0 ? { ...item, quantity: newQuantity } : null;
      }
      return item;
    }).filter(Boolean));
  };


  const clearCart = () => {
    if (window.confirm('Clear all items from cart?')) {
      setCart([]);
      setSelectedAddons([]);
      showNotification('Cart cleared', 'error');
    }
  };


  // Extras/Addons functions
  const updateAddonQuantity = (extraId, change) => {
    setSelectedAddons(selectedAddons.map(addon => {
      if (addon.id === extraId) {
        const newQuantity = addon.quantity + change;
        return newQuantity > 0 ? { ...addon, quantity: newQuantity } : null;
      }
      return addon;
    }).filter(Boolean));
  };


  const removeAddon = (extraId) => {
    setSelectedAddons(selectedAddons.filter(addon => addon.id !== extraId));
  };


  // Calculate total
  const calculateTotal = () => {
    const cartTotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    const addonsTotal = selectedAddons.reduce((sum, addon) => sum + (parseFloat(addon.price) * addon.quantity), 0);
    return cartTotal + addonsTotal;
  };


  // Get quantity for a dish from cart
  const getQuantityInCart = (dishId) => {
    const item = cart.find(i => i.id === dishId);
    return item ? item.quantity : 0;
  };


  // Navigate back to previous page
  const handleGoBack = () => {
    navigate(-1);
  };


  // Submit order
  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      showNotification('Please add items to your cart', 'error');
      return;
    }


    const confirmOrder = window.confirm(
      `Place order for ₹${calculateTotal().toFixed(2)}?`
    );


    if (!confirmOrder) return;


    setIsSubmitting(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          dish_id: item.id,
          quantity: item.quantity
        })),
        addons: selectedAddons.map(addon => ({
          dish_id: addon.id,
          quantity: addon.quantity
        })),
        total_amount: calculateTotal(),
        order_type: orderType,
        payment_type: paymentType
      };


      await ApiService.createOrder(orderData);

      showNotification('Order placed successfully!');
      setCart([]);
      setSelectedAddons([]);
    } catch (err) {
      showNotification(err.message || 'Failed to place order', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="restaurant-billing">
      {/* Notification */}
      {notification && (
        <div className={`notification notification--${notification.type}`}>
          {notification.message}
        </div>
      )}


      {/* Unified Header Bar */}
      <div className="unified-header-bar">
        <div className="header-left">
          <button className="page-view-btn" onClick={handleGoBack}>
            ← Back
          </button>


          {/* Language Toggle Button */}
          <button 
            className={`language-toggle-btn ${showSecondaryLanguage ? 'active' : ''}`}
            onClick={toggleLanguage}
            title={showSecondaryLanguage ? 'Show English' : 'Show Tamil'}
          >
            {showSecondaryLanguage ? 'EN' : 'தமிழ்'}
          </button>


          {/* Search Box */}
          <div className="search-input-wrapper-header">
            <span className="search-icon-header">🔍</span>
            <input
              type="text"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-header"
            />
            {searchQuery && (
              <button
                className="clear-search-btn-header"
                onClick={() => setSearchQuery('')}
              >
                ×
              </button>
            )}
          </div>
        </div>


        {/* Meal Type Selector */}
        <div className="header-center">
          {mealTypes.map(meal => (
            <button
              key={meal.value}
              className={`meal-type-btn ${selectedMealType === meal.value ? 'active' : ''}`}
              onClick={() => setSelectedMealType(meal.value)}
            >
              {meal.label}
            </button>
          ))}
        </div>


        <div className="header-right">
          {searchQuery && (
            <span className="search-count-header">
              {filteredDishesCount} dishes found
            </span>
          )}
          <button 
            className="refresh-btn" 
            onClick={fetchDishesByCategory}
            disabled={loading}
          >
            🔄
          </button>
        </div>
      </div>


      {/* Main Content - Grid Layout */}
      <div className="billing-content">
        {/* Left - Dishes Section with Horizontal Scroll */}
        <div className="dishes-section">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-large"></div>
              <p>Loading menu...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchDishesByCategory} className="retry-btn">
                Retry
              </button>
            </div>
          ) : categoriesData.length === 0 ? (
            <div className="empty-state">
              <p>No dishes available for {selectedMealType}</p>
            </div>
          ) : (
            <div className="categories-horizontal-container">
              {categoriesData.map(category => {
                const filteredDishes = filterDishesBySearch(category.dishes);

                // Skip category if no dishes match search
                if (searchQuery && filteredDishes.length === 0) return null;


                return (
                  <div key={category.category} className="category-column">
                    {/* Category Header */}
                    <div className="category-header-column">
                      <h3>{category.category_display}</h3>
                      <span className="category-count-badge">
                        {searchQuery ? filteredDishes.length : category.total_dishes}
                      </span>
                    </div>


                    {/* Dishes in Rows with Vertical Scroll */}
                    <div className="dishes-rows-container">
                      {filteredDishes.map(dish => {
                        const quantityInCart = getQuantityInCart(dish.id);
                        const displayName = getDishName(dish);


                        return (
                          <div key={dish.id} className="dish-row-item">
                            {dish.image && (
                              <div className="dish-img-row">
                                <img src={dish.image} alt={displayName} />
                              </div>
                            )}

                            <div className="dish-info-row">
                              <h4 className="dish-name-row">{displayName}</h4>
                              {/* Show both languages on hover or as subtitle */}
                              {!showSecondaryLanguage && dish.secondary_name && (
                                <p className="dish-secondary-name-row">
                                  {dish.secondary_name}
                                </p>
                              )}
                              {showSecondaryLanguage && dish.name && (
                                <p className="dish-secondary-name-row">
                                  {dish.name}
                                </p>
                              )}
                              <p className="dish-price-row">
                                ₹{parseFloat(dish.price).toFixed(2)}
                              </p>
                            </div>


                            <div className="dish-action-row">
                              {quantityInCart > 0 ? (
                                <div className="qty-controls-row">
                                  <button
                                    className="qty-btn-row"
                                    onClick={() => updateQuantity(dish.id, -1)}
                                  >
                                    −
                                  </button>
                                  <span className="qty-display-row">{quantityInCart}</span>
                                  <button
                                    className="qty-btn-row"
                                    onClick={() => updateQuantity(dish.id, 1)}
                                  >
                                    +
                                  </button>
                                </div>
                              ) : (
                                <button
                                  className="add-btn-row"
                                  onClick={() => addToCart(dish)}
                                >
                                  + Add
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>


        {/* Right - Order Section (Sticky Cart) */}
        <div className="order-section">
          {/* Order Header */}
          <div className="order-header">
            <h3>Current Order ({cart.length + selectedAddons.length})</h3>
            {(cart.length > 0 || selectedAddons.length > 0) && (
              <button className="text-btn text-btn--danger" onClick={clearCart}>
                Clear
              </button>
            )}
          </div>


          {/* Order Controls */}
          <div className="order-controls">
            {/* Order Type */}
            <div className="order-type-compact">
              <label className="compact-label">Order Type</label>
              <div className="type-toggle">
                <button
                  className={`type-option ${orderType === 'dine-in' ? 'active' : ''}`}
                  onClick={() => setOrderType('dine-in')}
                >
                  Dine In
                </button>
                <button
                  className={`type-option ${orderType === 'delivery' ? 'active' : ''}`}
                  onClick={() => setOrderType('delivery')}
                >
                  Delivery
                </button>
              </div>
            </div>


            {/* Payment Type */}
            <div className="payment-type-section">
              <label className="compact-label">Payment</label>
              <div className="payment-toggle">
                <button
                  className={`payment-option ${paymentType === 'cash' ? 'active' : ''}`}
                  onClick={() => setPaymentType('cash')}
                >
                  Cash
                </button>
                <button
                  className={`payment-option ${paymentType === 'upi' ? 'active' : ''}`}
                  onClick={() => setPaymentType('upi')}
                >
                  UPI
                </button>
                <button
                  className={`payment-option ${paymentType === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentType('card')}
                >
                  Card
                </button>
              </div>
            </div>


            {/* Extras Button */}
            <div className="addons-section">
              <button
                className="addons-btn-compact"
                onClick={handleOpenExtrasModal}
              >
                + Extras
                {selectedAddons.length > 0 && (
                  <span className="extras-badge">{selectedAddons.length}</span>
                )}
              </button>
            </div>
          </div>


          {/* Order Summary */}
          <div className="order-summary">
            {cart.length === 0 && selectedAddons.length === 0 ? (
              <div className="empty-state">
                <div className="empty-cart-icon">🛒</div>
                <p>Cart is empty</p>
                <span>Add items from menu</span>
              </div>
            ) : (
              <div className="order-items">
                {/* Main Cart Items */}
                {cart.map(item => {
                  const itemDisplayName = getDishName(item);

                  return (
                    <div key={item.id} className="order-item">
                      <div className="item-details">
                        <div className="item-name">
                          {itemDisplayName}
                          {!showSecondaryLanguage && item.secondary_name && (
                            <span className="item-secondary"> • {item.secondary_name}</span>
                          )}
                          {showSecondaryLanguage && item.name && item.name !== item.secondary_name && (
                            <span className="item-secondary"> • {item.name}</span>
                          )}
                        </div>
                        <div className="item-price">₹{parseFloat(item.price).toFixed(2)}</div>
                      </div>
                      <div className="item-actions">
                        <div className="qty-control">
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, -1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{item.quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => updateQuantity(item.id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <div className="item-subtotal">
                          ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  );
                })}


                {/* Addons/Extras Divider */}
                {selectedAddons.length > 0 && (
                  <>
                    <div className="addons-divider">
                      ✨ Extras ({selectedAddons.length})
                    </div>
                    {selectedAddons.map(addon => {
                      const addonDisplayName = getDishName(addon);

                      return (
                        <div key={addon.id} className="order-item addon-item-display">
                          <div className="item-details">
                            <div className="item-name">
                              {addonDisplayName}
                              {!showSecondaryLanguage && addon.secondary_name && (
                                <span className="item-secondary"> • {addon.secondary_name}</span>
                              )}
                              {showSecondaryLanguage && addon.name && addon.name !== addon.secondary_name && (
                                <span className="item-secondary"> • {addon.name}</span>
                              )}
                            </div>
                            <div className="item-price">₹{parseFloat(addon.price).toFixed(2)}</div>
                          </div>
                          <div className="item-actions">
                            <div className="qty-control">
                              <button
                                className="qty-btn"
                                onClick={() => updateAddonQuantity(addon.id, -1)}
                              >
                                −
                              </button>
                              <span className="qty-value">{addon.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => updateAddonQuantity(addon.id, 1)}
                              >
                                +
                              </button>
                            </div>
                            <button
                              className="remove-addon-btn"
                              onClick={() => removeAddon(addon.id)}
                              title="Remove extra"
                            >
                              ×
                            </button>
                            <div className="item-subtotal">
                              ₹{(parseFloat(addon.price) * addon.quantity).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </>
                )}
              </div>
            )}
          </div>


          {/* Order Footer */}
          {(cart.length > 0 || selectedAddons.length > 0) && (
            <div className="order-footer">
              <div className="total-row">
                <span className="total-label">Total</span>
                <span className="total-value">₹{calculateTotal().toFixed(2)}</span>
              </div>
              <button
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={isSubmitting || cart.length === 0}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          )}
        </div>
      </div>


      {/* Extras Modal */}
      <AddonsModal
        isOpen={showExtrasModal}
        onClose={() => setShowExtrasModal(false)}
        onConfirm={handleExtrasConfirm}
        selectedAddons={selectedAddons}
      />
    </div>
  );
};


export default RestaurantBilling;