import {
  getAuthHeader,
  getRefreshToken,
  setAuthToken,
  setRefreshToken,
  clearAuth
} from '@/utils/auth';

// API 기본 설정
const DEFAULT_API_BASE_URL = 'http://localhost:8080/api';

const getApiBaseUrl = (): string => {
  const viteEnv =
    typeof import.meta !== 'undefined'
      ? ((import.meta as unknown as { env?: Record<string, string> }).env ?? null)
      : null;

  if (viteEnv?.VITE_API_URL) {
    return viteEnv.VITE_API_URL;
  }

  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }

  if (typeof process !== 'undefined' && process.env?.VITE_API_URL) {
    return process.env.VITE_API_URL;
  }

  return DEFAULT_API_BASE_URL;
};

const API_BASE_URL = getApiBaseUrl();

export class ApiClient {
  private baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async refreshAccessToken(): Promise<void> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      throw new Error('No refresh token available');
    }

    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearAuth();
      if (typeof window !== 'undefined') {
        window.location.href = '/sign-in';
      }
      throw new Error('Token refresh failed');
    }

    const data = await response.json();
    setAuthToken(data.accessToken);
    setRefreshToken(data.refreshToken);
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeader(),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized - attempt to refresh token
      if (response.status === 401 && !endpoint.includes('/auth/refresh')) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.refreshPromise = this.refreshAccessToken()
            .finally(() => {
              this.isRefreshing = false;
              this.refreshPromise = null;
            });
        }

        if (this.refreshPromise) {
          await this.refreshPromise;
          // Retry original request with new token
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              ...getAuthHeader(),
            },
          };
          const retryResponse = await fetch(url, retryConfig);

          if (!retryResponse.ok) {
            throw new Error(`HTTP error! status: ${retryResponse.status}`);
          }

          return await retryResponse.json();
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put<T>(endpoint: string, data: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
