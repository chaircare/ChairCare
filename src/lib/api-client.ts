import axios from 'axios';
import { auth } from './firebase';

// Get Firebase ID token for API requests
export const getFirebaseAuthHeaders = async () => {
  try {
    const user = auth.currentUser;
    if (user) {
      const idToken = await user.getIdToken();
      return { Authorization: `Bearer ${idToken}` };
    }
    return {};
  } catch (error) {
    console.error('Error getting Firebase auth token:', error);
    return {};
  }
};

// Get auth headers for API requests (legacy support)
export const getAuthHeaders = () => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Create axios instance with auth headers
export const apiClient = axios.create();

// Add request interceptor to include Firebase auth headers
apiClient.interceptors.request.use(
  async (config) => {
    try {
      // Try Firebase auth first
      const firebaseHeaders = await getFirebaseAuthHeaders();
      if (firebaseHeaders.Authorization) {
        config.headers = { ...config.headers, ...firebaseHeaders };
      } else {
        // Fallback to legacy auth
        const authHeaders = getAuthHeaders();
        if (authHeaders.Authorization) {
          config.headers = { ...config.headers, ...authHeaders };
        }
      }
    } catch (error) {
      console.error('Error adding auth headers:', error);
      // Continue without auth headers
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle auth errors
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// Create a Firebase-specific API client for admin operations
export const createFirebaseApiClient = () => {
  const client = axios.create();
  
  client.interceptors.request.use(
    async (config) => {
      try {
        const firebaseHeaders = await getFirebaseAuthHeaders();
        if (firebaseHeaders.Authorization) {
          config.headers = { ...config.headers, ...firebaseHeaders };
        }
      } catch (error) {
        console.error('Error adding Firebase auth headers:', error);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
  return client;
};

export default apiClient;