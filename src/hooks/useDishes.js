import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

const useDishes = (mealType = null, dishType = null) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = useCallback(async (type = mealType, dType = dishType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dishes with optional meal_type and dish_type filters
      const dishesData = await ApiService.getDishes(type, dType);
      
      // Ensure we always get an array
      setDishes(Array.isArray(dishesData) ? dishesData : []);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err.message || 'Failed to load dishes');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, [mealType, dishType]);

  useEffect(() => {
    fetchDishes(mealType, dishType);
  }, [fetchDishes, mealType, dishType]);

  const refetch = useCallback(async () => {
    await fetchDishes(mealType, dishType);
  }, [fetchDishes, mealType, dishType]);

  return { 
    dishes, 
    loading, 
    error, 
    refetch,
    fetchDishes
  };
};

export default useDishes;
