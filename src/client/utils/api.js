// API utility for making backend requests

// Detect API URL based on environment
const getApiBaseUrl = () => {
  // Use environment variable if set (highest priority)
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  // For production, check if we're on the deployed domain
  const isProduction = process.env.NODE_ENV === 'production';
  const isDeployedDomain = window.location.hostname === 'theabugida.org' || 
                          window.location.hostname === 'www.theabugida.org';
  
  if (isProduction && isDeployedDomain) {
    // Option 1: If backend is on same domain with reverse proxy
    // return '/api';
    
    // Option 2: If backend is on subdomain (Cloudflare Tunnel)
    return 'https://api.theabugida.org/api';
    
    // Option 3: If backend is on different service, use full URL
    // return 'https://your-backend-service.com/api';
  }
  
  // For development, use localhost
  // On mobile devices, you'll need to use your computer's IP address
  // Example: http://192.168.1.100:5000/api (replace with your actual IP)
  return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiBaseUrl();

// Helper function to get auth token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    let data;
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // If not JSON, get text for error message
      const text = await response.text();
      throw new Error(text || `HTTP ${response.status}: ${response.statusText}`);
    }
    
    if (!response.ok) {
      throw new Error(data.error || data.message || `Request failed: ${response.statusText}`);
    }
    
    return data;
  } catch (error) {
    // Provide more detailed error messages
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check your connection and ensure the backend server is running.');
    }
    if (error.message) {
      throw error;
    }
    throw new Error('An unexpected error occurred. Please try again.');
  }
};

// Auth API calls
export const authAPI = {
  register: async (username, email, password) => {
    return apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  },

  login: async (usernameOrEmail, password) => {
    // Determine if input is email or username
    const isEmail = usernameOrEmail.includes('@');
    const body = isEmail 
      ? { email: usernameOrEmail, password }
      : { username: usernameOrEmail, password };
    
    return apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  getCurrentUser: async () => {
    return apiRequest('/auth/me');
  },
};

// Health check
export const healthCheck = async () => {
  return apiRequest('/health');
};

export default apiRequest;

