import { useState, useCallback } from 'react';
import { AuthService } from '@/lib/auth-service';
import { useAuth } from '@/contexts/AuthContext';

interface UseApiOptions {
  onError?: (error: Error) => void;
  onSuccess?: (data: unknown) => void;
}

export function useApi(options: UseApiOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { tokens } = useAuth();

  const request = useCallback(
    async (url: string, requestOptions: RequestInit = {}) => {
      if (!tokens) {
        throw new Error('No authentication tokens available');
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await AuthService.authenticatedFetch(
          url,
          requestOptions,
          tokens.accessToken,
          tokens.refreshToken,
          (_newTokens) => {
            void _newTokens;
            // TOKEN REFRESH IS HANDLES BY THE CONTEXTS AUTO REFREASH
            console.log('Tokens refreshed during API call');
          },
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        options.onSuccess?.(data);
        return data;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        options.onError?.(error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [tokens, options],
  );

  return { request, isLoading, error };
}
