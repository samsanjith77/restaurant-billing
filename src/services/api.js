import { API_CONFIG,ANALYTICS_ENDPOINTS } from '../utils/constants';
import AuthService from './authService';

class ApiService {
  // Helper method to get default headers with auth token
  static getHeaders(isFormData = false) {
    const headers = {};
    const token = AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    return headers;
  }

  // Make authenticated fetch request with token refresh logic
  static async authenticatedFetch(url, options = {}) {
    try {
      let response = await fetch(url, options);

      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        try {
          await AuthService.refreshToken();

          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${AuthService.getAccessToken()}`
          };
          response = await fetch(url, options);
        } catch (refreshError) {
          AuthService.clearTokens();
          window.location.href = '/login';
          throw new Error('Session expired. Please login again.');
        }
      }

      return response;
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // ============= DISHES =============

  /**
   * Get dishes with flexible filtering options
   * @param {Object} params - Query parameters
   * @param {string} params.meal_type - Filter by meal type (all, morning, afternoon, night)
   * @param {string} params.category - Filter by category (rice, gravy, curry, sidedish, dosa, porotta, chinese, extras)
   * @param {boolean} params.group_by_meal - Group dishes by meal type
   * @param {boolean} params.group_by_category - Group dishes by category (excludes extras)
   * @param {boolean} params.get_available_categories - Get available categories for meal type
   * @returns {Promise<Array>} Array of dishes or grouped data
   */
  static async getDishes(params = {}) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`;
      
      const queryParams = new URLSearchParams();
      
      // Add meal_type if provided (supports both snake_case and camelCase)
      if (params.meal_type || params.mealType) {
        queryParams.append('meal_type', params.meal_type || params.mealType);
      }
      
      // Add category if provided
      if (params.category) {
        queryParams.append('category', params.category);
      }
      
      // Add grouping parameters
      if (params.group_by_meal || params.groupByMeal) {
        queryParams.append('group_by_meal', 'true');
      }
      
      if (params.group_by_category || params.groupByCategory) {
        queryParams.append('group_by_category', 'true');
      }
      
      // Get available categories for a meal type
      if (params.get_available_categories || params.getAvailableCategories) {
        queryParams.append('get_available_categories', 'true');
      }
      
      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dishes');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

  /**
   * Get extras only (category=extras)
   * Extras are meal-time independent
   * @returns {Promise<Array>} Array of extras dishes
   */
  static async getExtras() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}?category=extras`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch extras');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching extras:', error);
      throw error;
    }
  }

  /**
   * Get dishes grouped by category (excludes extras)
   * @param {string} mealType - Meal type filter
   * @returns {Promise<Array>} Grouped dishes data
   */
  static async getDishesByCategory(mealType) {
    try {
      const params = new URLSearchParams({
        group_by_category: 'true',
        meal_type: mealType
      });
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}?${params.toString()}`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dishes by category');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes by category:', error);
      throw error;
    }
  }

  // Get single dish by ID
  static async getDishDetail(dishId) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}${dishId}/`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch dish details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching dish details:', error);
      throw error;
    }
  }

  // Create dish
  static async createDish(formData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_DISH}`,
        {
          method: 'POST',
          headers: this.getHeaders(true),
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create dish');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  }

  // Update dish (full update)
  static async updateDish(dishId, dishData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}${dishId}/update/`;

      const response = await this.authenticatedFetch(url, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(dishData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update dish');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating dish:', error);
      throw error;
    }
  }

  /**
   * Delete dish (soft delete - sets is_available to False)
   * @param {number} dishId - Dish ID to delete
   * @returns {Promise<Object>} Success message
   */
  static async deleteDish(dishId) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_DISH}${dishId}/delete/`;

      console.log('🗑️ Deleting dish:', dishId);
      console.log('URL:', url);

      const response = await this.authenticatedFetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Delete error:', errorData);
        throw new Error(errorData.error || 'Failed to delete dish');
      }
      
      const result = await response.json();
      console.log('✅ Dish deleted successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ Error deleting dish:', error);
      throw error;
    }
  }

  // Update dish price
  static async updateDishPrice(dishId, priceData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}${dishId}/update-price/`;

      const response = await this.authenticatedFetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(priceData)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update dish price');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating dish price:', error);
      throw error;
    }
  }

  // Update dish image
  static async updateDishImage(dishId, imageFile) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}${dishId}/update-image/`;

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await this.authenticatedFetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update dish image');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating dish image:', error);
      throw error;
    }
  }

  // ============= DISH CATEGORIES =============

  /**
   * Get dish categories
   * @param {string} mealType - Optional meal type to filter categories
   * @param {boolean} includeExtras - Whether to include extras category (default: false)
   * @returns {Promise<Array>} Array of category objects
   */
  static async getDishCategories(mealType = null, includeExtras = false) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISH_CATEGORIES}`;
      
      const queryParams = new URLSearchParams();
      
      if (mealType) {
        queryParams.append('meal_type', mealType);
      }

      if (includeExtras) {
        queryParams.append('include_extras', 'true');
      }

      if (queryParams.toString()) {
        url += `?${queryParams.toString()}`;
      }

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch categories');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // ============= DISH ORDERING =============

  // Get dishes grouped by meal type for ordering page
  static async getDishesForOrdering() {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES_FOR_ORDERING}`;

    console.log('📡 Fetching dishes for ordering from:', url);

    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('📡 Error response:', errorData);
      throw new Error(errorData.error || 'Failed to fetch dishes for ordering');
    }
    
    const data = await response.json();
    console.log('📡 Parsed response data:', data);
    
    return data;
  } catch (error) {
    console.error('📡 Error fetching dishes for ordering:', error);
    throw error;
  }
}

  // Reorder dishes within a meal type
 // In api.js
