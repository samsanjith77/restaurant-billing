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