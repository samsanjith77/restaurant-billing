
// ==========================================
// API CONFIGURATION
// ==========================================
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8001', // Change to your backend URL
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
    DISHES_FOR_ORDERING: '/bill/dishes/for-ordering/',
    REORDER_DISHES: '/bill/dishes/reorder/',
    INITIALIZE_ORDERS: '/bill/dishes/initialize-orders/',
    DISH_SALES_IN_PERIOD: '/bill/api/dish-sales-in-period/',
    // Order endpoints
    ORDERS: '/bill/orders/',
    CREATE_ORDER: '/bill/orders/create/',
    ORDER_HISTORY: '/bill/orders/history/',

    // Worker endpoints
    WORKERS: '/bill/workers/',
    ADD_WORKER: '/bill/workers/add/',
    DELETE_WORKER: (id) => `/bill/workers/${id}/delete/`,

    // Material endpoints
    MATERIALS: '/bill/materials/',
    ADD_MATERIAL: '/bill/materials/add/',
    DELETE_MATERIAL: (id) => `/bill/materials/${id}/delete/`,

    // Expense endpoints
    FILTER_EXPENSES: '/bill/expenses/filter/',
    ADD_WORKER_EXPENSE: '/bill/expenses/worker/add/',
    ADD_MATERIAL_EXPENSE: '/bill/expenses/material/add/',
    DELETE_EXPENSE: (id) => `/bill/expenses/${id}/delete/`,

    // Report endpoints
    SHIFT_REPORT: '/bill/reports/shift-report/',
  }
};


// ==========================================
// ORDER TYPES
// ==========================================
export const ORDER_TYPES = {
  DINE_IN: 'dine-in',
  DELIVERY: 'delivery'
};


// ==========================================
// PAYMENT TYPES
// ==========================================
export const PAYMENT_TYPES = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card'
};


// ==========================================
// MEAL TYPES (Time of day)
// ==========================================
export const MEAL_TYPES = {
  ALL: 'all',
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night'
};


// Meal type display names
export const MEAL_TYPE_DISPLAY_NAMES = {
  all: 'All Day',
  morning: 'Morning',
  afternoon: 'Afternoon',
  night: 'Night'
};


// ==========================================
// DISH CATEGORIES
// ==========================================
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


// Category meal restrictions (for frontend validation)
export const CATEGORY_MEAL_RESTRICTIONS = {
  dosa: ['morning', 'night'],      // Dosa only for morning and night
  porotta: ['afternoon', 'night'], // Porotta only for afternoon and night
  chinese: ['afternoon', 'night'], // Chinese for afternoon and night
  // extras has no restrictions - available at all times
};


// ==========================================
// SHIFT TYPES & TIMINGS
// ==========================================
export const SHIFT_TYPES = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  NIGHT: 'night',
  ALL: 'all'
};


export const SHIFT_TIMINGS = {
  morning: '4:00 AM - 10:00 AM',
  afternoon: '10:00 AM - 4:00 PM',
  night: '4:00 PM - 4:00 AM (Next Day)'
};


export const SHIFT_DISPLAY_NAMES = {
  morning: 'Morning Shift',
  afternoon: 'Afternoon Shift',
  night: 'Night Shift'
};


export const SHIFT_ICONS = {
  morning: '🌅',
  afternoon: '☀️',
  night: '🌙'
};


// ==========================================
// WORKER EXPENSE CATEGORIES
// ==========================================
export const WORKER_EXPENSE_CATEGORIES = {
  WAGE: 'wage',
  BONUS: 'bonus',
  TRANSPORT: 'transport',
  FOOD: 'food',
  ADVANCE: 'advance',
  OTHER: 'other'
};


export const WORKER_EXPENSE_DISPLAY_NAMES = {
  wage: 'Daily Wage',
  bonus: 'Bonus',
  transport: 'Transport',
  food: 'Food',
  advance: 'Advance Payment',
  other: 'Other'
};


// ==========================================
// WORKER ROLES
// ==========================================
export const WORKER_ROLES = {
  WORKER: 'worker',
  MANAGER: 'manager',
  SUPERVISOR: 'supervisor'
};


export const WORKER_ROLE_DISPLAY_NAMES = {
  worker: 'Worker / Operator',
  manager: 'Manager',
  supervisor: 'Supervisor'
};


