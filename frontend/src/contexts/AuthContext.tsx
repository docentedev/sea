import React, { createContext, useContext, useReducer, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { AuthState, LoginRequest, User } from '../types/api';
import { apiService } from '../services/api';

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string; expiresAt: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  loading: true, // Start with loading true for initial auth check
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: null,
      };
    case 'CHECK_AUTH':
      return { ...state, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

interface AuthContextType {
  state: AuthState;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = () => {
      console.log('🔍 Checking auth on mount...');
      const token = localStorage.getItem('auth_token');
      const userStr = localStorage.getItem('auth_user');
      const expiresAt = localStorage.getItem('auth_expires_at');

      console.log('📦 Stored data:', { token: !!token, userStr: !!userStr, expiresAt });

      if (token && userStr && expiresAt) {
        const now = new Date();
        const expiry = new Date(expiresAt);

        console.log('⏰ Current time:', now.toISOString());
        console.log('⏰ Expiry time:', expiry.toISOString());
        console.log('⏰ Is expired:', now >= expiry);

        if (now < expiry) {
          try {
            const user = JSON.parse(userStr);
            console.log('✅ Restoring auth session for user:', user.username);
            dispatch({
              type: 'LOGIN_SUCCESS',
              payload: { user, token, expiresAt },
            });
          } catch (error) {
            console.error('❌ Error parsing stored user data:', error);
            // Invalid stored data, clear it
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            localStorage.removeItem('auth_expires_at');
          }
        } else {
          console.log('⏰ Token expired, clearing storage');
          // Token expired, clear storage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_expires_at');
        }
      } else {
        console.log('❌ Missing stored auth data');
      }

      // Always set loading to false after check
      console.log('🔄 Setting loading to false');
      dispatch({ type: 'CHECK_AUTH' });
    };

    checkAuth();
  }, []);

  const login = async (credentials: LoginRequest) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const response = await apiService.login(credentials);

      // Store in localStorage
      localStorage.setItem('auth_token', response.token);
      localStorage.setItem('auth_user', JSON.stringify(response.user));
      localStorage.setItem('auth_expires_at', response.expiresAt);

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: response.user,
          token: response.token,
          expiresAt: response.expiresAt,
        },
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_expires_at');

    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const isAdmin = (): boolean => {
    return !!(state.user?.role && typeof state.user.role === 'object' && 'can_admin' in state.user.role && state.user.role.can_admin === true);
  };

  const value: AuthContextType = {
    state,
    login,
    logout,
    clearError,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};