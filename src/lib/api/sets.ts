// src/lib/api/sets.ts
import apiClient from './client';
import {
  ApiResponse,
  ShopSetResponse,
  SetResponse,
  CreateSetRequest,
  UpdateSetRequest,
} from '@/types/api';

/**
 * 店舗のセット設定を取得
 */
export const getShopSet = async (
  shopId: number
): Promise<ApiResponse<ShopSetResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/set`);
  return response.data;
};

/**
 * セット設定を作成
 */
export const createShopSet = async (
  shopId: number,
  data: CreateSetRequest
): Promise<ApiResponse<SetResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/set`, data);
  return response.data;
};

/**
 * セット設定を更新
 */
export const updateShopSet = async (
  shopId: number,
  data: UpdateSetRequest
): Promise<ApiResponse<SetResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/set/update`, data);
  return response.data;
};

/**
 * セット設定を削除
 */
export const deleteShopSet = async (
  shopId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/shops/${shopId}/set/delete`);
  return response.data;
};