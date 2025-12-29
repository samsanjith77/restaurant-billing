import { useState, useEffect, useCallback } from 'react';
import ApiService from '../services/api';

const useDishes = (mealType = null, category = null) => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = useCallback(async (meal = mealType, cat = category) => {
    try {
      setLoading(true);
      setError(null);
      
      // Build params object
      const params = {};
      if (meal) params.meal_type = meal;
      if (cat) params.category = cat;
      
      // Fetch dishes with filters
      const dishesData = await ApiService.getDishes(params);
      
      // Ensure we always get an array
      setDishes(Array.isArray(dishesData) ? dishesData : []);
    } catch (err) {
      console.error('Error fetching dishes:', err);
      setError(err.message || 'Failed to load dishes');
      setDishes([]);
    } finally {
      setLoading(false);
    }
  }, [mealType, category]);

  useEffect(() => {
    fetchDishes(mealType, category);
  }, [fetchDishes, mealType, category]);

  const refetch = useCallback(async () => {
    await fetchDishes(mealType, category);
  }, [fetchDishes, mealType, category]);

  return { 
    dishes, 
    loading, 
    error, 
    refetch,
    fetchDishes
  };
};

export default useDishes;
