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