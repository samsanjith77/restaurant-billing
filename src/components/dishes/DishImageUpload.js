import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import ApiService from '../../services/api';
import Button from '../common/Button';
import { MESSAGES, FILE_TYPES } from '../../utils/constants';

const DishImageUpload = ({ dish, onImageUpdated, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const { 
    register, 
    handleSubmit, 
    formState: { errors }, 
    watch 
  } = useForm();

  const watchedImage = watch('image');

  React.useEffect(() => {
    if (watchedImage && watchedImage[0]) {
      const file = watchedImage[0];
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  }, [watchedImage]);

  const validateImage = (files) => {
    if (!files || files.length === 0) {
      return 'Please select an image file';
    }

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
      const result = await ApiService.updateDishImage(dish.id, data.image[0]);

      setMessage({
        type: 'success',
        text: result.message || MESSAGES.SUCCESS_IMAGE_UPDATED
      });

      if (onImageUpdated) {
        onImageUpdated();
      }

      // Auto close after success
      setTimeout(() => {
        if (onCancel) onCancel();
      }, 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || MESSAGES.ERROR_UPDATE_IMAGE
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="image-upload-modal">
      <div className="modal-backdrop" onClick={onCancel}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>🖼️ Update Image for "{dish.name}"</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>

        <div className="modal-body">
          <div className="current-image">
            <img 
              src={dish.image || '/placeholder-dish.jpg'} 
              alt={dish.name}
              className="current-image__img"
            />
            <p>Current Image</p>
          </div>

          {message && (
            <div className={`message message--${message.type}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label htmlFor="new-image" className="form-label">
                Select New Image *
              </label>
              <input
                type="file"
                id="new-image"
                accept={FILE_TYPES.ACCEPTED_IMAGES}
                className={`form-input form-input--file ${errors.image ? 'form-input--error' : ''}`}
                {...register('image', {
                  validate: validateImage
                })}
              />
              {errors.image && (
                <span className="form-error">{errors.image.message}</span>
              )}
            </div>

            {imagePreview && (
              <div className="image-preview">
                <img src={imagePreview} alt="New preview" />
                <p>New Image Preview</p>
              </div>
            )}

            <div className="modal-actions">
              <Button
                type="submit"
                variant="primary"
                loading={loading}
                disabled={loading || !watchedImage || watchedImage.length === 0}
              >
                {loading ? MESSAGES.UPDATING_IMAGE : '📤 Update Image'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                ❌ Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DishImageUpload;