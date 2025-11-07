// src/lib/api/services.ts
import apiClient from './client';
import {
  ApiResponse,
  ShopServicesResponse,
  AvailableServicesResponse,
  UpdateShopServicesRequest,
} from '@/types/api';

/**
 * 店舗のサービス一覧を取得
 */
export const getShopServices = async (
  shopId: number
): Promise<ApiResponse<ShopServicesResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/services`);
  return response.data;
};

/**
 * 店舗のサービスを更新（一括設定）
 */
export const updateShopServices = async (
  shopId: number,
  data: UpdateShopServicesRequest
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/shops/${shopId}/services/update`, data);
  return response.data;
};

/**
 * 利用可能な全サービスの定義を取得
 */
export const getAvailableServices = async (): Promise<ApiResponse<AvailableServicesResponse>> => {
  const response = await apiClient.get('/services/available');
  return response.data;
};