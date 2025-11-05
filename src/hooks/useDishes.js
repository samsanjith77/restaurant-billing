import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

const useDishes = (mealType = null) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Wrap fetchDishes in useCallback to avoid recreating it on every render
  const fetchDishes = useCallback(async (type = mealType) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dishes with optional meal_type filter
      const dishesData = await ApiService.getDishes(type);
      
      // Ensure we always get an array
      setDishes(Array.isArray(dishesData) ? dishesData : []);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err.message || 'Failed to load dishes');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, [mealType]);

  // Fetch dishes when component mounts or mealType changes
  useEffect(() => {
    fetchDishes(mealType);
  }, [fetchDishes, mealType]);

  // Function to manually refetch (useful for refresh button)
  const refetch = useCallback(async () => {
    await fetchDishes(mealType);
  }, [fetchDishes, mealType]);

  return { 
    dishes, 
    loading, 
    error, 
    refetch,
    fetchDishes
  };
};

export default useDishes;
