import { API_CONFIG } from '../utils/constants';
import AuthService from './authService';

class ApiService {
  // Helper method to get default headers with auth token
  static getHeaders(isFormData = false) {
    const headers = {};

    // Add authorization header if logged in
    const token = AuthService.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // Make authenticated fetch request with token refresh
  static async authenticatedFetch(url, options = {}) {
    try {
      // First attempt with current token
      let response = await fetch(url, options);

      // If 401 Unauthorized, try to refresh token
      if (response.status === 401) {
        console.log('Token expired, refreshing...');
        
        try {
          await AuthService.refreshToken();
          
          // Retry request with new token
          options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${AuthService.getAccessToken()}`
          };
          
          response = await fetch(url, options);
        } catch (refreshError) {
          // Refresh failed, redirect to login
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
  static async getDishes() {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`,
        {
          headers: this.getHeaders()
        }
      );
      
      if (!response.ok) throw new Error('Failed to fetch dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

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

  static async updateDishPrice(dishId, priceData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_PRICE.replace('<dish_id>', dishId)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(),
          body: JSON.stringify(priceData)
        }
      );

      if (!response.ok) throw new Error('Failed to update dish price');
      return await response.json();
    } catch (error) {
      console.error('Error updating dish price:', error);
      throw error;
    }
  }

  static async updateDishImage(dishId, formData) {
    try {
      const response = await this.authenticatedFetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_IMAGE.replace('<dish_id>', dishId)}`,
        {
          method: 'PATCH',
          headers: this.getHeaders(true),
          body: formData
        }
      );

      if (!response.ok) throw new Error('Failed to update dish image');
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
      
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      
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
        {
          headers: this.getHeaders()
        }
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
    
    if (params.filter) {
      queryParams.append('filter', params.filter);
    }
    if (params.start_date) {
      queryParams.append('start_date', params.start_date);
    }
    if (params.end_date) {
      queryParams.append('end_date', params.end_date);
    }

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

static async getWorkerExpense(date = null) {
  try {
    const url = date 
      ? `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_EXPENSE}?date=${date}`
      : `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.WORKER_EXPENSE}`;

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

}

export default ApiService;
