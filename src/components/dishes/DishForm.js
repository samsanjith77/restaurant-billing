import React, { useState } from 'react';
import ApiService from '../../services/api';
import '../../styles/components/DishForm.css';

const DishForm = ({ onDishCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.price) {
      setMessage({ type: 'error', text: 'Name and price are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const dishFormData = new FormData();
      dishFormData.append('name', formData.name);
      dishFormData.append('price', formData.price);
      if (formData.image) {
        dishFormData.append('image', formData.image);
      }

      // Use result to get message from API
      const result = await ApiService.createDish(dishFormData);

      setMessage({ 
        type: 'success', 
        text: result.message || 'Dish created successfully!' 
      });
      
      // Reset form
      setFormData({ name: '', price: '', image: null });
      setPreview(null);

      // Notify parent
      setTimeout(() => {
        if (onDishCreated) onDishCreated();
      }, 1000);

    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create dish' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dish-form-container">
      {message && (
        <div className={`form-message form-message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="dish-form-mobile">
        {/* Dish Name */}
        <div className="form-group-mobile">
          <label htmlFor="dish-name">Dish Name *</label>
          <input
            id="dish-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Chicken Biryani"
            className="input-mobile"
            required
          />
        </div>

        {/* Price */}
        <div className="form-group-mobile">
          <label htmlFor="dish-price">Price (₹) *</label>
          <input
            id="dish-price"
            type="number"
            name="price"
            step="0.01"
            min="0"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            className="input-mobile"
            required
          />
        </div>

        {/* Image Upload - Touch-Friendly */}
        <div className="form-group-mobile">
          <label>Dish Image</label>
          
          {!preview ? (
            <label htmlFor="dish-image" className="upload-area-mobile">
              <input
                id="dish-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input-hidden"
              />
              <div className="upload-content">
                <div className="upload-icon">📷</div>
                <p className="upload-text">Tap to upload image</p>
                <span className="upload-hint">PNG, JPG up to 10MB</span>
              </div>
            </label>
          ) : (
            <div className="image-preview-mobile">
              <img src={preview} alt="Preview" className="preview-img" />
              <button
                type="button"
                className="remove-image-btn"
                onClick={handleRemoveImage}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="submit-btn-mobile"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Dish'}
        </button>
      </form>
    </div>
  );
};

export default DishForm;
