// src/lib/api/frees.ts
import apiClient from './client';
import {
  ApiResponse,
  FreesResponse,
  FreeResponse,
  CreateFreeRequest,
  UpdateFreeRequest,
} from '@/types/api';

/**
 * 店舗のフリー設定一覧を取得
 */
export const getShopFrees = async (
  shopId: number
): Promise<ApiResponse<FreesResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/frees`);
  return response.data;
};

/**
 * 特定フリー設定の詳細を取得
 */
export const getShopFree = async (
  shopId: number,
  freeId: number
): Promise<ApiResponse<FreeResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/frees/${freeId}`);
  return response.data;
};

/**
 * 新しいフリー設定を作成
 */
export const createShopFree = async (
  shopId: number,
  data: CreateFreeRequest
): Promise<ApiResponse<FreeResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/frees`, data);
  return response.data;
};

/**
 * フリー設定を更新
 */
export const updateShopFree = async (
  shopId: number,
  freeId: number,
  data: UpdateFreeRequest
): Promise<ApiResponse<FreeResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/frees/${freeId}/update`, data);
  return response.data;
};

/**
 * フリー設定を削除
 */
export const deleteShopFree = async (
  shopId: number,
  freeId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/shops/${shopId}/frees/${freeId}/delete`);
  return response.data;
};

/**
 * 利用可能なゲーム形式一覧を取得
 */
export const getGameFormats = async (): Promise<ApiResponse<{ game_formats: { [key: string]: string } }>> => {
  const response = await apiClient.get('/frees/game-formats');
  return response.data;
};