import { API_CONFIG } from '../utils/constants';
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

  // Get all dishes or filter by meal_type and dish_type
  static async getDishes(mealType = null, dishType = null) {
    try {
      let url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`;
      
      const params = new URLSearchParams();
      if (mealType) params.append('meal_type', mealType);
      if (dishType) params.append('dish_type', dishType);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
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

      if (!response.ok) throw new Error('Failed to fetch dish details');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dish details:', error);
      throw error;
    }
  }

  // Create dish with meal_type and dish_type
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

      if (!response.ok) throw new Error('Failed to create dish');
      return await response.json();
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  }

  // Delete dish
  static async deleteDish(dishId) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}${dishId}/delete/`;

      const response = await this.authenticatedFetch(url, {
        method: 'DELETE',
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to delete dish');
      return await response.json();
    } catch (error) {
      console.error('Error deleting dish:', error);
      throw error;
    }
  }

  // Update dish price - CORRECTED
  static async updateDishPrice(dishId, priceData) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_PRICE}${dishId}/update-price/`;

      const response = await this.authenticatedFetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(),
        body: JSON.stringify(priceData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dish price');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating dish price:', error);
      throw error;
    }
  }

  // Update dish image - CORRECTED
  static async updateDishImage(dishId, imageFile) {
    try {
      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_IMAGE}${dishId}/update-image/`;

      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await this.authenticatedFetch(url, {
        method: 'PATCH',
        headers: this.getHeaders(true),
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update dish image');
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating dish image:', error);
      throw error;
    }
  }

  // ============= ORDERS =============

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

      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

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

      if (!response.ok) throw new Error('Failed to fetch order history');
      return await response.json();
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  // ============= PERSONS =============
  static async getPersons() {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PERSONS}`,
        { headers: this.getHeaders() }
      );

      if (!response.ok) throw new Error('Failed to fetch persons');
      return await response.json();
    } catch (error) {
      console.error('Error fetching persons:', error);
      throw error;
    }
  }

  static async addPerson(personData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_PERSON}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(personData)
        }
      );

      if (!response.ok) throw new Error('Failed to add person');
      return await response.json();
    } catch (error) {
      console.error('Error adding person:', error);
      throw error;
    }
  }

  // ============= EXPENSES =============

  static async filterExpenses(filterData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.FILTER_EXPENSES}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(filterData)
        }
      );

      if (!response.ok) throw new Error('Failed to filter expenses');
      return await response.json();
    } catch (error) {
      console.error('Error filtering expenses:', error);
      throw error;
    }
  }

  static async addExpense(expenseData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ADD_EXPENSE}`,
        {
          method: 'POST',
          headers: this.getHeaders(),
          body: JSON.stringify(expenseData)
        }
      );

      if (!response.ok) throw new Error('Failed to add expense');
      return await response.json();
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
  }

  // ============= ANALYTICS =============

  static async getAnalyticsSummary(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.filter) queryParams.append('filter', params.filter);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ANALYTICS_SUMMARY}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch analytics summary');
      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics summary:', error);
      throw error;
    }
  }

  static async getWorkerExpense(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.date) {
        queryParams.append('date', params.date);
      } else if (params.filter) {
        queryParams.append('filter', params.filter);
        if (params.start_date) queryParams.append('start_date', params.start_date);
        if (params.end_date) queryParams.append('end_date', params.end_date);
      }

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_EXPENSE}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch worker expense');
      return await response.json();
    } catch (error) {
      console.error('Error fetching worker expense:', error);
      throw error;
    }
  }

  static async getDailyRevenueTrend(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.days) queryParams.append('days', params.days);
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DAILY_REVENUE_TREND}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch daily revenue trend');
      return await response.json();
    } catch (error) {
      console.error('Error fetching daily revenue trend:', error);
      throw error;
    }
  }

  static async getTopSellingDishes(params = {}) {
    try {
      const queryParams = new URLSearchParams();

      if (params.filter) queryParams.append('filter', params.filter);
      if (params.start_date) queryParams.append('start_date', params.start_date);
      if (params.end_date) queryParams.append('end_date', params.end_date);

      const url = `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.TOP_SELLING_DISHES}${
        queryParams.toString() ? `?${queryParams.toString()}` : ''
      }`;

      const response = await this.authenticatedFetch(url, {
        headers: this.getHeaders()
      });

      if (!response.ok) throw new Error('Failed to fetch top selling dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching top selling dishes:', error);
      throw error;
    }
  }
}

export default ApiService;
