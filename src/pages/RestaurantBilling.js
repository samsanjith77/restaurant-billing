import React, { useState, useMemo } from 'react';
import useDishes from '../hooks/useDishes';
import ApiService from '../services/api';
import { ORDER_TYPES, PAYMENT_TYPES, MESSAGES } from '../utils/constants';
import AddonsModal from '../components/AddonsModal';
import '../styles/components/RestaurantBilling.css';


const RestaurantBilling = () => {
  const [activeMealType, setActiveMealType] = useState('afternoon');
  const { dishes, loading, error, refetch } = useDishes(activeMealType, 'meals');
  const [orderItems, setOrderItems] = useState({});
  const [orderType, setOrderType] = useState(ORDER_TYPES.DINE_IN);
  const [paymentType, setPaymentType] = useState(PAYMENT_TYPES.CASH);
  const [addons, setAddons] = useState([]);
  const [showAddonsModal, setShowAddonsModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState(null);
  const [showSecondaryNames, setShowSecondaryNames] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');


  const mealTypes = [
    { key: 'morning', label: 'Morning' },
    { key: 'afternoon', label: 'Afternoon' },
    { key: 'night', label: 'Night' },
  ];


  // Filter dishes based on search query
  const filteredDishes = useMemo(() => {
    if (!searchQuery.trim()) return dishes;
    
    const query = searchQuery.toLowerCase();
    return dishes.filter(dish => {
      const dishName = dish.name?.toLowerCase() || '';
      const secondaryName = dish.secondary_name?.toLowerCase() || '';
      return dishName.includes(query) || secondaryName.includes(query);
    });
  }, [dishes, searchQuery]);


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


  const calculateDishesTotal = () => {
    return Object.entries(orderItems).reduce((total, [dishId, qty]) => {
      const dish = dishes.find(d => d.id === parseInt(dishId));
      return total + (dish ? parseFloat(dish.price) * qty : 0);
    }, 0);
  };


  const calculateAddonsTotal = () => {
    return addons.reduce((total, addon) => total + (addon.price * addon.quantity), 0);
  };


  const calculateTotal = () => calculateDishesTotal() + calculateAddonsTotal();


  const getOrderedDishes = () => {
    return Object.entries(orderItems)
      .map(([dishId, quantity]) => {
        const dish = dishes.find(d => d.id === parseInt(dishId));
        return dish ? { ...dish, quantity } : null;
      })
      .filter(Boolean);
  };


  const handleAddonsConfirm = (selectedAddons) => {
    setAddons(selectedAddons);
    setShowAddonsModal(false);
  };


  const handleRemoveAddon = (addonId) => {
    setAddons(prev => prev.filter(addon => addon.id !== addonId));
  };


  const handlePlaceOrder = async () => {
    if (Object.keys(orderItems).length === 0 && addons.length === 0) {
      setMessage({ type: 'error', text: MESSAGES.EMPTY_ORDER });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsProcessing(true);
    setMessage(null);


    try {
      const items = Object.entries(orderItems).map(([dishId, qty]) => ({
        dish_id: parseInt(dishId),
        quantity: qty,
      }));


      const orderData = {
        items: items,
        total_amount: calculateTotal(),
        order_type: orderType,
        payment_type: paymentType,
        addons: addons.map(a => ({
          id: a.id,
          dish_id: a.dish_id,
          name: a.name,
          secondary_name: a.secondary_name,
          price: a.price,
          quantity: a.quantity,
        })),
      };


      const response = await ApiService.createOrder(orderData);
      setMessage({ type: 'success', text: response.message || MESSAGES.SUCCESS_ORDER });


      setOrderItems({});
      setAddons([]);
      setOrderType(ORDER_TYPES.DINE_IN);
      setPaymentType(PAYMENT_TYPES.CASH);
      setSearchQuery('');
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || MESSAGES.ERROR_CREATE_ORDER });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleClearCart = () => {
    if (Object.keys(orderItems).length === 0 && addons.length === 0) return;
    if (window.confirm('Clear all items from cart?')) {
      setOrderItems({});
      setAddons([]);
    }
  };


  const getTotalItems = () => {
    const dishCount = Object.values(orderItems).reduce((sum, qty) => sum + qty, 0);
    const addonCount = addons.reduce((sum, a) => sum + a.quantity, 0);
    return dishCount + addonCount;
  };


  const orderedDishes = getOrderedDishes();


  const getDishDisplayName = (dish) => {
    return showSecondaryNames && dish.secondary_name ? dish.secondary_name : dish.name;
  };


  const handleClearSearch = () => {
    setSearchQuery('');
  };


  return (
    <div className="restaurant-billing">
      {/* HEADER BAR */}
      <div className="unified-header-bar">
        <div className="header-left">
          <button
            className="page-view-btn"
            onClick={() => setShowSecondaryNames(prev => !prev)}
          >
            {showSecondaryNames ? "Main Language" : "Secondary Language"}
          </button>
          
          {/* SEARCH BOX IN HEADER */}
          <div className="search-input-wrapper-header">
            <span className="search-icon-header">🔍</span>
            <input
              type="text"
              className="search-input-header"
              placeholder="Search dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="clear-search-btn-header" onClick={handleClearSearch} title="Clear">
                ×
              </button>
            )}
          </div>
        </div>


        <div className="header-center">
          {mealTypes.map(m => (
            <button
              key={m.key}
              className={`meal-type-btn ${activeMealType === m.key ? 'active' : ''}`}
              onClick={() => setActiveMealType(m.key)}
            >
              {m.label}
            </button>
          ))}
        </div>


        <div className="header-right">
          {searchQuery && filteredDishes.length > 0 && (
            <span className="search-count-header">{filteredDishes.length} found</span>
          )}
          <button
            className="refresh-btn"
            onClick={refetch}
            disabled={loading}
            title="Refresh"
          >
            ↻
          </button>
        </div>
      </div>


      {/* NOTIFICATION */}
      {message && (
        <div className={`notification notification--${message.type}`}>
          {message.text}
        </div>
      )}


      {/* MAIN CONTENT */}
      <div className="billing-content">
        {/* LEFT - DISHES SECTION */}
        <div className="dishes-section">
          {loading ? (
            <div className="loading-state">Loading menu...</div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={refetch} className="retry-btn">Retry</button>
            </div>
          ) : filteredDishes.length === 0 ? (
            <div className="empty-state">
              {searchQuery ? (
                <>
                  <p>No dishes found for "{searchQuery}"</p>
                  <button onClick={handleClearSearch} className="retry-btn">Clear Search</button>
                </>
              ) : (
                <p>No dishes available for this meal type</p>
              )}
            </div>
          ) : (
            <div className="dishes-grid-billing">
              {filteredDishes.map(dish => (
                <div key={dish.id} className="dish-card-billing">
                  {dish.image && (
                    <div className="dish-img-billing">
                      <img src={dish.image} alt={getDishDisplayName(dish)} />
                    </div>
                  )}
                  <div className="dish-info-billing">
                    <h4 className="dish-name-billing">{getDishDisplayName(dish)}</h4>
                    {showSecondaryNames && dish.secondary_name && (
                      <p className="dish-secondary-name-billing">{dish.name}</p>
                    )}
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


        {/* RIGHT - ORDER SECTION */}
        <div className="order-section">
          {/* HEADER */}
          <div className="order-header">
            <h3>Cart ({getTotalItems()})</h3>
            {getTotalItems() > 0 && (
              <button className="text-btn text-btn--danger" onClick={handleClearCart}>Clear</button>
            )}
          </div>


          {/* COMPACT CONTROLS - ORDER TYPE, PAYMENT, ADDONS */}
          <div className="order-controls">
            {/* ORDER TYPE */}
            <div className="order-type-compact">
              <label className="compact-label">Type</label>
              <div className="type-toggle">
                <button
                  className={`type-option ${orderType === ORDER_TYPES.DINE_IN ? 'active' : ''}`}
                  onClick={() => setOrderType(ORDER_TYPES.DINE_IN)}
                  title="Dine In"
                >
                  Dine
                </button>
                <button
                  className={`type-option ${orderType === ORDER_TYPES.DELIVERY ? 'active' : ''}`}
                  onClick={() => setOrderType(ORDER_TYPES.DELIVERY)}
                  title="Delivery"
                >
                  Delivery
                </button>
              </div>
            </div>


            {/* PAYMENT TYPE */}
            <div className="payment-type-section">
              <label className="compact-label">Pay</label>
              <div className="payment-toggle">
                <button
                  className={`payment-option ${paymentType === PAYMENT_TYPES.CASH ? 'active' : ''}`}
                  onClick={() => setPaymentType(PAYMENT_TYPES.CASH)}
                  title="Cash"
                >
                  Cash
                </button>
                <button
                  className={`payment-option ${paymentType === PAYMENT_TYPES.UPI ? 'active' : ''}`}
                  onClick={() => setPaymentType(PAYMENT_TYPES.UPI)}
                  title="UPI"
                >
                  UPI
                </button>
                <button
                  className={`payment-option ${paymentType === PAYMENT_TYPES.CARD ? 'active' : ''}`}
                  onClick={() => setPaymentType(PAYMENT_TYPES.CARD)}
                  title="Card"
                >
                  Card
                </button>
              </div>
            </div>


            {/* ADDONS BUTTON */}
            <div className="addons-section">
              <button
                className="addons-btn-compact"
                onClick={() => setShowAddonsModal(true)}
                title="Add Extras"
              >
                Extras {addons.length > 0 && `(${addons.length})`}
              </button>
            </div>
          </div>


          {/* ORDER SUMMARY - SCROLLABLE */}
          <div className="order-summary">
            {(orderedDishes.length === 0 && addons.length === 0) ? (
              <div className="empty-state">
                <div className="empty-cart-icon">🛒</div>
                <p>Cart is empty</p>
                <span>Add items from menu</span>
              </div>
            ) : (
              <div className="order-items">
                {/* DISHES */}
                {orderedDishes.map(dish => (
                  <div key={dish.id} className="order-item">
                    <div className="item-details">
                      <span className="item-name">{getDishDisplayName(dish)}</span>
                      <span className="item-price">₹{parseFloat(dish.price).toFixed(2)}</span>
                    </div>
                    <div className="item-actions">
                      <div className="qty-control">
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(dish.id, dish.quantity - 1)}
                        >−</button>
                        <span className="qty-value">{dish.quantity}</span>
                        <button
                          className="qty-btn"
                          onClick={() => handleQuantityChange(dish.id, dish.quantity + 1)}
                        >+</button>
                      </div>
                      <span className="item-subtotal">₹{(parseFloat(dish.price) * dish.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                ))}


                {/* ADDONS */}
                {addons.length > 0 && (
                  <>
                    <div className="addons-divider">Extras</div>
                    {addons.map(addon => (
                      <div key={addon.id} className="order-item addon-item-display">
                        <div className="item-details">
                          <span className="item-name">{addon.name}</span>
                          <span className="item-price">₹{addon.price.toFixed(2)}</span>
                        </div>
                        <div className="item-actions">
                          <span className="qty-value">× {addon.quantity}</span>
                          <button
                            className="remove-addon-btn"
                            onClick={() => handleRemoveAddon(addon.id)}
                            title="Remove"
                          >×</button>
                          <span className="item-subtotal">₹{(addon.price * addon.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>


          {/* ORDER FOOTER - TOTAL & PLACE ORDER */}
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


      {/* ADDONS MODAL */}
      <AddonsModal
        isOpen={showAddonsModal}
        onClose={() => setShowAddonsModal(false)}
        onConfirm={handleAddonsConfirm}
        fetchParams={{ dishtype: 'addons' }}
      />
    </div>
  );
};


export default RestaurantBilling;
