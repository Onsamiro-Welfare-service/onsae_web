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
  private _baseURL: string;
  private isRefreshing = false;
  private refreshPromise: Promise<void> | null = null;

  constructor(baseURL: string = API_BASE_URL) {
    this._baseURL = baseURL;
  }

  /**
   * Getter for baseURL - provides read-only access to the base URL
   */
  get baseURL(): string {
    return this._baseURL;
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

    const response = await fetch(`${this._baseURL}/auth/refresh`, {
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

  private async request<T>(endpoint: string, options: RequestInit & { skipAuth?: boolean } = {}): Promise<T> {
    const url = `${this._baseURL}${endpoint}`;
    console.log('url', url);
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    const { skipAuth, ...fetchOptions } = options;
    const baseHeaders: Record<string, string> = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Accept: 'application/json',
      ...(skipAuth ? {} : getAuthHeader()),
    };
    const config: RequestInit = {
      ...fetchOptions,
      headers: {
        ...baseHeaders,
        ...(fetchOptions.headers as Record<string, string>),
      },
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
            // Try to extract server error message
            let message = `HTTP error! status: ${retryResponse.status}`;
            try {
              const ct = retryResponse.headers.get('content-type') || '';
              if (ct.includes('application/json')) {
                const errJson = await retryResponse.json();
                message = errJson?.message || message;
              } else {
                const text = await retryResponse.text();
                if (text) message = text;
              }
            } catch {}
            throw new Error(message);
          }

          const ct = retryResponse.headers.get('content-type') || '';
          if (retryResponse.status === 204 || ct.indexOf('application/json') === -1) {
            return undefined as unknown as T;
          }
          return (await retryResponse.json()) as T;
        }
      }

      // Some backends return 403 for expired/invalid access tokens.
      // Attempt a one-time refresh and retry, mirroring the 401 flow.
      // Skip this for public endpoints (skipAuth: true)
      if (response.status === 403 && !endpoint.includes('/auth/refresh') && !skipAuth) {
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
          const retryConfig: RequestInit = {
            ...config,
            headers: {
              ...config.headers,
              ...getAuthHeader(),
            },
          };
          const retryResponse = await fetch(url, retryConfig);

          if (!retryResponse.ok) {
            let message = `HTTP error! status: ${retryResponse.status}`;
            try {
              const ct = retryResponse.headers.get('content-type') || '';
              if (ct.includes('application/json')) {
                const errJson = await retryResponse.json();
                message = errJson?.message || message;
              } else {
                const text = await retryResponse.text();
                if (text) message = text;
              }
            } catch {}
            throw new Error(message);
          }

          const ct = retryResponse.headers.get('content-type') || '';
          if (retryResponse.status === 204 || ct.indexOf('application/json') === -1) {
            return undefined as unknown as T;
          }
          return (await retryResponse.json()) as T;
        }
      }
      console.log('response.ok',response.ok);
      if (!response.ok) {
        // Propagate server error message when available
        let message = `HTTP error! status: ${response.status}`;
        try {
          const ct = response.headers.get('content-type') || '';
          if (ct.includes('application/json')) {
            const errJson = await response.json();
            message = errJson?.message || message;
          } else {
            const text = await response.text();
            if (text) message = text;
          }
        } catch {}
        throw new Error(message);
      }
      const contentType = response.headers.get('content-type') || '';
      if (response.status === 204 || contentType.indexOf('application/json') === -1) {
        // No content or non-JSON; return undefined as T
        return undefined as unknown as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', skipAuth });
  }

  async post<T>(endpoint: string, data: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth,
    });
  }

  async put<T>(endpoint: string, data: unknown, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
      skipAuth,
    });
  }

  async delete<T>(endpoint: string, skipAuth?: boolean): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', skipAuth });
  }
}

export const apiClient = new ApiClient();
