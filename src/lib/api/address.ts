// src/lib/api/address.ts
import apiClient from './client';
import {
  ApiResponse,
  PostalCodeRequest,
  PostalCodeResponse,
  NormalizeAddressRequest,
  NormalizeAddressResponse,
  ProcessAddressRequest,
  ProcessAddressResponse,
  GeocodeRequest,
  GeocodeResponse,
} from '@/types/api';

/**
 * 郵便番号から住所を取得
 */
export const getAddressByPostalCode = async (
  data: PostalCodeRequest
): Promise<ApiResponse<PostalCodeResponse[]>> => {
  const response = await apiClient.post('/address/postal-code', data);
  return response.data;
};

/**
 * 住所を正規化
 */
export const normalizeAddress = async (
  data: NormalizeAddressRequest
): Promise<ApiResponse<NormalizeAddressResponse>> => {
  const response = await apiClient.post('/address/normalize', data);
  return response.data;
};

/**
 * 郵便番号 + 詳細住所の複合処理
 */
export const processFullAddress = async (
  data: ProcessAddressRequest
): Promise<ApiResponse<ProcessAddressResponse>> => {
  const response = await apiClient.post('/address/process', data);
  return response.data;
};

/**
 * Google Maps Geocoding APIで座標を取得
 */
export const geocodeAddress = async (
  data: GeocodeRequest
): Promise<ApiResponse<GeocodeResponse>> => {
  const response = await apiClient.post('/address/geocode', data);
  return response.data;
};

/**
 * Node.js APIのヘルスチェック
 */
export const checkAddressApiHealth = async (): Promise<ApiResponse<{ status: string }>> => {
  const response = await apiClient.get('/address/health');
  return response.data;
};