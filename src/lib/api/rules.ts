// src/lib/api/rules.ts

import apiClient from './client';
import {
  ApiResponse,
  ShopRulesResponse,
  AvailableRulesResponse,
  UpdateShopRulesRequest,
} from '@/types/api';

// ========================================
// 型定義
// ========================================

export type RuleGroupType = 'toggle' | 'checkbox';

export interface RuleOption {
  value: string;
  label: string;
}

export interface RuleGroup {
  id: string;
  label: string;
  type: RuleGroupType;
  options: RuleOption[];
}

/**
 * ルールグループ定義を取得
 */
export const getRuleGroups = async (): Promise<RuleGroup[]> => {
  const response = await getAvailableRules();
  return response.data?.groups || [];
};

/**
 * ルール値からラベルを取得
 */
export function getRuleLabel(ruleValue: string, groups: RuleGroup[]): string {
  for (const group of groups) {
    const option = group.options.find(opt => opt.value === ruleValue);
    if (option) {
      return option.label;
    }
  }
  return ruleValue;
}

/**
 * ルール値からグループを取得
 */
export function getRuleGroup(ruleValue: string, groups: RuleGroup[]): RuleGroup | undefined {
  return groups.find(group =>
    group.options.some(opt => opt.value === ruleValue)
  );
}

/**
 * トグルグループの選択を処理（排他的選択）
 */
export function handleToggleSelection(
  currentRules: string[],
  selectedRule: string,
  groups: RuleGroup[]
): string[] {
  const group = getRuleGroup(selectedRule, groups);
  if (!group || group.type !== 'toggle') {
    return currentRules;
  }

  const allRulesInGroup = group.options.map(opt => opt.value);
  const filtered = currentRules.filter(rule => !allRulesInGroup.includes(rule));
  return [...filtered, selectedRule];
}

/**
 * チェックボックスの選択を処理（複数選択）
 */
export function handleCheckboxSelection(
  currentRules: string[],
  selectedRule: string,
  isChecked: boolean
): string[] {
  if (isChecked) {
    return currentRules.includes(selectedRule)
      ? currentRules
      : [...currentRules, selectedRule];
  } else {
    return currentRules.filter(rule => rule !== selectedRule);
  }
}

// ========================================
// API関数
// ========================================

/**
 * 店舗のルール一覧を取得
 */
export const getShopRules = async (
  shopId: number
): Promise<ApiResponse<ShopRulesResponse>> => {
  const response = await apiClient.get(`/shops/${shopId}/rules`);
  return response.data;
};

/**
 * 店舗のルールを更新（一括設定）
 */
export const updateShopRules = async (
  shopId: number,
  data: UpdateShopRulesRequest
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/shops/${shopId}/rules/update`, data);
  return response.data;
};

/**
 * 利用可能な全ルールの定義を取得
 */
export const getAvailableRules = async (): Promise<ApiResponse<AvailableRulesResponse>> => {
  const response = await apiClient.get('/rules/available');
  return response.data;
};