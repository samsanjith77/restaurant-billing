export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/bill',
  ENDPOINTS: {
    DISHES: '/dishes/',
    CREATE_ORDER: '/orders/create/',
    // NEW endpoints
    CREATE_DISH: '/dishes/create/',
    UPDATE_DISH_IMAGE: '/dishes/<dish_id>/update-image/',
    ORDER_HISTORY: '/orders/history/'
  }
};

export const ORDER_TYPES = {
  DINE_IN: 'dine_in',
  DELIVERY: 'delivery'
};

export const MESSAGES = {
  LOADING_DISHES: 'Loading dishes...',
  ERROR_FETCH_DISHES: 'Failed to load dishes. Please try again.',
  ERROR_CREATE_ORDER: 'Failed to create order. Please try again.',
  SUCCESS_ORDER: 'Order placed successfully!',
  EMPTY_ORDER: 'Please select at least one dish',
  NO_DISHES: 'No dishes available',
  // NEW messages
  SUCCESS_DISH_CREATED: 'Dish created successfully!',
  SUCCESS_IMAGE_UPDATED: 'Dish image updated successfully!',
  ERROR_CREATE_DISH: 'Failed to create dish. Please try again.',
  ERROR_UPDATE_IMAGE: 'Failed to update image. Please try again.',
  CREATING_DISH: 'Creating dish...',
  UPDATING_IMAGE: 'Updating image...'
};

export const FILE_TYPES = {
  ACCEPTED_IMAGES: 'image/jpeg,image/jpg,image/png,image/webp',
  MAX_FILE_SIZE: 5 * 1024 * 1024 // 5MB
};