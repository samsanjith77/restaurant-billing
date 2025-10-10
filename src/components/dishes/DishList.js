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