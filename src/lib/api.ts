// src/lib/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';

// آدرس پایه API شما. در محیط کلاینت، فقط از /api استفاده می‌کنیم چون روی همان دامنه است.
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// تعریف نوع داده خروجی استاندارد ما
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  status: number | null;
}

// اضافه کردن یک Interceptor برای مدیریت پاسخ‌ها
api.interceptors.response.use(
  // در صورت موفقیت آمیز بودن پاسخ (status 2xx)
  (response: AxiosResponse): ApiResponse => {
    // پاسخ موفقیت‌آمیز را به فرمت استاندارد تبدیل می‌کنیم
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  },
  // در صورت بروز خطا در پاسخ (status غیر 2xx)
  (error: AxiosError): ApiResponse => { // <-- تغییر: دیگر Promise برنمی‌گردانیم، مستقیم شیء را برمی‌گردانیم
    console.error("API Interceptor Error:", error);
    
    // اگر سرور پاسخی با خطا برگرداند (مثلا خطای ولیدیشن)
    if (error.response) {
      const responseData = error.response.data as { error?: string };
      return { // <-- تغییر: به جای reject، یک شیء resolve شده برمی‌گردانیم
        success: false,
        error: responseData.error || 'خطایی در سرور رخ داده است',
        status: error.response.status,
      };
    } 
    // اگر خطای شبکه یا خطای دیگری رخ دهد
    else if (error.request) {
      return { // <-- تغییر
        success: false,
        error: 'پاسخی از سرور دریافت نشد. لطفاً اتصال اینترنت خود را بررسی کنید.',
        status: null,
      };
    } 
    // خطاهای دیگر
    else {
      return { // <-- تغییر
        success: false,
        error: error.message,
        status: null,
      };
    }
  }
);

// حالا باید نوع خروجی متدهای axios را هم اصلاح کنیم
// این بخش پیشرفته است اما برای type safety کامل ضروری است.
// اگر این بخش باعث سردرگمی شد، می‌توانید آن را حذف کنید و تایپ‌اسکریپت را با as any نادیده بگیرید.
declare module 'axios' {
  export interface AxiosInstance {
    request<T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>>;
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    head<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    options<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>>;
  }
}

export default api;