// ==========================================
// MATERIAL UNITS
// ==========================================
export const MATERIAL_UNITS = {
  KG: 'kg',
  BAG: 'bag',
  TON: 'ton',
  PIECE: 'piece',
  METER: 'meter',
  LITER: 'liter',
  BOX: 'box',
  BUNDLE: 'bundle',
  OTHER: 'other'
};


export const MATERIAL_UNIT_DISPLAY_NAMES = {
  kg: 'Kilogram',
  bag: 'Bag',
  ton: 'Ton',
  piece: 'Piece',
  meter: 'Meter',
  liter: 'Liter',
  box: 'Box',
  bundle: 'Bundle',
  other: 'Other'
};


// ==========================================
// EXPENSE TYPES
// ==========================================
export const EXPENSE_TYPES = {
  WORKER: 'worker',
  MATERIAL: 'material'
};


export const EXPENSE_TYPE_DISPLAY_NAMES = {
  worker: 'Worker Expense',
  material: 'Material Expense'
};


// ==========================================
// MESSAGES
// ==========================================
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
  EXTRAS_ADDED: 'Extras added',

  // Delete messages
  WORKER_DELETED: 'Worker deleted successfully',
  MATERIAL_DELETED: 'Material deleted successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  ERROR_DELETE_WORKER: 'Failed to delete worker',
  ERROR_DELETE_MATERIAL: 'Failed to delete material',
  ERROR_DELETE_EXPENSE: 'Failed to delete expense',
  CONFIRM_DELETE_WORKER: 'Are you sure you want to delete this worker?',
  CONFIRM_DELETE_MATERIAL: 'Are you sure you want to delete this material?',
  CONFIRM_DELETE_EXPENSE: 'Are you sure you want to delete this expense?',

  // Report messages
  ERROR_FETCH_REPORT: 'Failed to load report data',
  REPORT_LOADED: 'Report loaded successfully',
  NO_DATA_AVAILABLE: 'No data available for selected period'
};


// ==========================================
// TOKEN STORAGE KEYS
// ==========================================
export const TOKEN_KEYS = {
  ACCESS: 'access_token',
  REFRESH: 'refresh_token'
};


// ==========================================
// API QUERY PARAMETERS
// ==========================================
export const QUERY_PARAMS = {
  MEAL_TYPE: 'meal_type',
  CATEGORY: 'category',
  GROUP_BY_MEAL: 'group_by_meal',
  GROUP_BY_CATEGORY: 'group_by_category',
  GET_AVAILABLE_CATEGORIES: 'get_available_categories',
  INCLUDE_EXTRAS: 'include_extras',

  // Report parameters
  DATE: 'date',
  SHIFT: 'shift',
  TIMEZONE: 'timezone',
  START_DATE: 'start_date',
  END_DATE: 'end_date'
};


// ==========================================
// VALIDATION
// ==========================================
export const VALIDATION = {
  MIN_PRICE: 0,
  MAX_PRICE: 999999,
  MIN_QUANTITY: 1,
  MAX_QUANTITY: 99,
  MIN_DISH_NAME_LENGTH: 2,
  MAX_DISH_NAME_LENGTH: 200,

  // Worker validation
  MIN_WORKER_NAME_LENGTH: 2,
  MAX_WORKER_NAME_LENGTH: 100,
  MIN_CONTACT_LENGTH: 10,
  MAX_CONTACT_LENGTH: 20,

  // Material validation
  MIN_MATERIAL_NAME_LENGTH: 2,
  MAX_MATERIAL_NAME_LENGTH: 100,
  MIN_EXPENSE_AMOUNT: 0.01,
  MAX_EXPENSE_AMOUNT: 999999.99
};


// ==========================================
// UI SETTINGS
// ==========================================
export const UI_SETTINGS = {
  NOTIFICATION_DURATION: 3000, // milliseconds
  SEARCH_DEBOUNCE: 300, // milliseconds
  MAX_CART_ITEMS: 50,
  MAX_EXTRAS_ITEMS: 20,

  // Report UI settings
  REPORT_REFRESH_INTERVAL: 60000, // 1 minute
  MAX_REPORT_DAYS: 90, // Maximum days for date range reports
  CHART_COLORS: {
    income: '#4CAF50',
    expense: '#ff6f00',
    profit: '#2196F3',
    loss: '#f44336'
  },

  // Delete confirmation settings
  DELETE_CONFIRMATION_DELAY: 300, // milliseconds before showing confirmation
  DELETE_SUCCESS_DURATION: 2000, // milliseconds to show success message
};


