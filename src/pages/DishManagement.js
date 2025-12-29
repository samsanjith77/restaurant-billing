import React, { useState } from 'react';
import DishForm from '../components/dishes/DishForm';
import useDishes from '../hooks/useDishes';
import ApiService from '../services/api';
import '../styles/components/DishManagement.css';

const DishManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const { dishes, loading, error, refetch } = useDishes();

  // Filter states
  const [filterMealType, setFilterMealType] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Price modal
  const [editPriceModal, setEditPriceModal] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Image modal
  const [editImageModal, setEditImageModal] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Delete confirmation modal
  const [deleteModal, setDeleteModal] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleDishCreated = () => {
    refetch();
    setActiveTab('list');
  };

  // Filter dishes based on meal type, category, and search
  const filteredDishes = dishes.filter(dish => {
    const matchesMealType = dish.category === 'extras' || filterMealType === 'all' || dish.meal_type === filterMealType;
    const matchesCategory = filterCategory === 'all' || dish.category === filterCategory;
    const matchesSearch = !searchQuery || 
      dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dish.secondary_name && dish.secondary_name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesMealType && matchesCategory && matchesSearch;
  });

  // Get unique categories from dishes
  const availableCategories = [...new Set(dishes.map(d => d.category).filter(Boolean))].sort();

  const handleEditPriceClick = (dish) => {
    setEditPriceModal(dish);
    setEditPrice(dish.price);
  };

  const handleClosePriceEdit = () => {
    setEditPriceModal(null);
    setEditPrice('');
  };

  const handleUpdatePrice = async (e) => {
    e.preventDefault();

    if (!editPrice || parseFloat(editPrice) <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid price' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsSubmitting(true);

    try {
      await ApiService.updateDishPrice(editPriceModal.id, {
        price: parseFloat(editPrice),
      });
      setMessage({ type: 'success', text: 'Price updated successfully' });
      await refetch();
      handleClosePriceEdit();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update price' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditImageClick = (dish) => {
    setEditImageModal(dish);
    setNewImage(null);
    setImagePreview(null);
  };

  const handleCloseImageEdit = () => {
    setEditImageModal(null);
    setNewImage(null);
    setImagePreview(null);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateImage = async (e) => {
    e.preventDefault();

    if (!newImage) {
      setMessage({ type: 'error', text: 'Please select an image' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    setIsSubmitting(true);

    try {
      await ApiService.updateDishImage(editImageModal.id, newImage);

      setMessage({ type: 'success', text: 'Image updated successfully' });
      await refetch();
      handleCloseImageEdit();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update image' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete functionality
  const handleDeleteClick = (dish) => {
    setDeleteModal(dish);
  };

  const handleCloseDeleteModal = () => {
    setDeleteModal(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModal) return;

    setIsSubmitting(true);

    try {
      await ApiService.deleteDish(deleteModal.id);
      setMessage({ type: 'success', text: 'Dish deleted successfully' });
      await refetch();
      handleCloseDeleteModal();
      setTimeout(() => setMessage(null), 3000);
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to delete dish' });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClearFilters = () => {
    setFilterMealType('all');
    setFilterCategory('all');
    setSearchQuery('');
  };

  // Format category display name
  const formatCategoryName = (category) => {
    if (!category) return '';
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="dish-management">
      {message && (
        <div className={`notification notification--${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="dish-management__header">
        <h1>Dish Management</h1>
        <p>Create and manage your restaurant dishes</p>
      </div>

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'list' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('list')}
        >
          All Dishes ({dishes.length})
        </button>
        <button
          className={`tab ${activeTab === 'create' ? 'tab--active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          Add New Dish
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'list' && (
          <div className="tab-panel">
            {/* Filters Section */}
            <div className="filters-section">
              <div className="filter-group">
                <label htmlFor="search-dishes">Search</label>
                <input
                  id="search-dishes"
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>

              <div className="filter-group">
                <label htmlFor="filter-meal">Meal Type</label>
                <select
                  id="filter-meal"
                  value={filterMealType}
                  onChange={(e) => setFilterMealType(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Meal Times</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="night">Night</option>
                </select>
              </div>

              <div className="filter-group">
                <label htmlFor="filter-category">Category</label>
                <select
                  id="filter-category"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="filter-select"
                >
                  <option value="all">All Categories</option>
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>
                      {formatCategoryName(cat)}
                    </option>
                  ))}
                </select>
              </div>

              {(filterMealType !== 'all' || filterCategory !== 'all' || searchQuery) && (
                <button className="clear-filters-btn" onClick={handleClearFilters}>
                  Clear Filters
                </button>
              )}
            </div>

            {/* Results Count */}
            {(filterMealType !== 'all' || filterCategory !== 'all' || searchQuery) && (
              <div className="results-count">
                Showing {filteredDishes.length} of {dishes.length} dishes
              </div>
            )}

            {/* Dishes Grid */}
            {loading ? (
              <div className="loading-state">Loading dishes...</div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={refetch} className="retry-btn">Retry</button>
              </div>
            ) : filteredDishes.length === 0 ? (
              <div className="empty-state">
                {searchQuery || filterMealType !== 'all' || filterCategory !== 'all' ? (
                  <>
                    <p>No dishes found matching your filters</p>
                    <button onClick={handleClearFilters} className="retry-btn">Clear Filters</button>
                  </>
                ) : (
                  <>
                    <p>No dishes available</p>
                    <span>Create your first dish</span>
                  </>
                )}
              </div>
            ) : (
              <div className="dishes-grid-manage">
                {filteredDishes.map((dish) => (
                  <div key={dish.id} className="dish-card-manage">
                    {dish.image && (
                      <div className="dish-img-manage">
                        <img src={dish.image} alt={dish.name} />
                      </div>
                    )}
                    <div className="dish-info-manage">
                      <h4 className="dish-name-manage">{dish.name}</h4>
                      {dish.secondary_name && (
                        <p className="dish-secondary-name-manage">{dish.secondary_name}</p>
                      )}
                      <div className="dish-meta-manage">
                        {dish.category && (
                          <span className="dish-badge dish-badge--category">
                            {dish.category_display || formatCategoryName(dish.category)}
                          </span>
                        )}
                        {dish.category !== 'extras' && (
                          <span className="dish-badge dish-badge--meal">
                            {dish.meal_type_display || formatCategoryName(dish.meal_type)}
                          </span>
                        )}
                        {dish.category === 'extras' && (
                          <span className="dish-badge dish-badge--extras">
                            All Day
                          </span>
                        )}
                      </div>
                      <p className="dish-price-manage">₹{parseFloat(dish.price).toFixed(2)}</p>
                    </div>
                    <div className="dish-actions-manage">
                      <button
                        className="action-btn-small action-btn--price"
                        onClick={() => handleEditPriceClick(dish)}
                        title="Edit Price"
                      >
                        Price
                      </button>
                      <button
                        className="action-btn-small action-btn--image"
                        onClick={() => handleEditImageClick(dish)}
                        title="Edit Image"
                      >
                        Image
                      </button>
                      <button
                        className="action-btn-small action-btn--delete"
                        onClick={() => handleDeleteClick(dish)}
                        title="Delete Dish"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="tab-panel">
            <DishForm onDishCreated={handleDishCreated} />
          </div>
        )}
      </div>

      {/* PRICE EDIT MODAL */}
      {editPriceModal && (
        <div className="edit-modal" onClick={handleClosePriceEdit}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Price</h3>
              <button className="modal-close-btn" onClick={handleClosePriceEdit} type="button">✕</button>
            </div>

            <form onSubmit={handleUpdatePrice} className="edit-form">
              <div className="edit-dish-info">
                {editPriceModal.image && (
                  <img src={editPriceModal.image} alt={editPriceModal.name} className="edit-dish-img" />
                )}
                <div className="edit-dish-details">
                  <h4>{editPriceModal.name}</h4>
                  {editPriceModal.secondary_name && (
                    <p className="dish-secondary-name-manage">{editPriceModal.secondary_name}</p>
                  )}
                  {editPriceModal.category && (
                    <span className="dish-badge dish-badge--category">
                      {editPriceModal.category_display || formatCategoryName(editPriceModal.category)}
                    </span>
                  )}
                  <p className="current-price">
                    Current: ₹{parseFloat(editPriceModal.price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="form-group-compact">
                <label htmlFor="edit-price">New Price (₹)</label>
                <input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  placeholder="Enter new price"
                  className="price-input-compact"
                  autoFocus
                  required
                />
              </div>

              <div className="edit-actions">
                <button type="button" className="btn-cancel" onClick={handleClosePriceEdit} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Price'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* IMAGE EDIT MODAL */}
      {editImageModal && (
        <div className="edit-modal" onClick={handleCloseImageEdit}>
          <div className="edit-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header">
              <h3>Edit Image</h3>
              <button className="modal-close-btn" onClick={handleCloseImageEdit} type="button">✕</button>
            </div>

            <form onSubmit={handleUpdateImage} className="edit-form">
              <div className="edit-dish-info">
                <div className="edit-dish-details" style={{ width: '100%' }}>
                  <h4>{editImageModal.name}</h4>
                  {editImageModal.secondary_name && (
                    <p className="dish-secondary-name-manage">{editImageModal.secondary_name}</p>
                  )}
                  {editImageModal.category && (
                    <span className="dish-badge dish-badge--category">
                      {editImageModal.category_display || formatCategoryName(editImageModal.category)}
                    </span>
                  )}
                  <p className="current-price">₹{parseFloat(editImageModal.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="form-group-compact">
                <label>Current Image</label>
                {editImageModal.image && (
                  <img src={editImageModal.image} alt={editImageModal.name} className="current-image-full" />
                )}
              </div>

              <div className="form-group-compact">
                <label htmlFor="new-image">New Image</label>
                {!imagePreview ? (
                  <label htmlFor="new-image" className="upload-area-compact">
                    <input
                      id="new-image"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input-hidden"
                    />
                    <div className="upload-content">
                      <div className="upload-icon">📷</div>
                      <p className="upload-text">Tap to upload new image</p>
                    </div>
                  </label>
                ) : (
                  <div className="preview-container">
                    <img src={imagePreview} alt="Preview" className="preview-image-full" />
                    <button
                      type="button"
                      className="change-image-btn"
                      onClick={() => {
                        setNewImage(null);
                        setImagePreview(null);
                      }}
                    >Change Image</button>
                  </div>
                )}
              </div>

              <div className="edit-actions">
                <button type="button" className="btn-cancel" onClick={handleCloseImageEdit} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="btn-save" disabled={isSubmitting}>{isSubmitting ? 'Updating...' : 'Update Image'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal && (
        <div className="edit-modal delete-modal-overlay" onClick={handleCloseDeleteModal}>
          <div className="edit-modal-content delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="edit-modal-header delete-modal-header">
              <h3>⚠️ Delete Dish</h3>
              <button className="modal-close-btn" onClick={handleCloseDeleteModal} type="button">✕</button>
            </div>

            <div className="delete-modal-body">
              <div className="delete-dish-info">
                {deleteModal.image && (
                  <img src={deleteModal.image} alt={deleteModal.name} className="delete-dish-img" />
                )}
                <div className="delete-dish-details">
                  <h4>{deleteModal.name}</h4>
                  {deleteModal.secondary_name && (
                    <p className="dish-secondary-name-manage">{deleteModal.secondary_name}</p>
                  )}
                  <div className="dish-meta-manage">
                    {deleteModal.category && (
                      <span className="dish-badge dish-badge--category">
                        {deleteModal.category_display || formatCategoryName(deleteModal.category)}
                      </span>
                    )}
                  </div>
                  <p className="delete-dish-price">₹{parseFloat(deleteModal.price).toFixed(2)}</p>
                </div>
              </div>

              <div className="delete-warning">
                <p className="warning-icon">⚠️</p>
                <p className="warning-text">
                  Are you sure you want to delete this dish?<br />
                  <strong>This action cannot be undone.</strong>
                </p>
              </div>

              <div className="edit-actions delete-actions">
                <button 
                  type="button" 
                  className="btn-cancel" 
                  onClick={handleCloseDeleteModal} 
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn-delete" 
                  onClick={handleConfirmDelete} 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Deleting...' : 'Delete Dish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishManagement;
