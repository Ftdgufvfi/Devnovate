import axios from 'axios';
import {
  User,
  AuthResponse,
  LoginCredentials,
  RegisterCredentials
} from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('🔧 Frontend API URL:', API_URL); // Debug log

// Create axios instance with default config
const authAPI = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
authAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
authAPI.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  // Register new user
  async register(credentials: RegisterCredentials): Promise<AuthResponse> {
    console.log('🚀 Registration attempt with data:', credentials); // Debug log
    try {
      const response = await authAPI.post('/register', credentials);
      console.log('✅ Registration successful:', response.data); // Debug log
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      console.error('❌ Registration error:', error); // Debug log
      console.error('Error response:', error.response?.data); // Debug log
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Registration failed'
      );
    }
  },

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authAPI.post('/login', credentials);
      const { user, token } = response.data;
      
      // Store token and user data
      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return response.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Login failed'
      );
    }
  },

  // Logout user
  async logout(): Promise<void> {
    try {
      await authAPI.post('/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User> {
    try {
      const response = await authAPI.get('/me');
      const { user } = response.data;
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to get user data'
      );
    }
  },

  // Update user profile
  async updateProfile(updates: Partial<User>): Promise<User> {
    try {
      const response = await authAPI.put('/profile', updates);
      const { user } = response.data;
      
      // Update stored user data
      localStorage.setItem('user_data', JSON.stringify(user));
      
      return user;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error || 
        'Failed to update profile'
      );
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    return !!token;
  },

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  // Get stored user data
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Failed to parse stored user data:', error);
      return null;
    }
  },

  // Clear all auth data
  clearAuthData(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  }
};
