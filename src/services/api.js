import { API_CONFIG } from '../utils/constants';

class ApiService {
  // Helper method to get default headers
  static getHeaders(isFormData = false) {
    const headers = {
      'ngrok-skip-browser-warning': 'true'
    };

    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    return headers;
  }

  // ============= DISHES =============
  static async getDishes() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`, {
        headers: this.getHeaders()
      });
      
      if (!response.ok) throw new Error('Failed to fetch dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

  static async createDish(formData) {
    try {
      const response = await fetch(
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

  // CHANGED: PUT to PATCH
  static async updateDishPrice(dishId, priceData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_PRICE.replace('<dish_id>', dishId)}`,
        {
          method: 'PATCH', // Changed from PUT to PATCH
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

  // CHANGED: PUT to PATCH
  static async updateDishImage(dishId, formData) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_IMAGE.replace('<dish_id>', dishId)}`,
        {
          method: 'PATCH', // Changed from PUT to PATCH
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
      const response = await fetch(
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

 // ============= ORDERS =============

// FIXED: Force POST by always sending a body (even if empty)
  static async getOrderHistory(payload = {}) {
    try {
      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_HISTORY}`,
        {
          method: 'POST',
          headers: this.getHeaders(), // Changed: Use getHeaders() for consistency
          body: JSON.stringify(payload) // Always send body, even if empty {}
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
      const response = await fetch(
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
      const response = await fetch(
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
      const response = await fetch(
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
      const response = await fetch(
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
}

export default ApiService;
