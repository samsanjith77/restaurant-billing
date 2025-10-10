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