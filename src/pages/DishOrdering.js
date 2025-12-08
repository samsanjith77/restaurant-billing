import React, { useState, useEffect } from 'react';
import { ReactSortable } from 'react-sortablejs';
import ApiService from '../services/api';
import '../styles/components/DishOrdering.css';

const DishOrdering = () => {
  const [mealTypesData, setMealTypesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch dishes grouped by meal type
  useEffect(() => {
    fetchDishesForOrdering();
  }, []);

  const fetchDishesForOrdering = async () => {
    try {
      setLoading(true);
      console.log('Fetching dishes for ordering...');
      const data = await ApiService.getDishesForOrdering();
      console.log('Received data:', data);
      
      // Transform data to add unique id for sortable
      const transformedData = data.map(mealType => ({
        ...mealType,
        dishes: mealType.dishes.map(dish => ({
          ...dish,
          chosen: false,
          selected: false
        }))
      }));
      
      console.log('Transformed data:', transformedData);
      setMealTypesData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dishes:', error);
      setMessage({ type: 'error', text: `Failed to load dishes: ${error.message}` });
      setLoading(false);
    }
  };

  // Handle dish reorder within a meal type
  const handleReorder = (mealTypeIndex, newDishes) => {
    const updatedMealTypes = [...mealTypesData];
    updatedMealTypes[mealTypeIndex].dishes = newDishes;
    setMealTypesData(updatedMealTypes);
    setHasChanges(true);
  };

  // Save all changes
  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      console.log('Starting save process...');
      console.log('Meal types data:', mealTypesData);

      // Save order for each meal type
      for (const mealType of mealTypesData) {
        console.log(`Saving order for ${mealType.meal_type}:`, mealType.dishes);
        
        const dishesOrder = mealType.dishes.map((dish, index) => ({
          dish_id: dish.id,
          order: index
        }));

        console.log('Dishes order payload:', {
          meal_type: mealType.meal_type,
          dishes: dishesOrder
        });

        try {
          const result = await ApiService.reorderDishes(mealType.meal_type, dishesOrder);
          console.log('Save result:', result);
        } catch (error) {
          console.error(`Error saving ${mealType.meal_type}:`, error);
          throw error; // Re-throw to catch in outer try-catch
        }
      }

      setMessage({ 
        type: 'success', 
        text: 'All dish orders saved successfully!' 
      });
      setHasChanges(false);
      setSaving(false);

      // Clear message after 3 seconds
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving order:', error);
      console.error('Error details:', error.message);
      setMessage({ 
        type: 'error', 
        text: `Failed to save dish orders: ${error.message}` 
      });
      setSaving(false);
    }
  };

  // Reset to original order
  const handleReset = () => {
    fetchDishesForOrdering();
    setHasChanges(false);
    setMessage({ type: 'info', text: 'Order reset to saved state' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="dish-ordering-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading dishes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dish-ordering-container">
      <div className="ordering-header">
        <h1>Manage Dish Order</h1>
        <p className="subtitle">Drag and drop to reorder dishes within each meal time</p>
        
        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={!hasChanges || saving}
          >
            {saving ? 'Saving...' : 'Save All Changes'}
          </button>
          <button 
            className="btn btn-secondary"
            onClick={handleReset}
            disabled={!hasChanges || saving}
          >
            Reset
          </button>
        </div>
      </div>

      <div className="meal-types-grid">
        {mealTypesData.map((mealType, mealIndex) => (
          <div key={mealType.meal_type} className="meal-type-column">
            <div className="meal-type-header">
              <h2>{mealType.meal_type_display}</h2>
              <span className="dish-count">{mealType.total_dishes} dishes</span>
            </div>

            <ReactSortable
              list={mealType.dishes}
              setList={(newList) => handleReorder(mealIndex, newList)}
              animation={200}
              ghostClass="sortable-ghost"
              chosenClass="sortable-chosen"
              dragClass="sortable-drag"
              className="dishes-list"
              handle=".drag-handle"
            >
              {mealType.dishes.map((dish, index) => (
                <div key={dish.id} className="dish-item">
                  <div className="drag-handle">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                      <circle cx="5" cy="5" r="1.5"/>
                      <circle cx="5" cy="10" r="1.5"/>
                      <circle cx="5" cy="15" r="1.5"/>
                      <circle cx="10" cy="5" r="1.5"/>
                      <circle cx="10" cy="10" r="1.5"/>
                      <circle cx="10" cy="15" r="1.5"/>
                    </svg>
                  </div>
                  
                  <div className="dish-image">
                    {dish.image ? (
                      <img src={dish.image} alt={dish.name} />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>

                  <div className="dish-details">
                    <div className="dish-name">{dish.name}</div>
                    {dish.secondary_name && (
                      <div className="dish-secondary-name">{dish.secondary_name}</div>
                    )}
                    <div className="dish-meta">
                      <span className="dish-type">{dish.dish_type_display}</span>
                      <span className="dish-price">₹{dish.price}</span>
                    </div>
                  </div>

                  <div className="dish-order-number">
                    #{index + 1}
                  </div>
                </div>
              ))}
            </ReactSortable>

            {mealType.dishes.length === 0 && (
              <div className="empty-state">
                <p>No dishes in this meal time</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DishOrdering;
