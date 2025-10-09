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