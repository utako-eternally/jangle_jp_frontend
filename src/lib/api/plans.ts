// src/lib/api/plans.ts
import apiClient from './client';
import {
  ApiResponse,
  ShopPlanResponse,
  ShopPlanHistoryItem,
  ShopPlanPaymentHistoryItem,
  StartPaidPlanRequest,
  StartPaidPlanResponse,
  CancelPlanResponse,
} from '@/types/api';

/**
 * 店舗の現在のプラン情報を取得
 */
export const getCurrentPlan = async (
  shopId: number
): Promise<ApiResponse<ShopPlanResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/plan`);
  return response.data;
};

/**
 * 店舗のプラン履歴を取得
 */
export const getPlanHistory = async (
  shopId: number
): Promise<ApiResponse<ShopPlanHistoryItem[]>> => {
  const response = await apiClient.get(`/shops/${shopId}/plan/history`);
  return response.data;
};

/**
 * 店舗の支払い履歴を取得
 */
export const getPaymentHistory = async (
  shopId: number
): Promise<ApiResponse<ShopPlanPaymentHistoryItem[]>> => {
  const response = await apiClient.get(`/shops/${shopId}/plan/payments`);
  return response.data;
};

/**
 * 有料プランを開始
 */
export const startPaidPlan = async (
  shopId: number,
  data: StartPaidPlanRequest
): Promise<ApiResponse<StartPaidPlanResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/plan/start-paid`, data);
  return response.data;
};

/**
 * プランをキャンセル
 */
export const cancelPlan = async (
  shopId: number
): Promise<ApiResponse<CancelPlanResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/plan/cancel`);
  return response.data;
};