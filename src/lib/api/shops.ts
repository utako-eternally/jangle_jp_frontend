// src/lib/api/shops.ts
import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  ShopListParams,
  CreateShopRequest,
  UpdateShopRequest,
  UploadMainImageResponse,
  AddGalleryImageResponse,
  ReorderGalleryImagesRequest,
  UpdateLineInfoRequest,
  UpdateLineInfoResponse,
  UploadLineQrCodeResponse,
  ShopStationsResponse,
  UpdateShopStationsRequest,
} from '@/types/api';
import { Shop, ShopImage } from '@/types/models';

// ========================================
// 公開API（認証不要）
// ========================================

/**
 * 店舗一覧を取得（公開）
 */
export const getShops = async (
  params?: ShopListParams
): Promise<ApiResponse<PaginatedResponse<Shop>>> => {
  const response = await apiClient.get('/shops', { params });
  return response.data;
};

/**
 * 店舗詳細を取得（公開）
 */
export const getShop = async (
  shopId: number
): Promise<ApiResponse<Shop>> => {
  const response = await apiClient.get(`/shops/${shopId}`);
  return response.data;
};

/**
 * 店舗のギャラリー画像一覧を取得（公開）
 */
export const getShopGalleryImages = async (
  shopId: number
): Promise<ApiResponse<ShopImage[]>> => {
  const response = await apiClient.get(`/shops/${shopId}/gallery-images`);
  return response.data;
};

/**
 * 店舗のLINE情報を取得（公開）
 */
export const getShopLineInfo = async (
  shopId: number
): Promise<ApiResponse<any>> => {
  const response = await apiClient.get(`/shops/${shopId}/line-info`);
  return response.data;
};

// ========================================
// オーナー専用API（認証必要）
// ========================================

/**
 * 自分の店舗一覧を取得
 */
export const getMyShops = async (
  params?: ShopListParams
): Promise<ApiResponse<PaginatedResponse<Shop>>> => {
  const response = await apiClient.get('/my-shops', { params });
  return response.data;
};

/**
 * 自分の店舗詳細を取得
 */
export const getMyShop = async (
  shopId: number
): Promise<ApiResponse<Shop>> => {
  const response = await apiClient.get(`/my-shops/${shopId}`);
  return response.data;
};

/**
 * 店舗を作成
 */
export const createMyShop = async (
  data: FormData | CreateShopRequest
): Promise<ApiResponse<Shop>> => {
  const headers = data instanceof FormData
    ? { 'Content-Type': 'multipart/form-data' }
    : undefined;

  const response = await apiClient.post('/my-shops', data, { headers });
  return response.data;
};

/**
 * 店舗を更新
 */
export const updateMyShop = async (
  shopId: number,
  data: FormData | UpdateShopRequest
): Promise<ApiResponse<Shop>> => {
  const headers = data instanceof FormData
    ? { 'Content-Type': 'multipart/form-data' }
    : undefined;

  const response = await apiClient.post(`/my-shops/${shopId}/update`, data, { headers });
  return response.data;
};

// ========================================
// 駅情報管理
// ========================================

/**
 * 店舗の駅情報を取得
 */
export const getShopStations = async (
  shopId: number
): Promise<ApiResponse<ShopStationsResponse>> => {
  const response = await apiClient.get(`/my-shops/${shopId}/stations`);
  return response.data;
};

/**
 * 店舗の駅情報を更新
 */
export const updateShopStations = async (
  shopId: number,
  data: UpdateShopStationsRequest
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/stations/update`, data);
  return response.data;
};

// ========================================
// LINE情報管理
// ========================================

/**
 * 店舗のLINE情報を更新
 */
export const updateShopLineInfo = async (
  shopId: number,
  data: UpdateLineInfoRequest
): Promise<ApiResponse<UpdateLineInfoResponse>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/line-info/update`, data);
  return response.data;
};

/**
 * LINEのQRコード画像をアップロード
 */
export const uploadLineQrCode = async (
  shopId: number,
  file: File
): Promise<ApiResponse<UploadLineQrCodeResponse>> => {
  const formData = new FormData();
  formData.append('qr_code', file);

  const response = await apiClient.post(`/my-shops/${shopId}/line-qr-code`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * LINEのQRコード画像を削除
 */
export const deleteLineQrCode = async (
  shopId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/line-qr-code/delete`);
  return response.data;
};

// ========================================
// 画像管理
// ========================================

/**
 * 店舗のメイン画像をアップロード
 */
export const uploadShopMainImage = async (
  shopId: number,
  file: File
): Promise<ApiResponse<UploadMainImageResponse>> => {
  const formData = new FormData();
  formData.append('image', file);

  const response = await apiClient.post(`/my-shops/${shopId}/main-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 店舗のロゴ画像をアップロード
 */
export const uploadShopLogoImage = async (
  shopId: number,
  file: File
): Promise<ApiResponse<UploadLogoImageResponse>> => {
  const formData = new FormData();
  formData.append('logo_image', file);

  const response = await apiClient.post(`/my-shops/${shopId}/logo-image`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 店舗のロゴ画像を削除
 */
export const deleteShopLogoImage = async (
  shopId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/logo-image/delete`);
  return response.data;
};

/**
 * 店舗のギャラリー画像を追加
 */
export const addShopGalleryImage = async (
  shopId: number,
  file: File,
  altText?: string
): Promise<ApiResponse<AddGalleryImageResponse>> => {
  const formData = new FormData();
  formData.append('image', file);
  if (altText) {
    formData.append('alt_text', altText);
  }

  const response = await apiClient.post(`/my-shops/${shopId}/gallery-images`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

/**
 * 店舗のギャラリー画像を削除
 */
export const deleteShopGalleryImage = async (
  shopId: number,
  imageId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/gallery-images/${imageId}/delete`);
  return response.data;
};

/**
 * 店舗のギャラリー画像の並び順を変更
 */
export const reorderShopGalleryImages = async (
  shopId: number,
  data: ReorderGalleryImagesRequest
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/my-shops/${shopId}/gallery-images/reorder`, data);
  return response.data;
};

// ========================================
// 下位互換用（非推奨）
// ========================================

/**
 * @deprecated getShopGalleryImages を使用してください
 */
export const getShopImages = getShopGalleryImages;

/**
 * @deprecated addShopGalleryImage を使用してください
 */
export const addShopImage = addShopGalleryImage;

/**
 * @deprecated deleteShopGalleryImage を使用してください
 */
export const deleteShopImage = deleteShopGalleryImage;

/**
 * @deprecated reorderShopGalleryImages を使用してください
 */
export const reorderShopImages = reorderShopGalleryImages;

/**
 * @deprecated updateShopLineInfo を使用してください
 */
export const updateShopLINE = updateShopLineInfo;