// ==========================================
// LOCAL STORAGE KEYS
// ==========================================
export const STORAGE_KEYS = {
  CART: 'restaurant_cart',
  SELECTED_MEAL_TYPE: 'selected_meal_type',
  ORDER_TYPE: 'order_type',
  PAYMENT_TYPE: 'payment_type',

  // Report storage keys
  LAST_REPORT_DATE: 'last_report_date',
  REPORT_PREFERENCES: 'report_preferences'
};


// ==========================================
// DATE/TIME FORMATS
// ==========================================
export const DATE_FORMATS = {
  DISPLAY: 'DD/MM/YYYY',
  API: 'YYYY-MM-DD',
  DATETIME_DISPLAY: 'DD/MM/YYYY hh:mm A',
  DATETIME_API: 'YYYY-MM-DDTHH:mm:ss',

  // Additional formats
  TIME_DISPLAY: 'hh:mm A',
  TIME_24H: 'HH:mm',
  MONTH_YEAR: 'MMM YYYY',
  FULL_DATE: 'dddd, MMMM DD, YYYY'
};


// ==========================================
// ERROR CODES
// ==========================================
export const ERROR_CODES = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
  BAD_REQUEST: 400,

  // Additional error codes
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429
};


// ==========================================
// STATUS
// ==========================================
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  COMPLETED: 'completed',

  // Additional statuses
  CANCELLED: 'cancelled',
  PROCESSING: 'processing',
  FAILED: 'failed',
  DELETED: 'deleted'
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


// ==========================================
// ANALYTICS FILTERS
// ==========================================
export const ANALYTICS_FILTERS = {
  TODAY: 'today',
  YESTERDAY: 'yesterday',
  CUSTOM: 'custom',

  // Additional filters
  THIS_WEEK: 'this_week',
  LAST_WEEK: 'last_week',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month'
};


// ==========================================
// SHIFT INFO
// ==========================================
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


// ==========================================
// TIMEZONE SETTINGS
// ==========================================
export const TIMEZONE = {
  DEFAULT: 'Asia/Kolkata',
  IST: 'Asia/Kolkata',
  UTC: 'UTC'
};


// ==========================================
// REPORT TYPES
// ==========================================
export const REPORT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly',
  CUSTOM: 'custom',
  SHIFT_WISE: 'shift_wise'
};


export const REPORT_TYPE_DISPLAY_NAMES = {
  daily: 'Daily Report',
  weekly: 'Weekly Report',
  monthly: 'Monthly Report',
  custom: 'Custom Range',
  shift_wise: 'Shift-wise Report'
};


// ==========================================
// CURRENCY SETTINGS
// ==========================================
export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  LOCALE: 'en-IN',
  DECIMAL_PLACES: 2
};


// ==========================================
// PAGINATION
// ==========================================
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100
};


// ==========================================
// PRINT SETTINGS
// ==========================================
export const PRINT_SETTINGS = {
  PAPER_SIZE: 'A4',
  ORIENTATION: 'portrait',
  MARGINS: {
    top: '20mm',
    right: '15mm',
    bottom: '20mm',
    left: '15mm'
  }
};


// ==========================================
// EXPORT FORMATS
// ==========================================
export const EXPORT_FORMATS = {
  PDF: 'pdf',
  EXCEL: 'excel',
  CSV: 'csv',
  JSON: 'json'
};


export const EXPORT_FORMAT_DISPLAY_NAMES = {
  pdf: 'PDF Document',
  excel: 'Excel Spreadsheet',
  csv: 'CSV File',
  json: 'JSON Data'
};


// ==========================================
// NOTIFICATION TYPES
// ==========================================
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};


// ==========================================
// CHART TYPES
// ==========================================
export const CHART_TYPES = {
  BAR: 'bar',
  LINE: 'line',
  PIE: 'pie',
  DOUGHNUT: 'doughnut',
  AREA: 'area'
};


// ==========================================
// PERMISSIONS
// ==========================================
export const PERMISSIONS = {
  VIEW_REPORTS: 'view_reports',
  CREATE_ORDER: 'create_order',
  MANAGE_DISHES: 'manage_dishes',
  MANAGE_WORKERS: 'manage_workers',
  MANAGE_MATERIALS: 'manage_materials',
  MANAGE_EXPENSES: 'manage_expenses',
  VIEW_ANALYTICS: 'view_analytics',
  EXPORT_DATA: 'export_data',
  DELETE_WORKER: 'delete_worker',
  DELETE_MATERIAL: 'delete_material',
  DELETE_EXPENSE: 'delete_expense'
};


