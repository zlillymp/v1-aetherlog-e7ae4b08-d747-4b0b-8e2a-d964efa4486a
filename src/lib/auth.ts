import { create } from 'zustand';
import { User, JWTPayload } from '@shared/types';
import { api } from './api-client';
import { useAetherLogStore } from './store';
interface SignupPayload {
  name: string;
  email: string;
  password: string;
}
interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  actions: {
    initializeAuth: () => void;
    login: (email: string, password: string) => Promise<User>;
    signup: (payload: SignupPayload) => Promise<User>;
    logout: () => void;
  };
}
// Helper to decode JWT without a library
function decodeJwt(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    const payload = JSON.parse(jsonPayload);
    // Basic check for expiration
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}
export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  user: null,
  actions: {
    initializeAuth: () => {
      const token = localStorage.getItem('aetherlog_token');
      if (token) {
        const payload = decodeJwt(token);
        if (payload) {
          set({
            isAuthenticated: true,
            user: {
              id: payload.userId,
              email: payload.userId, // Assuming email is the userId
              name: '', // Name is not in JWT, could be fetched or stored separately
              role: payload.role,
            },
          });
        } else {
          // Token is invalid or expired, clear it
          localStorage.removeItem('aetherlog_token');
        }
      }
    },
    login: async (email, password) => {
      const { token, user } = await api<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('aetherlog_token', token);
      set({ isAuthenticated: true, user });
      return user;
    },
    signup: async (payload) => {
      const user = await api<User>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      return user;
    },
    logout: () => {
      localStorage.removeItem('aetherlog_token');
      useAetherLogStore.getState().actions.clearUserData();
      set({ isAuthenticated: false, user: null });
    },
  },
}));
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useAuthUser = () => useAuthStore((state) => state.user);
export const useAuthActions = () => useAuthStore((state) => state.actions);