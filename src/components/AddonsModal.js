import React, { useState, useEffect } from 'react';
import ApiService from '../services/api';
import '../styles/components/AddonsModal.css';

const AddonsModal = ({ isOpen, onClose, onConfirm, selectedAddons: initialAddons = [] }) => {
  const [extrasDishes, setExtrasDishes] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initialize selected addons from props
  useEffect(() => {
    if (isOpen && initialAddons.length > 0) {
      const addonsMap = {};
      initialAddons.forEach(addon => {
        addonsMap[addon.id] = addon;
      });
      setSelectedAddons(addonsMap);
    }
  }, [isOpen, initialAddons]);

  // Fetch extras when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchExtras();
    }
  }, [isOpen]);

  const fetchExtras = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dishes with category='extras' - meal type independent
      const data = await ApiService.getExtras();
      setExtrasDishes(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching extras:', err);
      setError(err.message || 'Failed to load extras');
      setExtrasDishes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityChange = (extra, quantity) => {
    setSelectedAddons(prev => {
      const updated = { ...prev };
      if (quantity > 0) {
        updated[extra.id] = {
          id: extra.id,
          dish_id: extra.id,
          name: extra.name,
          secondary_name: extra.secondary_name,
          price: parseFloat(extra.price),
          quantity: quantity,
          category: extra.category
        };
      } else {
        delete updated[extra.id];
      }
      return updated;
    });
  };

  const isExtraSelected = (extraId) => {
    return !!selectedAddons[extraId];
  };

  const getExtraQuantity = (extraId) => {
    return selectedAddons[extraId]?.quantity || 0;
  };

  const calculateExtrasTotal = () => {
    return Object.values(selectedAddons).reduce(
      (total, addon) => total + (addon.price * addon.quantity),
      0
    );
  };

  const handleConfirm = () => {
    onConfirm(Object.values(selectedAddons));
    onClose();
  };

  const handleCancel = () => {
    // Reset to initial addons
    if (initialAddons.length > 0) {
      const addonsMap = {};
      initialAddons.forEach(addon => {
        addonsMap[addon.id] = addon;
      });
      setSelectedAddons(addonsMap);
    } else {
      setSelectedAddons({});
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content extras-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>✨ Select Extras</h3>
          <button className="close-btn" onClick={handleCancel}>×</button>
        </div>

        <div className="modal-body extras-modal-body">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading extras...</p>
            </div>
          ) : error ? (
            <div className="error-state">
              <p>{error}</p>
              <button onClick={fetchExtras} className="retry-btn">Retry</button>
            </div>
          ) : extrasDishes.length === 0 ? (
            <div className="empty-state">
              <p>No extras available</p>
            </div>
          ) : (
            <div className="extras-grid">
              {extrasDishes.map((extra) => {
                const isSelected = isExtraSelected(extra.id);
                const quantity = getExtraQuantity(extra.id);

                return (
                  <div 
                    key={extra.id} 
                    className={`extra-card ${isSelected ? 'selected' : ''}`}
                  >
                    {extra.image && (
                      <div className="extra-image">
                        <img src={extra.image} alt={extra.name} />
                      </div>
                    )}
                    
                    <div className="extra-details">
                      <h4 className="extra-name">{extra.name}</h4>
                      {extra.secondary_name && (
                        <p className="extra-secondary">{extra.secondary_name}</p>
                      )}
                      <p className="extra-price">₹{parseFloat(extra.price).toFixed(2)}</p>
                    </div>

                    <div className="extra-actions">
                      {isSelected ? (
                        <div className="qty-controls">
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(extra, quantity - 1)}
                          >
                            −
                          </button>
                          <span className="qty-value">{quantity}</span>
                          <button
                            className="qty-btn"
                            onClick={() => handleQuantityChange(extra, quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="add-extra-btn"
                          onClick={() => handleQuantityChange(extra, 1)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <div className="extras-summary">
            <span className="summary-label">Extras Total:</span>
            <span className="summary-amount">₹{calculateExtrasTotal().toFixed(2)}</span>
          </div>
          <div className="modal-actions">
            <button className="btn-cancel" onClick={handleCancel}>
              Cancel
            </button>
            <button 
              className="btn-confirm" 
              onClick={handleConfirm}
            >
              Done ({Object.keys(selectedAddons).length} selected)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddonsModal;
