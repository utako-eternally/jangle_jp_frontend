// src/lib/api/search.ts
import apiClient from './client';
import type { 
  ApiResponse,
  SearchSuggestParams,
  SearchSuggestResponse,
} from '@/types/api';

/**
 * オートコンプリート検索
 * 駅名・市区町村名を検索
 */
export const searchSuggest = async (params: SearchSuggestParams): Promise<SearchSuggestResponse> => {
  const response = await apiClient.get<ApiResponse<SearchSuggestResponse>>(
    '/search/suggest',
    { params }
  );
  if (!response.data.data) {
    return { prefectures: [], stations: [], cities: [] };
  }
  return response.data.data;
};