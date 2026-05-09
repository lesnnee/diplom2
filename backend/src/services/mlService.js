import axios from 'axios';

const ML_API_URL = process.env.ML_API_URL || 'http://localhost:8000';

class MLService {
  constructor() {
    this.client = axios.create({
      baseURL: ML_API_URL,
      timeout: 5000,
    });
  }

  async predict(description) {
    try {
      const response = await this.client.post('/predict', {
        description: description
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('ML Prediction failed:', error.message);
      return {
        success: false,
        error: error.message,
        data: {
          category: 'unknown',
          priority: 3,
          confidence: 0,
          auto_approved: false
        }
      };
    }
  }

  async sendFeedback(description, category, priority = 3) {
    try {
      const response = await this.client.post('/feedback', {
        description: description,
        category: category,
        priority: priority
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('ML Feedback failed:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'unavailable', error: error.message };
    }
  }
}

export default new MLService();