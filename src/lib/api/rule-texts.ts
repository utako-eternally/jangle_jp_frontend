// src/lib/api/rule-texts.ts
import apiClient from './client';
import {
  ApiResponse,
  RuleTextsResponse,
  RuleTextResponse,
  AvailableCategoriesResponse,
  UpdateRuleTextRequest,
} from '@/types/api';

/**
 * 店舗のルールテキスト一覧を取得
 */
export const getShopRuleTexts = async (
  shopId: number
): Promise<ApiResponse<RuleTextsResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/rule-texts`);
  return response.data;
};

/**
 * 特定カテゴリのルールテキストを取得
 */
export const getShopRuleText = async (
  shopId: number,
  category: string
): Promise<ApiResponse<RuleTextResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/rule-texts/${category}`);
  return response.data;
};

/**
 * 特定カテゴリのルールテキストを更新
 */
export const updateShopRuleText = async (
  shopId: number,
  category: string,
  data: UpdateRuleTextRequest
): Promise<ApiResponse<RuleTextResponse>> => {
  const response = await apiClient.post(`/shops/${shopId}/rule-texts/${category}`, data);
  return response.data;
};

/**
 * 利用可能なカテゴリ一覧を取得
 */
export const getAvailableCategories = async (): Promise<ApiResponse<AvailableCategoriesResponse>> => {
  const response = await apiClient.get('/rule-texts/categories');
  return response.data;
};