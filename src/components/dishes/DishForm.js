import React, { useState, useEffect, useCallback } from 'react';
import ApiService from '../../services/api';
import '../../styles/components/DishForm.css';


const DishForm = ({ onDishCreated }) => {
  const [formData, setFormData] = useState({
    name: '',
    secondary_name: '',
    price: '',
    meal_type: 'afternoon',
    category: 'rice',
    image: null
  });

  const [availableCategories, setAvailableCategories] = useState([]);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [message, setMessage] = useState(null);


  // Meal type options
  const mealTypeOptions = [
    { value: 'all', label: '🌞 All Day' },
    { value: 'morning', label: '🌅 Morning' },
    { value: 'afternoon', label: '🍽️ Afternoon' },
    { value: 'night', label: '🌙 Night' }
  ];


  // Category restrictions based on meal type
  const CATEGORY_MEAL_RESTRICTIONS = {
    'dosa': ['morning', 'night'],
    'porotta': ['night'],
    'chinese': ['afternoon', 'night']
    // 'extras' has no restrictions - available at all times
  };


  // Fetch available categories - wrapped with useCallback
  const fetchAvailableCategories = useCallback(async (mealType) => {
    setLoadingCategories(true);
    try {
      // For extras, we don't need meal-specific categories
      if (formData.category === 'extras') {
        setAvailableCategories([{ value: 'extras', label: 'Extras' }]);
        setLoadingCategories(false);
        return;
      }


      const categories = await ApiService.getDishCategories(mealType, false); // Don't include extras by default

      // Add extras as an option
      const categoriesWithExtras = [
        ...categories,
        { value: 'extras', label: 'Extras' }
      ];

      setAvailableCategories(categoriesWithExtras);

      // Reset category if current selection is not available for new meal type
      if (!categoriesWithExtras.some(cat => cat.value === formData.category)) {
        setFormData(prev => ({ 
          ...prev, 
          category: categoriesWithExtras[0]?.value || 'rice' 
        }));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback to all categories if API fails
      setAvailableCategories([
        { value: 'rice', label: 'Rice' },
        { value: 'gravy', label: 'Gravy' },
        { value: 'curry', label: 'Curry' },
        { value: 'sidedish', label: 'Side Dish' },
        { value: 'dosa', label: 'Dosa' },
        { value: 'porotta', label: 'Porotta' },
        { value: 'chinese', label: 'Chinese' },
        { value: 'extras', label: 'Extras' }
      ]);
    } finally {
      setLoadingCategories(false);
    }
  }, [formData.category]);


  // Fetch available categories when meal type changes
  useEffect(() => {
    fetchAvailableCategories(formData.meal_type);
  }, [formData.meal_type, fetchAvailableCategories]);


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
      // Validate file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image size must be less than 10MB' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }


      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'Please select a valid image file' });
        setTimeout(() => setMessage(null), 3000);
        return;
      }


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


  // Check if category has meal restrictions
  const getCategoryWarning = () => {
    // Extras has no restrictions
    if (formData.category === 'extras') {
      return {
        type: 'info',
        text: 'Extras are available at all meal times'
      };
    }


    const restrictions = CATEGORY_MEAL_RESTRICTIONS[formData.category];
    if (!restrictions) return null;

    if (formData.meal_type === 'all') {
      return {
        type: 'info',
        text: `Note: ${capitalizeFirst(formData.category)} is typically available during ${restrictions.join(', ')}`
      };
    }

    if (!restrictions.includes(formData.meal_type)) {
      return {
        type: 'warning',
        text: `Warning: ${capitalizeFirst(formData.category)} may not be suitable for ${formData.meal_type} service`
      };
    }

    return null;
  };


  const capitalizeFirst = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.name.trim()) {
      setMessage({ type: 'error', text: 'Dish name is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }


    if (!formData.price.trim()) {
      setMessage({ type: 'error', text: 'Price is required' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }


    if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      setMessage({ type: 'error', text: 'Price must be a valid positive number' });
      setTimeout(() => setMessage(null), 3000);
      return;
    }


    // Check category warning
    const warning = getCategoryWarning();
    if (warning && warning.type === 'warning') {
      const confirmCreate = window.confirm(
        `${warning.text}\n\nDo you want to continue creating this dish?`
      );
      if (!confirmCreate) {
        return;
      }
    }


    setLoading(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('name', formData.name.trim());
      formDataPayload.append('secondary_name', formData.secondary_name.trim());
      formDataPayload.append('price', parseFloat(formData.price));
      formDataPayload.append('meal_type', formData.meal_type);
      formDataPayload.append('category', formData.category);

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
        category: 'rice',
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


  const categoryWarning = getCategoryWarning();


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
            disabled={loading}
          />
        </div>


        {/* Secondary Name Field */}
        <div className="form-group-mobile">
          <label htmlFor="secondary-name">Secondary Name (Tamil/Hindi)</label>
          <input
            id="secondary-name"
            type="text"
            name="secondary_name"
            value={formData.secondary_name}
            onChange={handleInputChange}
            placeholder="e.g., சிக்கன் பிரியாணி or चिकन बिरयानी"
            maxLength="100"
            disabled={loading}
          />
          <small className="field-hint">Regional language name (Tamil, Hindi, etc.)</small>
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
            disabled={loading}
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
            disabled={loading || formData.category === 'extras'}
          >
            {mealTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="field-hint">
            {formData.category === 'extras' 
              ? 'Extras are available at all meal times' 
              : 'When to serve this dish'}
          </small>
        </div>


        {/* Category Field */}
        <div className="form-group-mobile">
          <label htmlFor="dish-category">Category *</label>
          <select
            id="dish-category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required
            className="category-select"
            disabled={loading || loadingCategories}
          >
            {loadingCategories ? (
              <option>Loading categories...</option>
            ) : (
              availableCategories.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))
            )}
          </select>
          <small className="field-hint">
            Select category (Rice, Gravy, Chinese, Extras, etc.)
          </small>

          {/* Category Warning/Info */}
          {categoryWarning && (
            <div className={`field-alert field-alert--${categoryWarning.type}`}>
              {categoryWarning.type === 'warning' ? '⚠️ ' : 'ℹ️ '}
              {categoryWarning.text}
            </div>
          )}
        </div>


        {/* Image Upload Field */}
        <div className="form-group-mobile">
          <label htmlFor="dish-image">Dish Image</label>
          {!preview ? (
            <label htmlFor="dish-image" className={`upload-area-mobile ${loading ? 'upload-disabled' : ''}`}>
              <input
                id="dish-image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input-hidden"
                disabled={loading}
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
                disabled={loading}
              >
                Remove Image
              </button>
            </div>
          )}
        </div>


        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading || loadingCategories}
          className="submit-btn-mobile"
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              Creating...
            </>
          ) : (
            'Create Dish'
          )}
        </button>
      </form>
    </div>
  );
};


export default DishForm;