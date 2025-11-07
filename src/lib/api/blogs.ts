// src/lib/api/blogs.ts
import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  ShopBlogPostsParams,
} from '@/types/api';
import { BlogPost, BlogImage } from '@/types/models';

// ========================================
// 公開API（認証不要）
// ========================================

/**
 * ブログ投稿一覧を取得（公開）
 */
export const getBlogPosts = async (params?: {
  shop_id?: number;
  keyword?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}): Promise<ApiResponse<PaginatedResponse<BlogPost>>> => {
  const response = await apiClient.get('/blog-posts', { params });
  return response.data;
};

/**
 * ブログ投稿詳細を取得（公開）
 */
export const getBlogPost = async (
  postId: number
): Promise<ApiResponse<BlogPost>> => {
  const response = await apiClient.get(`/blog-posts/${postId}`);
  return response.data;
};

/**
 * ブログ投稿の画像一覧を取得（公開）
 */
export const getBlogPostImages = async (
  postId: number
): Promise<ApiResponse<BlogImage[]>> => {
  const response = await apiClient.get(`/blog-posts/${postId}/content-images`);
  return response.data;
};

/**
 * 店舗のブログ記事一覧を取得（公開・新規追加）
 * ポータルサイトで店舗別ブログ一覧を表示する際に使用
 * 既存の /blog-posts エンドポイントに shop_id パラメータを渡す
 */
export const getShopBlogPosts = async (
  shopId: number,
  params?: ShopBlogPostsParams
): Promise<ApiResponse<PaginatedResponse<BlogPost>>> => {
  const response = await apiClient.get('/blog-posts', { 
    params: { 
      shop_id: shopId, 
      ...params 
    } 
  });
  return response.data;
};

// ========================================
// オーナー専用API（認証必要）
// ========================================

/**
 * 自分のブログ投稿一覧を取得
 */
export const getMyBlogPosts = async (params?: {
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  shop_id?: number;
  per_page?: number;
  page?: number;
}): Promise<ApiResponse<PaginatedResponse<BlogPost>>> => {
  const response = await apiClient.get('/my-blog-posts', { params });
  return response.data;
};

/**
 * 自分のブログ投稿を取得（編集用）
 */
export const getMyBlogPost = async (
  postId: number
): Promise<ApiResponse<BlogPost>> => {
  const response = await apiClient.get(`/my-blog-posts/${postId}`);
  return response.data;
};

/**
 * ブログ投稿を作成
 */
export const createBlogPost = async (data: {
  shop_id: number;
  title: string;
  content: string;
  status?: 'DRAFT' | 'PUBLISHED';
  published_at?: string;
}): Promise<ApiResponse<BlogPost>> => {
  const response = await apiClient.post('/blog-posts', data);
  return response.data;
};

/**
 * ブログ投稿を更新
 */
export const updateBlogPost = async (
  postId: number,
  data: {
    title?: string;
    content?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    published_at?: string;
  }
): Promise<ApiResponse<BlogPost>> => {
  const response = await apiClient.post(`/blog-posts/${postId}/update`, data);
  return response.data;
};

/**
 * ブログ投稿を削除
 */
export const deleteBlogPost = async (
  postId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(`/blog-posts/${postId}/delete`);
  return response.data;
};

// ========================================
// サムネイル画像管理
// ========================================

/**
 * ブログ投稿のサムネイル画像をアップロード
 */
export const uploadBlogThumbnail = async (
  postId: number,
  file: File
): Promise<ApiResponse<{ thumbnail_url: string }>> => {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await apiClient.post(
    `/blog-posts/${postId}/thumbnail`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

// ========================================
// 本文画像管理
// ========================================

/**
 * ブログ本文画像を追加（Tiptap用）
 */
export const addBlogContentImage = async (
  postId: number,
  file: File,
  altText?: string,
  caption?: string
): Promise<ApiResponse<{ image: BlogImage }>> => {
  const formData = new FormData();
  formData.append('image', file);
  if (altText) {
    formData.append('alt_text', altText);
  }
  if (caption) {
    formData.append('caption', caption);
  }

  const response = await apiClient.post(
    `/blog-posts/${postId}/content-images`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );

  return response.data;
};

/**
 * ブログ本文画像を削除
 */
export const deleteBlogContentImage = async (
  postId: number,
  imageId: number
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(
    `/blog-posts/${postId}/content-images/${imageId}/delete`
  );
  return response.data;
};

/**
 * ブログ本文画像の並び順を変更
 */
export const reorderBlogContentImages = async (
  postId: number,
  imageOrders: Array<{ id: number; display_order: number }>
): Promise<ApiResponse<null>> => {
  const response = await apiClient.post(
    `/blog-posts/${postId}/content-images/reorder`,
    { image_orders: imageOrders }
  );
  return response.data;
};