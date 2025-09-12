'use client';

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { AuthService } from '@/lib/auth-service';
import {
  AuthTokens,
  AuthUser,
  LoginRequest,
  NGORegisterRequest,
  UserRegisterRequest,
} from '@/types/auth';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useRouter } from 'next/navigation';
import { isTokenExpired } from '@/lib/jwt-utils';
import { SWRConfig } from 'swr';

// INTERFACE
interface AuthContextType {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  loginUser: (credentials: LoginRequest) => Promise<void>;
  loginNgo: (credentials: LoginRequest) => Promise<void>;
  registerUser: (userData: UserRegisterRequest) => Promise<void>;
  registerNgo: (userData: NGORegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// FETCHER
const swrFetcher = async (url: string) => {
  const tokens = localStorage.getItem('auth_tokens');
  if (!tokens) throw new Error('No auth tokens');

  const { accessToken, refreshToken } = JSON.parse(tokens);

  const res = await AuthService.authenticatedFetch(
    url,
    { method: 'GET' },
    accessToken,
    refreshToken,
    (newTokens) =>
      localStorage.setItem('auth_tokens', JSON.stringify(newTokens)),
  );

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.success ? data.data : data;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tokens, setTokens, removeTokens] = useLocalStorage<AuthTokens | null>(
    'auth_tokens',
    null,
  );
  const [authUser, setAuthUser, removeAuthUser] =
    useLocalStorage<AuthUser | null>('auth_user', null);
  const router = useRouter();

  const loginUser = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const res = await AuthService.loginUser(credentials);
      setTokens(res.tokens);
      setAuthUser(res.user);
      setUser(res.user);

      // REDIRECT AFTER LOGIN
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') ||
        '/projects';
      router.push(redirectUrl);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginNgo = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const res = await AuthService.loginNgo(credentials);
      setTokens(res.tokens);
      setAuthUser(res.user);
      setUser(res.user);

      // REDIRECT AFTER LOGIN
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') ||
        '/dashboard';
      router.push(redirectUrl);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerUser = async (credentials: UserRegisterRequest) => {
    setIsLoading(true);

    try {
      await AuthService.registerUser(credentials);
      router.push('/login?message=Registration successful, please login');
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerNgo = async (credentials: NGORegisterRequest) => {
    setIsLoading(true);

    try {
      await AuthService.registerNgo(credentials);
      router.push(
        '/login?message=Registration successful, please login&ngo=true',
      );
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      if (tokens?.refreshToken) await AuthService.logout(tokens.refreshToken);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      removeTokens();
      removeAuthUser();
      setUser(null);
      setIsLoading(false);
      router.push('/');
    }
  }, [tokens?.refreshToken, removeTokens, removeAuthUser, router]);

  const refreshUser = async () => {
    try {
      if (authUser) setUser(authUser);
    } catch (error) {
      console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  // AUTO REFRESH TOKEN
  useEffect(() => {
    if (!tokens?.accessToken) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    // SET USER FROM LOCALSTORAGE IF TOKENS EXIST
    if (authUser) setUser(authUser);

    const checkAndRefreshToken = async () => {
      if (isTokenExpired(tokens.accessToken)) {
        try {
          const newTokens = await AuthService.refreshTokenFunction(
            tokens.refreshToken,
          );
          setTokens(newTokens);
        } catch (error) {
          console.error('Token refresh failed:', error);
          await logout();
        }
      }
      setIsLoading(false);
    };

    checkAndRefreshToken();
  }, [tokens, authUser, setTokens, logout]);

  // SET UP REFRESH TIMER
  useEffect(() => {
    if (!tokens?.accessToken) return;

    const interval = setInterval(async () => {
      if (isTokenExpired(tokens.accessToken)) {
        try {
          const newTokens = await AuthService.refreshTokenFunction(
            tokens.refreshToken,
          );
          setTokens(newTokens);
        } catch (error) {
          console.error('Automatic token refresh failed:', error);
          await logout();
        }
      }
    }, 5 * 60 * 1000); // CHECK EVERY 5 MINS

    return () => clearInterval(interval);
  }, [logout, setTokens, tokens]);

  const value: AuthContextType = {
    user,
    tokens,
    isLoading,
    loginUser,
    loginNgo,
    registerUser,
    registerNgo,
    logout,
    isAuthenticated: !!user && !!tokens,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      <SWRConfig
        value={{
          fetcher: swrFetcher,
          revalidateOnFocus: false,
          refreshInterval: 5 * 60 * 1000, // 5 MINS
          dedupingInterval: 2000,
          errorRetryCount: 3,
        }}
      >
        {children}
      </SWRConfig>
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
