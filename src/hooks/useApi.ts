'use client';

import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type ApiError = Error & {
  status?: number;
  data?: unknown;
};

const getErrorMessage = (error: unknown) => {
  return error instanceof Error ? error.message : String(error);
};

const getResponseMessage = (responseData: unknown, fallback: string) => {
  if (responseData && typeof responseData === 'object') {
    const record = responseData as Record<string, unknown>;
    return String(record.message || record.error || fallback);
  }

  return fallback;
};

/**
 * Hook untuk API calls dengan automatic token handling dan companyId.
 */
export function useApi() {
  const { token, logout, user } = useAuth();

  const buildUrl = useCallback((endpoint: string, method: HttpMethod) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const companyId = user?.companyId || '1';
    let url = `${baseUrl}${endpoint}`;

    if (method === 'GET') {
      const separator = url.includes('?') ? '&' : '?';
      url += `${separator}companyId=${companyId}`;
    }

    return url;
  }, [user]);

  const request = useCallback(
    async (
      method: HttpMethod,
      endpoint: string,
      data?: unknown,
      options?: { throwOnHttpError?: boolean }
    ) => {
      if (!token) {
        throw new Error('No token found');
      }

      const companyId = user?.companyId || '1';
      const url = buildUrl(endpoint, method);
      const requestData = method === 'GET' || !data
        ? undefined
        : data && typeof data === 'object' && !Array.isArray(data)
          ? { ...(data as Record<string, unknown>), companyId }
          : data;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: requestData ? JSON.stringify(requestData) : undefined
      });

      if (response.status === 401) {
        logout();
        throw new Error('Unauthorized');
      }

      const contentType = response.headers.get('content-type') || '';
      const responseData = contentType.includes('application/json')
        ? await response.json()
        : { success: false, message: await response.text() };

      if (!response.ok && options?.throwOnHttpError) {
        const message = getResponseMessage(responseData, response.statusText);
        const error = new Error(String(message)) as ApiError;
        error.status = response.status;
        error.data = responseData;
        throw error;
      }

      return responseData;
    },
    [token, logout, user, buildUrl]
  );

  const call = useCallback(
    async (method: HttpMethod, endpoint: string, data?: unknown) => {
      try {
        return await request(method, endpoint, data);
      } catch (error: unknown) {
        console.error('API call error:', getErrorMessage(error));
        throw error;
      }
    },
    [request]
  );

  const callWithFallback = useCallback(
    async (method: HttpMethod, endpoints: string[], data?: unknown) => {
      let lastError: ApiError | null = null;

      for (const endpoint of endpoints) {
        try {
          return await request(method, endpoint, data, { throwOnHttpError: true });
        } catch (error: unknown) {
          lastError = error as ApiError;

          if (lastError?.status && ![404, 405].includes(lastError.status)) {
            throw error;
          }
        }
      }

      throw lastError || new Error('No backend endpoint matched');
    },
    [request]
  );

  return { call, callWithFallback };
}
