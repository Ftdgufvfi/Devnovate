import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AuthState, 
  LoginCredentials, 
  RegisterCredentials 
} from '../types';
import { authService } from '../services/authService';

interface AuthActions {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getCurrentUser: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  initializeAuth: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      // Actions
      login: async (credentials: LoginCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.login(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      register: async (credentials: RegisterCredentials) => {
        try {
          set({ isLoading: true, error: null });
          
          const response = await authService.register(credentials);
          
          set({
            user: response.user,
            token: response.token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          set({ isLoading: true });
          
          await authService.logout();
          
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Logout error:', error);
          // Still clear the local state even if API call fails
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },

      getCurrentUser: async () => {
        try {
          set({ isLoading: true, error: null });
          
          const user = await authService.getCurrentUser();
          
          set({
            user,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          console.error('Get current user error:', error);
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: error.message,
          });
          // Clear stored auth data if user fetch fails
          authService.clearAuthData();
        }
      },

      updateProfile: async (updates: Partial<User>) => {
        try {
          set({ isLoading: true, error: null });
          
          const updatedUser = await authService.updateProfile(updates);
          
          set({
            user: updatedUser,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          set({
            isLoading: false,
            error: error.message,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      initializeAuth: () => {
        const token = authService.getToken();
        const storedUser = authService.getStoredUser();
        
        if (token && storedUser) {
          set({
            user: storedUser,
            token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
          
          // Verify token is still valid by fetching current user
          get().getCurrentUser().catch(() => {
            // If fetch fails, user will be logged out automatically
          });
        } else {
          set({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
