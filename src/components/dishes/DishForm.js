import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ApiService from '../../services/api';
import Button from '../common/Button';
import { MESSAGES, FILE_TYPES } from '../../utils/constants';

const DishForm = ({ onDishCreated }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    reset, 
    watch 
  } = useForm();

  const watchedImage = watch('image');

  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  }, [watchedImage]);

  const validateImage = (files) => {
    if (!files || files.length === 0) return true; // Image is optional

    const file = files[0];
    if (file.size > FILE_TYPES.MAX_FILE_SIZE) {
      return 'Image size must be less than 5MB';
    }

    const acceptedTypes = FILE_TYPES.ACCEPTED_IMAGES.split(',');
    if (!acceptedTypes.includes(file.type)) {
      return 'Only JPEG, JPG, PNG, and WEBP images are allowed';
    }

    return true;
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setMessage(null);

    try {
      const dishData = {
        name: data.name,
        price: parseFloat(data.price),
        image: data.image && data.image[0] ? data.image[0] : null
      };

      const result = await ApiService.createDish(dishData);

      setMessage({
        type: 'success',
        text: result.message || MESSAGES.SUCCESS_DISH_CREATED
      });

      reset();
      setImagePreview(null);

      if (onDishCreated) {
        onDishCreated();
      }
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || MESSAGES.ERROR_CREATE_DISH
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dish-form">
      <div className="dish-form__header">
        <h2>➕ Create New Dish</h2>
        <p>Add a new dish to your menu</p>
      </div>

      {message && (
        <div className={`message message--${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="form">
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Dish Name *
            </label>
            <input
              type="text"
              id="name"
              className={`form-input ${errors.name ? 'form-input--error' : ''}`}
              placeholder="Enter dish name (e.g., Margherita Pizza)"
              {...register('name', {
                required: 'Dish name is required',
                minLength: {
                  value: 2,
                  message: 'Dish name must be at least 2 characters'
                },
                maxLength: {
                  value: 100,
                  message: 'Dish name must be less than 100 characters'
                }
              })}
            />
            {errors.name && (
              <span className="form-error">{errors.name.message}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="price" className="form-label">
              Price (₹) *
            </label>
            <input
              type="number"
              id="price"
              step="1.00"
              min="0"
              className={`form-input ${errors.price ? 'form-input--error' : ''}`}
              placeholder="Enter price (e.g., 299.00)"
              {...register('price', {
                required: 'Price is required',
                min: {
                  value: 0.01,
                  message: 'Price must be greater than 0'
                },
                max: {
                  value: 9999.99,
                  message: 'Price must be less than ₹10,000'
                }
              })}
            />
            {errors.price && (
              <span className="form-error">{errors.price.message}</span>
            )}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="image" className="form-label">
            Dish Image (Optional)
          </label>
          <div className="image-upload-area">
            <input
              type="file"
              id="image"
              accept={FILE_TYPES.ACCEPTED_IMAGES}
              className={`form-input form-input--file ${errors.image ? 'form-input--error' : ''}`}
              {...register('image', {
                validate: validateImage
              })}
            />
            <div className="image-upload-info">
              <span>📷 Choose an image file (JPEG, PNG, WEBP)</span>
              <span>Maximum size: 5MB</span>
            </div>
          </div>
          {errors.image && (
            <span className="form-error">{errors.image.message}</span>
          )}

          {imagePreview && (
            <div className="image-preview">
              <img src={imagePreview} alt="Preview" />
              <span>Preview</span>
            </div>
          )}
        </div>

        <div className="form-actions">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {loading ? MESSAGES.CREATING_DISH : '✨ Create Dish'}
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
              setImagePreview(null);
              setMessage(null);
            }}
            disabled={loading}
          >
            🔄 Reset Form
          </Button>
        </div>
      </form>
    </div>
  );
};

export default DishForm;