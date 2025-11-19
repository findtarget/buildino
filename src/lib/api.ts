// src/lib/api.ts
import axios, { AxiosInstance, AxiosError, AxiosResponse } from 'axios';

// تایپ‌های TypeScript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  status?: number;
}

interface RefreshTokenResponse {
  success: boolean;
  accessToken?: string;
  error?: string;
}

// تابع برای تشخیص محیط و تنظیم base URL
const getBaseURL = (): string => {
  if (typeof window !== 'undefined') {
    return '/api';
  }
  return process.env.NEXTAUTH_URL
    ? `${process.env.NEXTAUTH_URL}/api`
    : 'http://localhost:3000/api';
};

// ایجاد instance اصلی axios
const api: AxiosInstance = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  withCredentials: true, // برای ارسال cookies
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: { resolve: (value?: any) => void; reject: (reason?: any) => void; config: any }[] = [];

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      // For successful refresh, we resolve with the original request config
      // so it can be retried by the caller.
      prom.resolve(api(prom.config));
    }
  });
  failedQueue = [];
};

// --- تابع برای استانداردسازی خروجی API ---
function normalizeResponse<T>(raw: any): ApiResponse<T> {
  if (raw && typeof raw.success !== 'undefined') return raw;
  return { success: true, data: raw };
}

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() };
    }
    console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`);
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as any;
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    console.error(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${originalRequest?.url} - ${error.response?.status}`);

    if (error.response?.status === 401 && !originalRequest._retry) {
      // جلوگیری از حلقه در صفحه لاگین
      if (currentPath === '/login') {
        console.warn('⚠️ 401 دریافت شد در صفحه لاگین - ری‌دایرکت انجام نمی‌شود.');
        return Promise.reject(error);
      }

      // اگر درخواست برای refresh باشد
      if (originalRequest.url?.includes('/auth/refresh')) {
        if (typeof window !== 'undefined' && currentPath !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }

      // اگر در حال refresh کردن هستیم
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject, config: originalRequest });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log('🔄 Attempting to refresh token...');
        const refreshUrl = typeof window !== 'undefined'
          ? '/api/auth/refresh'
          : `${getBaseURL()}/auth/refresh`;

        const refreshResponse = await fetch(refreshUrl, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });

        const refreshData: RefreshTokenResponse = await refreshResponse.json();

        if (refreshData.success && refreshData.accessToken) {
          console.log('✅ Token refreshed successfully');
          processQueue(null);
          return api(originalRequest);
        } else {
          console.warn('⚠️ No refresh token - session expired.');
          throw new Error(refreshData.error || 'Token refresh failed');
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(refreshError);

        // فقط ری‌دایرکت کن اگر الان روی لاگین نیستیم
        if (typeof window !== 'undefined' && currentPath !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

// --- متدهای کمکی API Helpers ---
export const apiHelpers = {
  get: async <T = any>(url: string, params?: object): Promise<ApiResponse<T>> => {
    try {
      const response = await api.get(url, { params });
      return normalizeResponse<T>(response.data);
    } catch (error) {
      return apiHelpers.handleError(error) as ApiResponse<T>;
    }
  },

  post: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.post(url, data);
      return normalizeResponse<T>(response.data);
    } catch (error) {
      return apiHelpers.handleError(error) as ApiResponse<T>;
    }
  },

  put: async <T = any>(url: string, data?: any): Promise<ApiResponse<T>> => {
    try {
      const response = await api.put(url, data);
      return normalizeResponse<T>(response.data);
    } catch (error) {
      return apiHelpers.handleError(error) as ApiResponse<T>;
    }
  },

  delete: async <T = any>(url: string): Promise<ApiResponse<T>> => {
    try {
      const response = await api.delete(url);
      return normalizeResponse<T>(response.data);
    } catch (error) {
      return apiHelpers.handleError(error) as ApiResponse<T>;
    }
  },

  handleError: (error: unknown): ApiResponse<never> => {
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error ||
                      error.response?.data?.message ||
                      error.message ||
                      'خطای ناشناخته';
      return { success: false, error: message, status: error.response?.status };
    }
    return { success: false, error: 'خطای ناشناخته', status: 500 };
  },

  checkAuth: async () => {
    try {
      // فقط در صفحات محافظت‌شده اجرا کن
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        return { success: false, error: 'در صفحه لاگین نیازی به بررسی نیست' };
      }
      const response = await api.get('/users/me');
      return normalizeResponse(response.data);
    } catch {
      return { success: false, error: 'احراز هویت ناموفق' };
    }
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
      if (typeof window !== 'undefined') window.location.href = '/login';
    } catch (error) {
      console.error('Logout error:', error);
      if (typeof window !== 'undefined') window.location.href = '/login';
    }
  }
};

export default api;