static async reorderDishes(mealType, category, dishesOrder) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REORDER_DISHES}`;

    const payload = {
      meal_type: mealType,
      category: category,
      dishes: dishesOrder
    };

    console.log('📡 Reordering dishes at URL:', url);
    console.log('📡 Full payload:', JSON.stringify(payload, null, 2));

    const response = await this.authenticatedFetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(payload)
    });

    console.log('📡 Response status:', response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('📡 Error response:', errorData);
      throw new Error(errorData.error || 'Failed to reorder dishes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('📡 Error reordering dishes:', error);
    throw error;
  }
}


  // Initialize dish orders (one-time setup)
  static async initializeDishOrders() {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.INITIALIZE_ORDERS}`;

      const response = await this.authenticatedFetch(url, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to initialize dish orders');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error initializing dish orders:', error);
      throw error;
    }
  }

  // ============= ORDERS =============

  /**
   * Create order with items and extras
   * @param {Object} orderData - Order details
   * @param {Array} orderData.items - Main dish items [{dish_id, quantity}]
   * @param {Array} orderData.addons - Extras items [{dish_id, quantity}]
   * @param {number} orderData.total_amount - Total order amount
   * @param {string} orderData.order_type - 'dine-in' or 'delivery'
   * @param {string} orderData.payment_type - 'cash', 'upi', or 'card'
   * @returns {Promise<Object>} Created order data
   */
  static async createOrder(orderData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ORDER}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(orderData)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create order');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Get order history with date range
   * @param {Object} payload - Filter parameters
   * @param {string} payload.start_time - Start datetime
   * @param {string} payload.end_time - End datetime
   * @returns {Promise<Object>} Order history with summary
   */
  static async getOrderHistory(payload = {}) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_HISTORY}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(payload)
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch order history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  /**
   * Get single order details
   * @param {number} orderId - Order ID
   * @returns {Promise<Object>} Order details
   */
  static async getOrderDetail(orderId) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDERS}${orderId}/`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to fetch order details');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  }

  static async getWorkers() {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKERS}`;
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch workers');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching workers:', error);
    throw error;
  }
}

static async addWorker(workerData) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_WORKER}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(workerData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add worker');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding worker:', error);
    throw error;
  }
}

// Material endpoints
static async getMaterials() {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.MATERIALS}`;
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch materials');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching materials:', error);
    throw error;
  }
}

static async addMaterial(materialData) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_MATERIAL}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(materialData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add material');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding material:', error);
    throw error;
  }
}

// Expense endpoints
static async filterExpenses(filters) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILTER_EXPENSES}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(filters)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch expenses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
}

static async addWorkerExpense(expenseData) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_WORKER_EXPENSE}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add worker expense');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding worker expense:', error);
    throw error;
  }
}

static async addMaterialExpense(expenseData) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_MATERIAL_EXPENSE}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(expenseData)
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add material expense');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error adding material expense:', error);
    throw error;
  }
}


static async deleteWorker(workerId) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_WORKER(workerId)}`;
    const response = await this.authenticatedFetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete worker');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting worker:', error);
    throw error;
  }
}

static async deleteMaterial(materialId) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_MATERIAL(materialId)}`;
    const response = await this.authenticatedFetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete material');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
}


static async deleteExpense(expenseId) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DELETE_EXPENSE(expenseId)}`;
    const response = await this.authenticatedFetch(url, {
      method: 'DELETE',
      headers: this.getHeaders()
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete expense');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
}

// Get dish sales data for a specific period
static async getDishSalesInPeriod(params) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISH_SALES_IN_PERIOD}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch dish sales data');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dish sales:', error);
    throw error;
  }
}

// Get all selling dishes for a period (without specific dish_id)
static async getTopSellingDishes(params) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISH_SALES_IN_PERIOD}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        start: params.start,
        end: params.end
        // No dish_id means get all dishes
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch top selling dishes');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching top selling dishes:', error);
    throw error;
  }
}

