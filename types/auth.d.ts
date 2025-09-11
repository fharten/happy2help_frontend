import { Ngo } from './ngo';
import { User } from './user';

export type AuthUser = User | Ngo;
export type EntityType = 'user' | 'ngo';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface NGORegisterRequest extends LoginRequest {
  name: string;
  principal: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UserRegisterRequest extends LoginRequest {
  // NO EXTRA LOGIC
  // JUST ADDED FOR CLEARITY
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: string;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface JWTPayload {
  id: string;
  email: string;
  role: string;
  entityType: 'user' | 'ngo';
  jti: string;
  exp: number;
  iat: number;
}
