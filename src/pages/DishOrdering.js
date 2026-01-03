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

  const [selectedMealType, setSelectedMealType] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchDishesForOrdering();
  }, []);

  const fetchDishesForOrdering = async () => {
    try {
      setLoading(true);
      const data = await ApiService.getDishesForOrdering();

      if (!data) {
        throw new Error('No data received from server');
      }

      if (!Array.isArray(data)) {
        console.error('❌ Data is not an array:', data);
        throw new Error('Invalid data format received from server');
      }

      if (data.length === 0) {
        console.warn('⚠️ No meal types data available');
        setMealTypesData([]);
        setLoading(false);
        setMessage({ type: 'info', text: 'No dishes available for ordering' });
        return;
      }

      const transformedData = data.map(mealType => {
        if (!mealType.categories || !Array.isArray(mealType.categories)) {
          return {
            ...mealType,
            categories: []
          };
        }

        return {
          ...mealType,
          categories: mealType.categories.map(category => {
            if (!category.dishes || !Array.isArray(category.dishes)) {
              return {
                ...category,
                dishes: []
              };
            }

            return {
              ...category,
              dishes: category.dishes.map(dish => ({
                ...dish,
                chosen: false,
                selected: false
              }))
            };
          })
        };
      });

      console.log('✅ Transformed data:', transformedData);
      setMealTypesData(transformedData);
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching dishes:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to load dishes: ${error.message}` 
      });
      setMealTypesData([]);
      setLoading(false);
    }
  };

  const handleReorder = (mealTypeIndex, categoryIndex, newDishes) => {
    const updatedMealTypes = [...mealTypesData];
    updatedMealTypes[mealTypeIndex].categories[categoryIndex].dishes = newDishes;
    setMealTypesData(updatedMealTypes);
    setHasChanges(true);
  };

  const handleSaveAll = async () => {
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });

      console.log('💾 Starting save process...');

      // Get the data to save (either filtered or all)
      const dataToSave = getFilteredData();

      if (dataToSave.length === 0) {
        setMessage({ 
          type: 'error', 
          text: 'No data to save. Please check your filters.' 
        });
        setSaving(false);
        return;
      }

      // Check if any category is 'all'
      for (const mealType of dataToSave) {
        for (const category of mealType.categories) {
          if (category.category === 'all') {
            setMessage({ 
              type: 'error', 
              text: 'Cannot save with "All Categories" filter. Please select a specific category.' 
            });
            setSaving(false);
            return;
          }
        }
      }

      // Save each meal type and category
      for (const mealType of dataToSave) {
        for (const category of mealType.categories) {
          console.log(`💾 Saving order for ${mealType.meal_type} - ${category.category}`);

          const dishesOrder = category.dishes.map((dish, index) => ({
            dish_id: dish.id,
            order: index
          }));

          const payload = {
            meal_type: mealType.meal_type,
            category: category.category,
            dishes: dishesOrder
          };

          console.log('📤 Payload:', payload);

          try {
            const result = await ApiService.reorderDishes(
              mealType.meal_type, 
              category.category, 
              dishesOrder
            );
            console.log('✅ Save result:', result);
          } catch (error) {
            console.error(`❌ Error saving ${mealType.meal_type} - ${category.category}:`, error);
            throw error;
          }
        }
      }

      setMessage({ 
        type: 'success', 
        text: 'All dish orders saved successfully!' 
      });
      setHasChanges(false);
      setSaving(false);

      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('❌ Error saving order:', error);
      setMessage({ 
        type: 'error', 
        text: `Failed to save dish orders: ${error.message}` 
      });
      setSaving(false);
    }
  };

  const handleReset = () => {
    fetchDishesForOrdering();
    setHasChanges(false);
    setMessage({ type: 'info', text: 'Order reset to saved state' });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const getMealTypes = () => {
    if (!Array.isArray(mealTypesData) || mealTypesData.length === 0) {
      return [];
    }
    return mealTypesData.map(mt => ({
      value: mt.meal_type,
      label: mt.meal_type_display
    }));
  };

  const getCategories = () => {
    if (!Array.isArray(mealTypesData) || mealTypesData.length === 0) {
      return [];
    }

    const categoriesSet = new Set();
    mealTypesData.forEach(mt => {
      if (mt.categories && Array.isArray(mt.categories)) {
        mt.categories.forEach(cat => {
          categoriesSet.add(JSON.stringify({
            value: cat.category,
            label: cat.category_display
          }));
        });
      }
    });
    return Array.from(categoriesSet).map(c => JSON.parse(c));
  };

  const getFilteredData = () => {
    if (!Array.isArray(mealTypesData)) {
      return [];
    }

    let filtered = mealTypesData;

    if (selectedMealType !== 'all') {
      filtered = filtered.filter(mt => mt.meal_type === selectedMealType);
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.map(mt => ({
        ...mt,
        categories: (mt.categories || []).filter(cat => cat.category === selectedCategory),
        total_dishes: (mt.categories || [])
          .filter(cat => cat.category === selectedCategory)
          .reduce((sum, cat) => sum + (cat.total_dishes || 0), 0)
      })).filter(mt => mt.categories.length > 0);
    }

    return filtered;
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

  const filteredData = getFilteredData();
  const canSave = hasChanges && selectedCategory !== 'all';

  return (
    <div className="dish-ordering-container">
      <div className="ordering-header">
        <h1>Manage Dish Order</h1>
        <p className="subtitle">Drag and drop to reorder dishes within each category</p>

        <div className="filters-section">
          <div className="filter-group">
            <label htmlFor="meal-filter">Meal Type</label>
            <select
              id="meal-filter"
              value={selectedMealType}
              onChange={(e) => setSelectedMealType(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Meal Types</option>
              {getMealTypes().map(mt => (
                <option key={mt.value} value={mt.value}>{mt.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="category-filter">Category</label>
            <select
              id="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Categories</option>
              {getCategories().map(cat => (
                <option key={cat.value} value={cat.value}>{cat.label}</option>
              ))}
            </select>
          </div>

          {(selectedMealType !== 'all' || selectedCategory !== 'all') && (
            <button
              className="clear-filters-btn"
              onClick={() => {
                setSelectedMealType('all');
                setSelectedCategory('all');
              }}
            >
              Clear Filters
            </button>
          )}
        </div>

        {selectedCategory === 'all' && hasChanges && (
          <div className="alert alert-warning">
            ⚠️ Please select a specific category to save changes. Cannot save with "All Categories" selected.
          </div>
        )}

        {message.text && (
          <div className={`alert alert-${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="action-buttons">
          <button 
            className="btn btn-primary"
            onClick={handleSaveAll}
            disabled={!canSave || saving}
            title={selectedCategory === 'all' ? 'Please select a specific category to save' : ''}
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
        {filteredData.map((mealType, mealIndex) => (
          <div key={mealType.meal_type} className="meal-type-section">
            <div className="meal-type-header">
              <h2>{mealType.meal_type_display}</h2>
              <span className="dish-count">{mealType.total_dishes || 0} dishes</span>
            </div>

            {(mealType.categories || []).map((category, categoryIndex) => (
              <div key={category.category} className="category-section">
                <div className="category-header">
                  <h3>{category.category_display}</h3>
                  <span className="category-count">{category.total_dishes || 0} dishes</span>
                </div>

                <ReactSortable
                  list={category.dishes || []}
                  setList={(newList) => {
                    const actualMealIndex = mealTypesData.findIndex(
                      mt => mt.meal_type === mealType.meal_type
                    );
                    const actualCategoryIndex = mealTypesData[actualMealIndex].categories.findIndex(
                      cat => cat.category === category.category
                    );
                    handleReorder(actualMealIndex, actualCategoryIndex, newList);
                  }}
                  animation={200}
                  ghostClass="sortable-ghost"
                  chosenClass="sortable-chosen"
                  dragClass="sortable-drag"
                  className="dishes-list"
                  handle=".drag-handle"
                >
                  {(category.dishes || []).map((dish, index) => (
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
                          <span className="dish-price">₹{dish.price}</span>
                        </div>
                      </div>

                      <div className="dish-order-number">
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </ReactSortable>

                {(!category.dishes || category.dishes.length === 0) && (
                  <div className="empty-state">
                    <p>No dishes in this category</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {filteredData.length === 0 && (
        <div className="empty-state-main">
          <p>No dishes found matching your filters</p>
          <button
            className="btn btn-secondary"
            onClick={() => {
              setSelectedMealType('all');
              setSelectedCategory('all');
            }}
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
};

export default DishOrdering;