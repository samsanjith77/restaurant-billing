import React, { useState } from 'react';
import DishForm from '../components/dishes/DishForm'; // You'll add secondary_name input here
import useDishes from '../hooks/useDishes';
import ApiService from '../services/api';
import '../styles/components/DishManagement.css';

const DishManagement = () => {
  const [activeTab, setActiveTab] = useState('list');
  const { dishes, loading, error, refetch } = useDishes();

  // Price modal
  const [editPriceModal, setEditPriceModal] = useState(null);
  const [editPrice, setEditPrice] = useState('');

  // Image modal
  const [editImageModal, setEditImageModal] = useState(null);
  const [newImage, setNewImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  const handleDishCreated = () => {
    refetch();
    setActiveTab('list');
  };

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
      const formData = new FormData();
      formData.append('image', newImage);

      await ApiService.updateDishImage(editImageModal.id, formData);

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
            {loading ? (
              <div className="loading-state">Loading dishes...</div>
            ) : error ? (
              <div className="error-state">
                <p>{error}</p>
                <button onClick={refetch} className="retry-btn">Retry</button>
              </div>
            ) : dishes.length === 0 ? (
              <div className="empty-state">
                <p>No dishes available</p>
                <span>Create your first dish</span>
              </div>
            ) : (
              <div className="dishes-grid-manage">
                {dishes.map((dish) => (
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
    </div>
  );
};

export default DishManagement;
