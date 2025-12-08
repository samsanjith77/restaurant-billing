export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Change to your backend URL
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/accounts/login/',
    REGISTER: '/accounts/register/',
    TOKEN_REFRESH: '/accounts/token/refresh/',
    
    // Dish endpoints
    DISHES: '/bill/dishes/',
    DISH_TYPES: '/bill/dishes/types/',
    CREATE_DISH: '/bill/dishes/create/',
    UPDATE_DISH_IMAGE: '/bill/dishes/', // Will append {id}/update-image/
    UPDATE_DISH_PRICE: '/bill/dishes/', // Will append {id}/update-price/
    
    // Order endpoints
    CREATE_ORDER: '/bill/orders/create/',
    ORDER_HISTORY: '/bill/orders/history/',
    
    // Person endpoints
    PERSONS: '/bill/persons/',
    ADD_PERSON: '/bill/persons/add/',
    
    // Expense endpoints
    FILTER_EXPENSES: '/bill/expenses/filter/',
    ADD_EXPENSE: '/bill/expenses/add/',

    // Analytics endpoints
    ANALYTICS_SUMMARY: '/bill/analytics/summary/',
    WORKER_EXPENSE: '/bill/analytics/worker-expense/',
    DAILY_REVENUE_TREND: '/bill/analytics/daily-revenue-trend/',
    TOP_SELLING_DISHES: '/bill/analytics/top-selling-dishes/' ,

    REORDER_DISHES: '/bill/dishes/reorder/',
    INITIALIZE_ORDERS: '/bill/dishes/initialize-orders/',
  }
};

// Order Types
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  DELIVERY: 'delivery'
};

// Payment Types - NEW
export const PAYMENT_TYPES = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card'
};

// Meal Types (Time of day)
export const MEAL_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night'
};

// Dish Types (Category) - NEW
export const DISH_TYPES = {
  MEALS: 'meals',
  CHINESE: 'chinese',
  INDIAN: 'indian',
  ADDONS: 'addons',
  BEVERAGES: 'beverages',
  DESSERTS: 'desserts'
};

// Messages
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
