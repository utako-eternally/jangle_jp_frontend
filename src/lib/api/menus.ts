// src/lib/api/menus.ts
import apiClient from './client';
import {
  ApiResponse,
  MenusResponse,
  MenuResponse,
  CreateMenuRequest,
  UpdateMenuRequest,
} from '@/types/api';

/**
 * 店舗のメニュー一覧を取得
 */
export const getShopMenus = async (
  shopId: number
): Promise<ApiResponse<MenusResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/menus`);
  return response.data;
};

/**
 * 特定メニューの詳細を取得
 */
export const getShopMenu = async (
  shopId: number,
  menuId: number
): Promise<ApiResponse<MenuResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/menus/${menuId}`);
  return response.data;
};

/**
 * 新しいメニューを作成
 */
export const createShopMenu = async (
  shopId: number,
  data: CreateMenuRequest
): Promise<ApiResponse<MenuResponse>> => {
  console.log('[createShopMenu] リクエスト:', { shopId, data });
  try {
    const response = await apiClient.post(`/shops/${shopId}/menus`, data);
    console.log('[createShopMenu] レスポンス:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[createShopMenu] エラー:', error);
    console.error('[createShopMenu] エラー詳細:', error.response?.data);
    throw error;
  }
};

/**
 * メニューを更新
 */
export const updateShopMenu = async (
  shopId: number,
  menuId: number,
  data: UpdateMenuRequest
): Promise<ApiResponse<MenuResponse>> => {
  console.log('[updateShopMenu] リクエスト:', { shopId, menuId, data });
  try {
    const response = await apiClient.post(`/shops/${shopId}/menus/${menuId}/update`, data);
    console.log('[updateShopMenu] レスポンス:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('[updateShopMenu] エラー:', error);
    console.error('[updateShopMenu] エラー詳細:', error.response?.data);
    throw error;
  }
};

/**
 * メニューを削除
 */
export const deleteShopMenu = async (
  shopId: number,
  menuId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/shops/${shopId}/menus/${menuId}/delete`);
  return response.data;
};

/**
 * 利用可能なカテゴリ一覧を取得
 */
export const getMenuCategories = async (): Promise<ApiResponse<{ categories: { [key: string]: string } }>> => {
  const response = await apiClient.get('/menus/categories');
  return response.data;
};