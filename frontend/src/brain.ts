// API utility for QueueBeats
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8001';

type ApiResponse = {
  success: boolean;
  message?: string;
  data?: any;
  test_user?: {
    email: string;
    password: string;
    queue_access_code: string;
  };
};

const brain = {
  // Setup database tables
  setup_database: async (): Promise<Response> => {
    return fetch(`${API_URL}/api/setup/database`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Create test data
  create_test_data: async (): Promise<Response> => {
    return fetch(`${API_URL}/api/setup/test-data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  },

  // Helper to check API status
  check_status: async (): Promise<Response> => {
    return fetch(`${API_URL}/api/status`, {
      method: 'GET',
    });
  }
};

export default brain;
