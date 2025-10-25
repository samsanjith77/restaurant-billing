export const API_CONFIG = {
  BASE_URL: 'http://192.168.1.4:8000', // Change to your backend URL
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/accounts/login/',
    REGISTER: '/accounts/register/',
    TOKEN_REFRESH: '/accounts/token/refresh/',
    
    // Existing endpoints
    DISHES: '/bill/dishes/',
    CREATE_ORDER: '/bill/orders/create/',
    CREATE_DISH: '/bill/dishes/create/',
    UPDATE_DISH_IMAGE: '/bill/dishes/<dish_id>/update-image/',
    UPDATE_DISH_PRICE: '/bill/dishes/<dish_id>/update-price/',
    ORDER_HISTORY: '/bill/orders/history/',
    PERSONS: '/bill/persons/',
    ADD_PERSON: '/bill/persons/add/',
    FILTER_EXPENSES: '/bill/expenses/filter/',
    ADD_EXPENSE: '/bill/expenses/add/',


    // Analytics endpoints - NEW
    ANALYTICS_SUMMARY: '/bill/analytics/summary/',
    WORKER_EXPENSE: '/bill/analytics/worker-expense/'
  }
};

export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  DELIVERY: 'delivery'
};

export const MESSAGES = {
  EMPTY_ORDER: 'Please add items to your order',
  SUCCESS_ORDER: 'Order placed successfully!',
  ERROR_CREATE_ORDER: 'Failed to create order',
  LOGIN_REQUIRED: 'Please login to continue',
  SESSION_EXPIRED: 'Session expired. Please login again'
};

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token'
};
