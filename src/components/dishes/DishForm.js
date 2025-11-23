import React, { useState } from 'react';
import ApiService from '../../services/api';
import { MEAL_TYPES, DISH_TYPES } from '../../utils/constants';
import '../../styles/components/DishForm.css';

const DishForm = ({ onDishCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    secondary_name: '',
    price: '',
    meal_type: 'afternoon',
    dish_type: 'meals', // NEW
    image: null
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const mealTypeOptions = [
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '🍽️ Afternoon' },
    { value: 'night', label: '🌙 Night' }
  ];

  // NEW: Dish Type Options
  const dishTypeOptions = [
    { value: 'meals', label: '🍽️ Meals' },
    { value: 'chinese', label: '🥡 Chinese' },
    { value: 'indian', label: '🍛 Indian' },
    { value: 'addons', label: '🍦 Add-ons' },
    { value: 'beverages', label: '🥤 Beverages' },
    { value: 'desserts', label: '🍰 Desserts' }
  ];

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
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.price.trim()) {
      setMessage({ type: 'error', text: 'Name and price are required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'Price must be a valid positive number' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name.trim());
      formDataPayload.append('secondary_name', formData.secondary_name.trim());
      formDataPayload.append('price', parseFloat(formData.price));
      formDataPayload.append('meal_type', formData.meal_type);
      formDataPayload.append('dish_type', formData.dish_type); // NEW
      
      if (formData.image) {
        formDataPayload.append('image', formData.image);
      }

      const result = await ApiService.createDish(formDataPayload);
      setMessage({ type: 'success', text: result.message || 'Dish created successfully!' });
      
      // Reset form
      setFormData({ 
        name: '', 
        secondary_name: '', 
        price: '', 
        meal_type: 'afternoon',
        dish_type: 'meals', // NEW
        image: null 
      });
      setPreview(null);
      
      if (onDishCreated) onDishCreated();
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to create dish' });
    } finally {
      setLoading(false);
      setTimeout(() => setMessage(null), 3000);
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
        {/* Dish Name Field */}
        <div className="form-group-mobile">
          <label htmlFor="dish-name">Dish Name *</label>
          <input
            id="dish-name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Chicken Biryani"
            required
            maxLength="100"
          />
        </div>

        {/* Secondary Name Field */}
        <div className="form-group-mobile">
          <label htmlFor="secondary-name">Secondary Name (Optional)</label>
          <input
            id="secondary-name"
            type="text"
            name="secondary_name"
            value={formData.secondary_name}
            onChange={handleInputChange}
            placeholder="e.g., चिकन बिरयानी"
            maxLength="100"
          />
        </div>

        {/* Price Field */}
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
            required
          />
        </div>

        {/* Meal Type Field */}
        <div className="form-group-mobile">
          <label htmlFor="meal-type">Meal Time *</label>
          <select
            id="meal-type"
            name="meal_type"
            value={formData.meal_type}
            onChange={handleInputChange}
            required
            className="meal-type-select"
          >
            {mealTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="field-hint">When to serve this dish</small>
        </div>

        {/* Dish Category/Type Field - NEW */}
        <div className="form-group-mobile">
          <label htmlFor="dish-type">Dish Category *</label>
          <select
            id="dish-type"
            name="dish_type"
            value={formData.dish_type}
            onChange={handleInputChange}
            required
            className="dish-type-select"
          >
            {dishTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="field-hint">Type of dish (Meals, Chinese, Add-ons, etc.)</small>
        </div>

        {/* Image Upload Field */}
        <div className="form-group-mobile">
          <label htmlFor="dish-image">Dish Image</label>
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
                onClick={handleRemoveImage}
                className="remove-btn"
              >
                Remove Image
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          className="submit-btn-mobile"
        >
          {loading ? 'Creating...' : 'Create Dish'}
        </button>
      </form>
    </div>
  );
};

export default DishForm;
