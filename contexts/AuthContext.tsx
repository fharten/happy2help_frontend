import { User } from '@/types/user';

interface AuthContextType {
  user: User | null;
  entityType: 'user' | 'ngo' | null;
  role: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (
    email: string,
    password: string,
    entityType: 'user' | 'ngo',
  ) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
}
