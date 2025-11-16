// src/lib/api/prefectures.ts
import apiClient from './client';
import type { 
  ApiResponse,
  PrefectureListResponse,
  PrefectureDetailResponse,
  PrefectureStationsResponse,
  PrefectureCitiesResponse,
  PaginatedResponse,
} from '@/types/api';
import type { Shop } from '@/types/models';

/**
 * 都道府県一覧を取得
 */
export const getPrefectures = async (): Promise<PrefectureListResponse[]> => {
  const response = await apiClient.get<ApiResponse<PrefectureListResponse[]>>('/prefectures');
  return response.data.data || [];
};

/**
 * 都道府県詳細を取得
 */
export const getPrefecture = async (slug: string): Promise<PrefectureDetailResponse> => {
  const response = await apiClient.get<ApiResponse<PrefectureDetailResponse>>(`/prefectures/${slug}`);
  if (!response.data.data) {
    throw new Error('Prefecture not found');
  }
  return response.data.data;
};

/**
 * 都道府県内の駅一覧を取得
 */
export const getPrefectureStations = async (
  slug: string,
  params?: { limit?: number }
): Promise<PrefectureStationsResponse[]> => {
  const response = await apiClient.get<ApiResponse<PrefectureStationsListResponse>>(
    `/prefectures/${slug}/stations`,
    { params }
  );
  // レスポンス形式変更に対応
  return response.data.data?.stations || [];
};

export interface PrefectureStationsListResponse {
  prefecture: {
    id: number;
    name: string;
    name_kana: string;
    slug: string;
  };
  stations: PrefectureStationsResponse[];
  total: number;
}

/**
 * 都道府県内の市区町村一覧を取得
 */
export const getPrefectureCities = async (slug: string): Promise<PrefectureCitiesResponse[]> => {
  const response = await apiClient.get<ApiResponse<PrefectureCitiesResponse[]>>(
    `/prefectures/${slug}/cities`
  );
  return response.data.data || [];
};

/**
 * 都道府県内の店舗一覧を取得
 */
export const getPrefectureShops = async (
  slug: string,
  params?: PrefectureShopsParams
): Promise<PaginatedResponse<Shop>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<Shop>>>(
    `/prefectures/${slug}/shops`,
    params || {}
  );
  if (!response.data.data) {
    throw new Error('Shops not found');
  }
  return response.data.data;
};