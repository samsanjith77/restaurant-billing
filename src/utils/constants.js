export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000', // Change to your backend URL
  ENDPOINTS: {
    // Auth endpoints
    LOGIN: '/accounts/login/',
    REGISTER: '/accounts/register/',
    TOKEN_REFRESH: '/accounts/token/refresh/',
    
    // Dish endpoints
    DISHES: '/bill/dishes/',
    DISH_CATEGORIES: '/bill/dishes/categories/',
    CREATE_DISH: '/bill/dishes/create/',
    UPDATE_DISH_IMAGE: '/bill/dishes/',
    UPDATE_DISH_PRICE: '/bill/dishes/',
    DELETE_DISH: '/bill/dishes/',
    DISHES_FOR_ORDERING: '/bill/dishes/for-ordering/', // ADD THIS LINE
    REORDER_DISHES: '/bill/dishes/reorder/',
    INITIALIZE_ORDERS: '/bill/dishes/initialize-orders/',
    
    // Order endpoints
    ORDERS: '/bill/orders/',
    CREATE_ORDER: '/bill/orders/create/',
    ORDER_HISTORY: '/bill/orders/history/',
    
    // Worker endpoints
    WORKERS: '/bill/workers/',
    ADD_WORKER: '/bill/workers/add/',
    
    // Material endpoints
    MATERIALS: '/bill/materials/',
    ADD_MATERIAL: '/bill/materials/add/',
    
    // Expense endpoints
    FILTER_EXPENSES: '/bill/expenses/filter/',
    ADD_WORKER_EXPENSE: '/bill/expenses/worker/add/',
    ADD_MATERIAL_EXPENSE: '/bill/expenses/material/add/',
  
  }
};


// Order Types
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  DELIVERY: 'delivery'
};

// Payment Types
export const PAYMENT_TYPES = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card'
};

// Meal Types (Time of day)
export const MEAL_TYPES = {
  ALL: 'all',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night'
};

// Dish Categories (NEW - replaces DISH_TYPES)
export const DISH_CATEGORIES = {
  RICE: 'rice',
  GRAVY: 'gravy',
  CURRY: 'curry',
  SIDEDISH: 'sidedish',
  DOSA: 'dosa',
  POROTTA: 'porotta',
  CHINESE: 'chinese',
  EXTRAS: 'extras'
};

// Display names for categories
export const CATEGORY_DISPLAY_NAMES = {
  rice: 'Rice',
  gravy: 'Gravy',
  curry: 'Curry',
  sidedish: 'Side Dish',
  dosa: 'Dosa',
  porotta: 'Porotta',
  chinese: 'Chinese',
  extras: 'Extras'
};

// Meal type display names
export const MEAL_TYPE_DISPLAY_NAMES = {
  all: 'All Day',
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night'
};

// Category meal restrictions (optional - for frontend validation)
export const CATEGORY_MEAL_RESTRICTIONS = {
  dosa: ['morning', 'night'],      // Dosa only for morning and night
  porotta: ['night'],              // Porotta only for night
  chinese: ['afternoon', 'night'], // Chinese for afternoon and night
  // extras has no restrictions - available at all times
};

// Messages
export const MESSAGES = {
  EMPTY_ORDER: 'Please add items to your order',
  SUCCESS_ORDER: 'Order placed successfully!',
  ERROR_CREATE_ORDER: 'Failed to create order',
  ERROR_FETCH_DISHES: 'Failed to load menu',
  ERROR_FETCH_EXTRAS: 'Failed to load extras',
  LOGIN_REQUIRED: 'Please login to continue',
  SESSION_EXPIRED: 'Session expired. Please login again',
  CART_CLEARED: 'Cart cleared',
  ITEM_ADDED: 'Item added to cart',
  EXTRAS_ADDED: 'Extras added'
};

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token'
};

// API Query Parameters
export const QUERY_PARAMS = {
  MEAL_TYPE: 'meal_type',
  CATEGORY: 'category',
  GROUP_BY_MEAL: 'group_by_meal',
  GROUP_BY_CATEGORY: 'group_by_category',
  GET_AVAILABLE_CATEGORIES: 'get_available_categories',
  INCLUDE_EXTRAS: 'include_extras'
};

// Validation
export const VALIDATION = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  MIN_DISH_NAME_LENGTH: 2,
  MAX_DISH_NAME_LENGTH: 200
};

// UI Settings
export const UI_SETTINGS = {
  NOTIFICATION_DURATION: 3000, // milliseconds
  SEARCH_DEBOUNCE: 300, // milliseconds
  MAX_CART_ITEMS: 50,
  MAX_EXTRAS_ITEMS: 20
};

// Local Storage Keys
export const STORAGE_KEYS = {
  CART: 'restaurant_cart',
  SELECTED_MEAL_TYPE: 'selected_meal_type',
  ORDER_TYPE: 'order_type',
  PAYMENT_TYPE: 'payment_type'
};

// Date/Time Formats
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY hh:mm A',
  DATETIME_API: 'YYYY-MM-DDTHH:mm:ss'
};

// Error Codes
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_REQUEST: 400
};

// Status
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed'
};

// ==========================================
// ANALYTICS API ENDPOINTS
// ==========================================
export const ANALYTICS_ENDPOINTS = {
  // Main dashboard with shift-wise analysis
  DASHBOARD: '/bill/analytics/dashboard/',
  
  // Category performance
  CATEGORIES: '/bill/analytics/categories/',
  
  // Hourly trends
  HOURLY: '/bill/analytics/hourly/',
  
  // Day-to-day comparison
  COMPARISON: '/bill/analytics/comparison/',
  
  // Low performing dishes
  LOW_PERFORMING: '/bill/analytics/low-performing/',
  
  // Worker expense breakdown
  WORKER_EXPENSES: '/bill/analytics/worker-expenses/',
  
  // Material expense breakdown
  MATERIAL_EXPENSES: '/bill/analytics/material-expenses/',
  
  // Weekly summary
  WEEKLY_SUMMARY: '/bill/analytics/weekly-summary/',
};

// Filter types
export const ANALYTICS_FILTERS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  CUSTOM: 'custom'
};

// Shift times display
export const SHIFT_INFO = {
  MORNING: {
    name: 'Morning Shift',
    icon: '🌅',
    time: '7:00 AM - 4:00 PM'
  },
  NIGHT: {
    name: 'Night Shift',
    icon: '🌙',
    time: '4:00 PM - 2:00 AM'
  }
};