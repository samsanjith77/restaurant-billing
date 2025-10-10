import React, { useState } from 'react';
import DishForm from '../components/dishes/DishForm';
import DishList from '../components/dishes/DishList';
import useDishes from '../hooks/useDishes';
import '../styles/components/DishManagement.css';

const DishManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const { dishes, loading, error, refetch } = useDishes();

  const handleDishCreated = () => {
    refetch(); // Refresh the dish list
    setActiveTab('list'); // Switch back to list view
  };

  const handleImageUpdated = () => {
    refetch(); // Refresh the dish list
  };

  return (
    <div className="dish-management">
      <div className="dish-management__header">
        <h1>🍽️ Dish Management</h1>
        <p>Create and manage your restaurant dishes</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'list' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          📋 All Dishes ({dishes.length})
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ➕ Add New Dish
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' && (
          <div className="tab-panel">
            <DishList
              dishes={dishes}
              loading={loading}
              error={error}
              onRetry={refetch}
              showActions={true}
              onImageUpdated={handleImageUpdated}
            />
          </div>
        )}

        {activeTab === 'create' && (
          <div className="tab-panel">
            <DishForm onDishCreated={handleDishCreated} />
          </div>
        )}
      </div>
    </div>
  );
};

export default DishManagement;