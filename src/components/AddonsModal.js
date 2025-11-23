import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import '../styles/components/AddonsModal.css';

const AddonsModal = ({ isOpen, onClose, onConfirm, activeMealType }) => {
  const [addonDishes, setAddonDishes] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addon dishes when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchAddonDishes();
    }
  }, [isOpen, activeMealType]);

  const fetchAddonDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      // Fetch dishes with dish_type='addons' and current meal_type
      const data = await ApiService.getDishes(activeMealType, 'addons');
      setAddonDishes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching addons:', err);
      setError(err.message || 'Failed to load add-ons');
      setAddonDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (addon, quantity) => {
    setSelectedAddons(prev => {
      const updated = { ...prev };
      if (quantity > 0) {
        updated[addon.id] = {
          id: addon.id,
          dish_id: addon.id,
          name: addon.name,
          secondary_name: addon.secondary_name,
          price: parseFloat(addon.price),
          quantity: quantity
        };
      } else {
        delete updated[addon.id];
      }
      return updated;
    });
  };

  const calculateAddonsTotal = () => {
    return Object.values(selectedAddons).reduce(
      (total, addon) => total + (addon.price * addon.quantity),
      0
    );
  };

  const handleConfirm = () => {
    onConfirm(Object.values(selectedAddons));
    setSelectedAddons({});
    onClose();
  };

  const handleCancel = () => {
    setSelectedAddons({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>🍦 Add Extras</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading-state">Loading add-ons...</div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchAddonDishes} className="retry-btn">Retry</button>
            </div>
          ) : addonDishes.length === 0 ? (
            <div className="empty-state">
              <p>No add-ons available for this meal time</p>
            </div>
          ) : (
            addonDishes.map((addon) => (
              <div key={addon.id} className="addon-item">
                <div className="addon-info">
                  <span className="addon-name">{addon.name}</span>
                  {addon.secondary_name && (
                    <span className="addon-secondary">{addon.secondary_name}</span>
                  )}
                  <span className="addon-price">₹{parseFloat(addon.price).toFixed(2)}</span>
                </div>
                <div className="addon-controls">
                  {selectedAddons[addon.id] ? (
                    <div className="qty-controls">
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(addon, selectedAddons[addon.id].quantity - 1)}
                      >
                        −
                      </button>
                      <span className="qty-value">{selectedAddons[addon.id].quantity}</span>
                      <button
                        className="qty-btn"
                        onClick={() => handleQuantityChange(addon, selectedAddons[addon.id].quantity + 1)}
                      >
                        +
                      </button>
                    </div>
                  ) : (
                    <button
                      className="add-addon-btn"
                      onClick={() => handleQuantityChange(addon, 1)}
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="modal-footer">
          <div className="addons-total">
            <span>Add-ons Total:</span>
            <span className="total-amount">₹{calculateAddonsTotal().toFixed(2)}</span>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
              disabled={Object.keys(selectedAddons).length === 0}
            >
              Confirm ({Object.keys(selectedAddons).length})
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonsModal;
