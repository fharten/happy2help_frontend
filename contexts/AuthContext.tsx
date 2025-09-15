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
import { decodeToken, isTokenExpired } from '@/lib/jwt-utils';
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [tokens, setTokens, removeTokens] = useLocalStorage<AuthTokens | null>(
    'auth_tokens',
    null,
  );
  const [authUser, setAuthUser, removeAuthUser] =
    useLocalStorage<AuthUser | null>('auth_user', null);
  const router = useRouter();

  // WAIT FOR HYDRATION FIRST
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Debug logging
  // useEffect(() => {
  //    console.log('AuthContext Debug:' {
  //     user: !!user,
  //     isLoading,
  //     isHydrated,
  //     hasTokens: !!tokens,
  //     hasAuthUser: !!authUser,
  //     isAuthenticated: !!user && !!tokens,
  //   });
  // }, [user, isLoading, isHydrated, tokens, authUser]);

  const loginUser = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const res = await AuthService.loginUser(credentials);
      // console.log('Login User Response:', res);

      setTokens(res.tokens);
      setAuthUser(res.user);
      setUser(res.user);

      // REDIRECT AFTER LOGIN
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') ||
        '/projects';
      router.push(redirectUrl);
    } catch (error) {
      // console.error('Login User Error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginNgo = async (credentials: LoginRequest) => {
    setIsLoading(true);

    try {
      const res = await AuthService.loginNgo(credentials);
      console.log('Login NGO Response:', res);

      // DECODE TOKEN TO GET ADDITIONAL USER INFO
      const decodedToken = decodeToken(res.tokens.accessToken);

      // MERGE TOKEN INFO WITH USER OBJECT
      const enrichedUser = {
        ...res.user,
        role: decodedToken?.role || 'ngo',
        entityType: decodedToken?.entityType || 'ngo',
      };

      setTokens(res.tokens);
      setAuthUser(enrichedUser); // STORE ENRICHED USER
      setUser(enrichedUser); // SET ENRICHED USER

      // REDIRECT AFTER LOGIN
      const redirectUrl =
        new URLSearchParams(window.location.search).get('redirect') ||
        '/dashboard';
      router.push(redirectUrl);
    } catch (error) {
      console.error('Login NGO Error:', error);
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
      // } catch (error) {
      // console.error('Logout error:', error);
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
      if (authUser) {
        // console.log('Refreshing user from localStorage:', authUser);
        setUser(authUser);
      }
    } catch (error) {
      // console.error('Failed to refresh user:', error);
      setUser(null);
    }
  };

  // INITIALIZE AUTH STATE AFTER HYDRATION
  useEffect(() => {
    if (!isHydrated) {
      // console.log('Not hydrated yet, waiting...');
      return;
    }

    // console.log('Hydrated, initializing auth...', { tokens, authUser });

    const initializeAuth = async () => {
      try {
        if (!tokens?.accessToken) {
          // console.log('No tokens found, user not authenticated');
          setUser(null);
          setIsLoading(false);
          return;
        }

        if (!authUser) {
          // console.log('Tokens exist but no user data, clearing tokens');
          removeTokens();
          setUser(null);
          setIsLoading(false);
          return;
        }

        // console.log('Found tokens and user, checking token validity...');

        // CHECK IF TOKEN IS EXPIRED
        if (isTokenExpired(tokens.accessToken)) {
          // console.log('Token expired, attempting refresh...');
          try {
            const newTokens = await AuthService.refreshTokenFunction(
              tokens.refreshToken,
            );
            // console.log('Token refreshed successfully');
            setTokens(newTokens);
            setUser(authUser);
          } catch (error) {
            // console.error('Token refresh failed, clearing auth:', error);
            removeTokens();
            removeAuthUser();
            setUser(null);
          }
        } else {
          // console.log('Token is valid, setting user');
          setUser(authUser);
        }
      } catch (error) {
        // console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [isHydrated, tokens, authUser, setTokens, removeTokens, removeAuthUser]);

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
          // console.error('Automatic token refresh failed:', error);
          await logout();
        }
      }
    }, 5 * 60 * 1000); // CHECK EVERY 5 MINS

    return () => clearInterval(interval);
  }, [logout, setTokens, tokens]);

  const value: AuthContextType = {
    user,
    tokens,
    isLoading: isLoading || !isHydrated, // Keep loading until hydrated AND auth is initialized
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
