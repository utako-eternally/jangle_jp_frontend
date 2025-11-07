// src/lib/api/stations.ts
import apiClient from './client';
import {
  ApiResponse,
  NearbyStationsParams,
  NearbyStationsByAddressParams,
  StationSearchParams,
  NearbyStationsResponse, 
  ShopStationsResponse,
  UpdateShopStationsRequest,
  StationDetailResponse,
  StationShopsParams,
  PaginatedResponse,
} from '@/types/api';
import { StationInfo, GroupedStationInfo, Shop } from '@/types/models';

// ========================================
// 駅検索API（既存）
// ========================================

/**
 * 座標から近隣駅を検索（グループ化済み）
 */
export const getNearbyStations = async (
  params: NearbyStationsParams
): Promise<ApiResponse<GroupedStationInfo[]>> => {
  const response = await apiClient.post('/stations/nearby', params);
  return response.data;
};

/**
 * 住所から近隣駅を検索（グループ化済み）
 */
export const getNearbyStationsByAddress = async (
  params: NearbyStationsByAddressParams
): Promise<ApiResponse<GroupedStationInfo[]>> => {
  const response = await apiClient.post('/stations/nearby-by-address', params);
  return response.data;
};

/**
 * 駅名で検索（グループ化済み）
 */
export const searchStationsByName = async (
  params: StationSearchParams
): Promise<ApiResponse<GroupedStationInfo[]>> => {
  const response = await apiClient.post('/stations/search', params);
  return response.data;
};

// ========================================
// 店舗の駅情報管理（既存）
// ========================================

/**
 * 店舗の駅情報を取得
 */
export const getShopStations = async (
  shopId: number
): Promise<ApiResponse<ShopStationsResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/stations`);
  return response.data;
};

/**
 * 店舗の駅情報を更新
 */
export const updateShopStations = async (
  shopId: number,
  data: UpdateShopStationsRequest
): Promise<ApiResponse<{ stations_count: number; message: string }>> => {
  const response = await apiClient.post(`/shops/${shopId}/stations/update`, data);
  return response.data;
};

// ========================================
// ポータルサイト用API（新規追加）
// ========================================

/**
 * 駅詳細を取得（ポータルサイト用）
 */
export const getStation = async (
  prefectureSlug: string,
  stationSlug: string
): Promise<StationDetailResponse> => {
  const response = await apiClient.get<ApiResponse<StationDetailResponse>>(
    `/stations/${prefectureSlug}/${stationSlug}`
  );
  if (!response.data.data) {
    throw new Error('Station not found');
  }
  return response.data.data;
};

/**
 * 駅周辺の店舗一覧を取得（ポータルサイト用）
 */
export const getStationShops = async (
  prefectureSlug: string,
  stationSlug: string,
  params?: StationShopsParams
): Promise<ApiResponse<PaginatedResponse<Shop>>> => {
  const response = await apiClient.post<ApiResponse<PaginatedResponse<Shop>>>(
    `/stations/${prefectureSlug}/${stationSlug}/shops`,
    params || {}
  );
  return response.data;
};

/**
 * 周辺の駅一覧を取得（ポータルサイト用）
 */
export const getStationNearby = async (
  prefectureSlug: string,
  stationSlug: string,
  params?: {
    limit?: number;
    max_distance_km?: number;
  }
): Promise<NearbyStationsResponse> => {
  const response = await apiClient.get<NearbyStationsResponse>(
    `/stations/${prefectureSlug}/${stationSlug}/nearby`,
    { params }
  );
  if (!response.data.success) {
    throw new Error(response.data.message || 'Failed to fetch nearby stations');
  }
  return response.data;
};

/**
 * 路線名を整形して取得（ポータルサイト用）
 */
export function getLineNames(station: StationDetailResponse): string {
  if (station.type === 'group') {
    // グループ駅の場合、複数路線を取得
    const lines = station.lines.map(line => line.line_name);
    // 重複を削除
    const uniqueLines = Array.from(new Set(lines));
    return uniqueLines.join(' / ');
  } else {
    // 単一駅の場合
    return station.line.line_name;
  }
}