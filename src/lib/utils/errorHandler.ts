// src/lib/utils/errorHandler.ts
import { AxiosError } from 'axios';
import { ApiErrorResponse } from '@/types/api';

/**
 * APIエラーからメッセージを抽出
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    // レスポンスにメッセージがある場合
    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message;
    }
    
    // ステータスコード別のデフォルトメッセージ
    switch (axiosError.response?.status) {
      case 400:
        return 'リクエストが不正です';
      case 401:
        return '認証エラーです。再度ログインしてください';
      case 403:
        return 'この操作を行う権限がありません';
      case 404:
        return 'データが見つかりません';
      case 422:
        return '入力内容に誤りがあります';
      case 500:
        return 'サーバーエラーが発生しました';
      default:
        return 'エラーが発生しました';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'エラーが発生しました';
};

/**
 * バリデーションエラーを抽出
 */
export const getValidationErrors = (error: unknown): Record<string, string[]> | null => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    
    if (axiosError.response?.data?.errors) {
      return axiosError.response.data.errors;
    }
  }
  
  return null;
};

/**
 * エラーが有料プラン制限エラーかチェック
 */
export const isPaidPlanError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    const axiosError = error as AxiosError<ApiErrorResponse>;
    const message = axiosError.response?.data?.message;
    
    return message?.includes('有料プラン限定') || false;
  }
  
  return false;
};

/**
 * エラーが認証エラーかチェック
 */
export const isAuthError = (error: unknown): boolean => {
  if (error instanceof AxiosError) {
    return error.response?.status === 401;
  }
  
  return false;
};