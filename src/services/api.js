import { API_CONFIG } from '../utils/constants';

class ApiService {
  // Existing methods...
  static async getDishes() {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DISHES}`);
      if (!response.ok) throw new Error('Failed to fetch dishes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching dishes:', error);
      throw error;
    }
  }

  static async createOrder(orderData) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_ORDER}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      if (!response.ok) throw new Error('Failed to create order');
      return await response.json();
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  // NEW: Dish Management Methods
  static async createDish(dishData) {
    try {
      const formData = new FormData();
      formData.append('name', dishData.name);
      formData.append('price', dishData.price);

      if (dishData.image) {
        formData.append('image', dishData.image);
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CREATE_DISH}`, {
        method: 'POST',
        body: formData // Don't set Content-Type header for FormData
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to create dish: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating dish:', error);
      throw error;
    }
  }

  static async updateDishImage(dishId, imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.UPDATE_DISH_IMAGE.replace('<dish_id>', dishId)}`, 
        {
          method: 'PATCH',
          body: formData
        }
      );

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to update dish image: ${error}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating dish image:', error);
      throw error;
    }
  }
  // Add this method to your ApiService class

  // Update this method in your ApiService class

  static async getOrderHistory(payload) {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.ORDER_HISTORY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch order history');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }


}

export default ApiService;