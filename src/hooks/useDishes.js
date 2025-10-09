import { useState, useEffect } from 'react';
import ApiService from '../services/api';

const useDishes = () => {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDishes = async () => {
    try {
      setLoading(true);
      setError(null);
      const dishesData = await ApiService.getDishes();
      setDishes(dishesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDishes();
  }, []);

  return { dishes, loading, error, refetch: fetchDishes };
};

export default useDishes;