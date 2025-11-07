// src/lib/api/features.ts
import apiClient from './client';
import {
  ApiResponse,
  ShopFeaturesResponse,
  AvailableFeaturesResponse,
  UpdateShopFeaturesRequest,
} from '@/types/api';

/**
 * 店舗の特徴一覧を取得
 */
export const getShopFeatures = async (
  shopId: number
): Promise<ApiResponse<ShopFeaturesResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/features`);
  return response.data;
};

/**
 * 店舗の特徴を更新（一括設定）
 */
export const updateShopFeatures = async (
  shopId: number,
  data: UpdateShopFeaturesRequest
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/shops/${shopId}/features/update`, data);
  return response.data;
};

/**
 * 利用可能な全特徴の定義を取得
 */
export const getAvailableFeatures = async (): Promise<ApiResponse<AvailableFeaturesResponse>> => {
  const response = await apiClient.get('/features/available');
  return response.data;
};