export const API_CONFIG = {
  BASE_URL: 'http://127.0.0.1:8000/bill',
  ENDPOINTS: {
    DISHES: '/dishes/',
    CREATE_ORDER: '/orders/create/'
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
  NO_DISHES: 'No dishes available'
};