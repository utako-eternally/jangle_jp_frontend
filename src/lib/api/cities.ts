// src/lib/api/cities.ts
import apiClient from './client';
import type { 
  ApiResponse,
  CityDetailResponse,
  CityShopsParams,
  CityStationsResponse,
  PaginatedResponse,
} from '@/types/api';
import type { Shop } from '@/types/models';

/**
 * 市区町村詳細を取得
 */
export const getCity = async (
  prefectureSlug: string,
  citySlug: string
): Promise<CityDetailResponse> => {
  const response = await apiClient.get<ApiResponse<CityDetailResponse>>(
    `/cities/${prefectureSlug}/${citySlug}`
  );
  if (!response.data.data) {
    throw new Error('City not found');
  }
  return response.data.data;
};

/**
 * 市区町村内の駅一覧を取得
 */
export const getCityStations = async (
  prefectureSlug: string,
  citySlug: string,
  params?: {
    limit?: number;
    sort_by?: 'shop_count' | 'name_kana';
  }
): Promise<CityStationsResponse> => {
  const response = await apiClient.get<CityStationsResponse>(
    `/cities/${prefectureSlug}/${citySlug}/stations`,
    { params }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch stations');
  }
  return response.data;
};

/**
 * 市区町村内の店舗一覧を取得
 */
export const getCityShops = async (
  prefectureSlug: string,
  citySlug: string,
  params?: CityShopsParams
): Promise<PaginatedResponse<Shop>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<Shop>>>(
    `/cities/${prefectureSlug}/${citySlug}/shops`,
    params || {}
  );
  if (!response.data.data) {
    throw new Error('Shops not found');
  }
  return response.data.data;
};