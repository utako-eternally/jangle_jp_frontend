// src/lib/api/client.ts
import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { ApiErrorResponse } from '@/types/api';

// APIベースURL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// axiosインスタンス作成
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 30000, // 30秒
});

// リクエストインターセプター（トークンを自動付与）
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 'auth_token' → 'token' に変更
    const token = localStorage.getItem('token');
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター（エラーハンドリング）
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<ApiErrorResponse>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token'); // 'auth_token' → 'token'
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    if (error.response?.status === 403) {
      const message = error.response.data?.message;
      
      if (message?.includes('有料プラン限定')) {
        console.error('有料プラン限定の機能です:', message);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;