// ==========================================
// ACTION TYPES
// ==========================================
export const ACTION_TYPES = {
  DELETE: 'delete',
  EDIT: 'edit',
  VIEW: 'view',
  CREATE: 'create',
  ARCHIVE: 'archive',
  RESTORE: 'restore'
};


// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get today's date in YYYY-MM-DD format
 */
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
export const getYesterdayDate = () => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split('T')[0];
};

/**
 * Format date to display format
 */
export const formatDateDisplay = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-IN');
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount) => {
  const formattedAmount = parseFloat(amount).toLocaleString(CURRENCY.LOCALE, {
    minimumFractionDigits: CURRENCY.DECIMAL_PLACES,
    maximumFractionDigits: CURRENCY.DECIMAL_PLACES
  });
  return CURRENCY.SYMBOL + formattedAmount;
};

/**
 * Get current shift based on time
 */
export const getCurrentShift = () => {
  const now = new Date();
  const hours = now.getHours();

  if (hours >= 4 && hours < 10) {
    return SHIFT_TYPES.MORNING;
  } else if (hours >= 10 && hours < 16) {
    return SHIFT_TYPES.AFTERNOON;
  } else {
    return SHIFT_TYPES.NIGHT;
  }
};

/**
 * Check if date is today
 */
export const isToday = (dateString) => {
  return dateString === getTodayDate();
};

/**
 * Check if date is yesterday
 */
export const isYesterday = (dateString) => {
  return dateString === getYesterdayDate();
};

/**
 * Get confirmation message for delete action
 */
export const getDeleteConfirmationMessage = (type, name = '') => {
  const messages = {
    worker: 'Are you sure you want to delete worker "' + name + '"? This action cannot be undone.',
    material: 'Are you sure you want to delete material "' + name + '"? This action cannot be undone.',
    expense: 'Are you sure you want to delete this expense? This action cannot be undone.'
  };
  return messages[type] || 'Are you sure you want to delete this item?';
};

/**
 * Get delete success message
 */
export const getDeleteSuccessMessage = (type, name = '') => {
  const messages = {
    worker: name ? 'Worker "' + name + '" deleted successfully' : 'Worker deleted successfully',
    material: name ? 'Material "' + name + '" deleted successfully' : 'Material deleted successfully',
    expense: 'Expense deleted successfully'
  };
  return messages[type] || 'Item deleted successfully';
};


// ==========================================
// DEFAULT EXPORTS (FIXED)
// ==========================================
const CONSTANTS = {
  API_CONFIG,
  ORDER_TYPES,
  PAYMENT_TYPES,
  MEAL_TYPES,
  MEAL_TYPE_DISPLAY_NAMES,
  DISH_CATEGORIES,
  CATEGORY_DISPLAY_NAMES,
  CATEGORY_MEAL_RESTRICTIONS,
  SHIFT_TYPES,
  SHIFT_TIMINGS,
  SHIFT_DISPLAY_NAMES,
  SHIFT_ICONS,
  WORKER_EXPENSE_CATEGORIES,
  WORKER_EXPENSE_DISPLAY_NAMES,
  WORKER_ROLES,
  WORKER_ROLE_DISPLAY_NAMES,
  MATERIAL_UNITS,
  MATERIAL_UNIT_DISPLAY_NAMES,
  EXPENSE_TYPES,
  EXPENSE_TYPE_DISPLAY_NAMES,
  MESSAGES,
  TOKEN_KEYS,
  QUERY_PARAMS,
  VALIDATION,
  UI_SETTINGS,
  STORAGE_KEYS,
  DATE_FORMATS,
  ERROR_CODES,
  STATUS,
  ANALYTICS_ENDPOINTS,
  ANALYTICS_FILTERS,
  SHIFT_INFO,
  TIMEZONE,
  REPORT_TYPES,
  REPORT_TYPE_DISPLAY_NAMES,
  CURRENCY,
  PAGINATION,
  PRINT_SETTINGS,
  EXPORT_FORMATS,
  EXPORT_FORMAT_DISPLAY_NAMES,
  NOTIFICATION_TYPES,
  CHART_TYPES,
  PERMISSIONS,
  ACTION_TYPES,
  // Helper functions
  getTodayDate,
  getYesterdayDate,
  formatDateDisplay,
  formatCurrency,
  getCurrentShift,
  isToday,
  isYesterday,
  getDeleteConfirmationMessage,
  getDeleteSuccessMessage
};

export default CONSTANTS;