static async getDishSalesByShift(params) {
  try {
    const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISH_SALES_IN_PERIOD}`;
    const response = await this.authenticatedFetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(params)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch dish sales by shift');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching dish sales by shift:', error);
    throw error;
  }
}
// ==========================================
// ANALYTICS API METHODS
// ==========================================

// Get analytics dashboard (shift-wise)
static async getAnalyticsDashboard(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.DASHBOARD}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch analytics dashboard');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics dashboard:', error);
    throw error;
  }
}

// Get category performance
static async getCategoryPerformance(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.CATEGORIES}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch category performance');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching category performance:', error);
    throw error;
  }
}

// Get hourly trends
static async getHourlyTrends(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.HOURLY}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch hourly trends');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching hourly trends:', error);
    throw error;
  }
}

// Get comparison data
static async getComparison(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.COMPARISON}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch comparison data');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching comparison:', error);
    throw error;
  }
}

// Get low performing dishes
static async getLowPerformingDishes(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.LOW_PERFORMING}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch low performing dishes');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching low performing dishes:', error);
    throw error;
  }
}

// Get worker expense breakdown
static async getWorkerExpenseBreakdown(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.WORKER_EXPENSES}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch worker expenses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching worker expenses:', error);
    throw error;
  }
}

// Get material expense breakdown
static async getMaterialExpenseBreakdown(params = {}) {
  try {
    const queryParams = new URLSearchParams(params).toString();
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.MATERIAL_EXPENSES}${queryParams ? '?' + queryParams : ''}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch material expenses');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching material expenses:', error);
    throw error;
  }
}

// Get weekly summary
static async getWeeklySummary() {
  try {
    const url = `${API_CONFIG.BASE_URL}${ANALYTICS_ENDPOINTS.WEEKLY_SUMMARY}`;
    
    const response = await this.authenticatedFetch(url, {
      headers: this.getHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to fetch weekly summary');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching weekly summary:', error);
    throw error;
  }
}

static async getShiftReport(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      // Add date parameter
      if (params.date) {
        queryParams.append('date', params.date);
      }
      
      // Add shift parameter
      if (params.shift) {
        queryParams.append('shift', params.shift);
      }
      
      // Add timezone parameter
      if (params.timezone) {
        queryParams.append('timezone', params.timezone);
      }
      
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.SHIFT_REPORT}${
        queryParams.toString() ? '?' + queryParams.toString() : ''
      }`;
      
      console.log('📊 Fetching shift report from:', url);
      
      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });
      
      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('📊 Error response:', errorData);
        throw new Error(errorData.error || 'Failed to fetch shift report');
      }
      
      const data = await response.json();
      console.log('📊 Shift report data:', data);
      
      return data;
    } catch (error) {
      console.error('📊 Error fetching shift report:', error);
      throw error;
    }
  }

  /**
   * Get report for a specific shift on a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} shiftType - 'morning', 'afternoon', or 'night'
   * @returns {Promise<Object>} Single shift report data
   */
  static async getSingleShiftReport(date, shiftType) {
    try {
      return await this.getShiftReport({
        date: date,
        shift: shiftType
      });
    } catch (error) {
      console.error('📊 Error fetching single shift report:', error);
      throw error;
    }
  }

  /**
   * Get today's full report (all shifts)
   * @returns {Promise<Object>} Today's complete report
   */
  static async getTodayReport() {
    try {
      const today = new Date().toISOString().split('T')[0];
      return await this.getShiftReport({
        date: today,
        shift: 'all'
      });
    } catch (error) {
      console.error('📊 Error fetching today\'s report:', error);
      throw error;
    }
  }

  /**
   * Get yesterday's report (all shifts)
   * @returns {Promise<Object>} Yesterday's complete report
   */
  static async getYesterdayReport() {
    try {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayDate = yesterday.toISOString().split('T')[0];
      
      return await this.getShiftReport({
        date: yesterdayDate,
        shift: 'all'
      });
    } catch (error) {
      console.error('📊 Error fetching yesterday\'s report:', error);
      throw error;
    }
  }

  /**
   * Get date range report (multiple days)
   * @param {string} startDate - Start date in YYYY-MM-DD format
   * @param {string} endDate - End date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of daily reports
   */
  static async getDateRangeReport(startDate, endDate) {
    try {
      const reports = [];
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      for (let date = start; date <= end; date.setDate(date.getDate() + 1)) {
        const dateStr = date.toISOString().split('T')[0];
        const report = await this.getShiftReport({
          date: dateStr,
          shift: 'all'
        });
        reports.push(report);
      }
      
      return reports;
    } catch (error) {
      console.error('📊 Error fetching date range report:', error);
      throw error;
    }
  }
  
}

export default ApiService;
