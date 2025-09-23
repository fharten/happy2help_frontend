import {
  ApiResponse,
  AuthResponse,
  AuthTokens,
  AuthUser,
  LoginRequest,
  NGORegisterRequest,
  UserRegisterRequest,
} from '@/types/auth';

export class AuthService {
  // LOGIN USER
  static async loginUser(
    credentials: LoginRequest,
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/users/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      },
    );
    const data: AuthResponse = await res.json();

    if (!res.ok || !data.success)
      throw new Error(data.message || 'Login failed');

    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        tokenType: data.data.tokenType,
        expiresIn: data.data.expiresIn,
      },
    };
  }

  // LOGIN NGO
  static async loginNgo(
    credentials: LoginRequest,
  ): Promise<{ user: AuthUser; tokens: AuthTokens }> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/ngos/login`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      },
    );
    const data: AuthResponse = await res.json();

    if (!res.ok || !data.success)
      throw new Error(data.message || 'Login failed');

    return {
      user: data.data.user,
      tokens: {
        accessToken: data.data.accessToken,
        refreshToken: data.data.refreshToken,
        tokenType: data.data.tokenType,
        expiresIn: data.data.expiresIn,
      },
    };
  }

  // REGISTER USER
  static async registerUser(credentials: UserRegisterRequest): Promise<void> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/users/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      },
    );
    const data: ApiResponse = await res.json();

    if (!res.ok || !data.success)
      throw new Error(data.message || 'Registration failed');
  }

  // REGISTER NGO
  static async registerNgo(credentials: NGORegisterRequest): Promise<void> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/ngos/register`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      },
    );
    const data: ApiResponse = await res.json();

    if (!res.ok || !data.success)
      throw new Error(data.message || 'Registration failed');
  }

  // LOG OUT
  static async logout(refreshToken: string): Promise<void> {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/logout`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        },
      );
      const data: ApiResponse = await res.json();

      if (!res.ok || !data.success) {
        console.error('Logout error:', data.message);
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  // REFRESH TOKEN
  static async refreshTokenFunction(refreshToken: string): Promise<AuthTokens> {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/refresh`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      },
    );
    const data: ApiResponse<AuthTokens> = await res.json();

    if (!res.ok || !data.success || !data.data) {
      throw new Error(data.message || 'Token refresh failed');
    }

    return data.data;
  }

  // AUTHENTICATED API CALL WITH AUTO TOKEN REFRESH
  static async authenticatedFetch(
    url: string,
    options: RequestInit = {},
    accessToken: string,
    refreshToken: string,
    onTokenRefresh: (tokens: AuthTokens) => void,
  ): Promise<Response> {
    // REQUEST WITH CURRENT TOKEN
    let res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
        ...options.headers,
      },
    });

    // IF UNAUTHORIZED TRY TO REFRESH TOKEN
    if (res.status === 401) {
      try {
        const newTokens = await this.refreshTokenFunction(refreshToken);
        onTokenRefresh(newTokens);

        // RETRY REQUEST WITH NEW TOKEN
        res = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${newTokens.accessToken}`, // <-- Use NEW token!
            ...options.headers,
          },
        });
      } catch (error) {
        // REFRESH FAILED
        // RETURN ORIGINAL 401
        console.error('Token refresh failed:', error);
      }
    }
    return res;
  }
}
