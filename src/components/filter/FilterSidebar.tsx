// src/components/filter/FilterSidebar.tsx
"use client";

import { useState, useEffect } from "react";
import { getAvailableFeatures } from "@/lib/api/features";
import { getRuleGroups } from "@/lib/api/rules";
import type { AvailableFeaturesResponse } from "@/types/api";
import type { RuleGroup } from "@/lib/api/rules";
import { handleToggleSelection, handleCheckboxSelection } from "@/lib/api/rules";

interface FilterOption {
  id: string | number;
  label: string;
  count?: number;
}

interface FilterSidebarProps {
  cities: FilterOption[];
  stations: FilterOption[];
  selectedFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  showDistanceFilter?: boolean;
}

export interface FilterState {
  // 営業形態
  threePlayerFree: boolean;
  fourPlayerFree: boolean;
  set: boolean;
  
  // ルール（配列）
  rules: string[];
  
  // 特徴（配列）
  features: string[];
  
  // 卓の種類
  autoTable: boolean;
  scoreTable: boolean;
  
  // エリア
  cities: string[];
  
  // 最寄り駅
  stations: string[];
  distanceFilter: "all" | "3" | "5" | "10";
  
  // その他
  verifiedOnly: boolean;
  hasPhotos: boolean;
}

export default function FilterSidebar({
  cities,
  stations,
  selectedFilters,
  onFilterChange,
  onReset,
  showDistanceFilter = false,
}: FilterSidebarProps) {
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllStations, setShowAllStations] = useState(false);
  
  // ルールグループをAPIから取得
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  const [loadingRules, setLoadingRules] = useState(true);
  
  // 特徴データ
  const [availableFeatures, setAvailableFeatures] = useState<AvailableFeaturesResponse | null>(null);
  const [loadingFeatures, setLoadingFeatures] = useState(true);

  // 特徴の展開状態
  const [expandedFeatureCategories, setExpandedFeatureCategories] = useState<Set<string>>(new Set());

  // 初期データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        // ルールグループを取得
        const rulesData = await getRuleGroups();
        setRuleGroups(rulesData);
        
        const featuresResponse = await getAvailableFeatures();
        if (featuresResponse.success && featuresResponse.data) {
          setAvailableFeatures(featuresResponse.data);
        }
      } catch (error) {
        console.error('フィルターデータ取得エラー:', error);
      } finally {
        setLoadingRules(false);
        setLoadingFeatures(false);
      }
    };

    loadData();
  }, []);

  const handleCityToggle = (cityId: string) => {
    const newCities = selectedFilters.cities.includes(cityId)
      ? selectedFilters.cities.filter((id) => id !== cityId)
      : [...selectedFilters.cities, cityId];

    onFilterChange({ ...selectedFilters, cities: newCities });
  };

  const handleStationToggle = (stationId: string) => {
    const newStations = selectedFilters.stations.includes(stationId)
      ? selectedFilters.stations.filter((id) => id !== stationId)
      : [...selectedFilters.stations, stationId];

    onFilterChange({ ...selectedFilters, stations: newStations });
  };

  const handleBooleanToggle = (key: keyof FilterState) => {
    onFilterChange({ ...selectedFilters, [key]: !selectedFilters[key] });
  };

  const handleRuleToggle = (ruleValue: string, groupType: 'toggle' | 'checkbox') => {
    let newRules: string[];
    
    if (groupType === 'toggle') {
      const currentlySelected = selectedFilters.rules.includes(ruleValue);
      
      if (currentlySelected) {
        newRules = selectedFilters.rules.filter(r => r !== ruleValue);
      } else {
        newRules = handleToggleSelection(selectedFilters.rules, ruleValue, ruleGroups);
      }
    } else {
      const isChecked = !selectedFilters.rules.includes(ruleValue);
      newRules = handleCheckboxSelection(selectedFilters.rules, ruleValue, isChecked);
    }

    onFilterChange({ ...selectedFilters, rules: newRules });
  };

  const handleFeatureToggle = (featureKey: string) => {
    const newFeatures = selectedFilters.features.includes(featureKey)
      ? selectedFilters.features.filter((f) => f !== featureKey)
      : [...selectedFilters.features, featureKey];

    onFilterChange({ ...selectedFilters, features: newFeatures });
  };

  const handleDistanceFilterChange = (value: "all" | "3" | "5" | "10") => {
    onFilterChange({ ...selectedFilters, distanceFilter: value });
  };

  const toggleFeatureCategory = (category: string) => {
    const newExpanded = new Set(expandedFeatureCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedFeatureCategories(newExpanded);
  };

  const displayedCities = showAllCities ? cities : cities.slice(0, 5);
  const displayedStations = showAllStations ? stations : stations.slice(0, 5);

  const hasActiveFilters =
    selectedFilters.cities.length > 0 ||
    selectedFilters.stations.length > 0 ||
    selectedFilters.distanceFilter !== 'all' ||
    selectedFilters.threePlayerFree ||
    selectedFilters.fourPlayerFree ||
    selectedFilters.set ||
    selectedFilters.rules.length > 0 ||
    selectedFilters.features.length > 0 ||
    selectedFilters.autoTable ||
    selectedFilters.scoreTable ||
    selectedFilters.verifiedOnly ||
    selectedFilters.hasPhotos;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-4">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">絞り込み条件</h2>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
            >
              クリア
            </button>
          )}
        </div>
      </div>

      <div className="divide-y divide-gray-200">
        {/* 1. 営業形態 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">営業形態</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.threePlayerFree}
                onChange={() => handleBooleanToggle("threePlayerFree")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">三麻フリー</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.fourPlayerFree}
                onChange={() => handleBooleanToggle("fourPlayerFree")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">四麻フリー</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.set}
                onChange={() => handleBooleanToggle("set")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">セット</span>
            </label>
          </div>
        </div>

        {/* 2. ルール（APIから取得したデータを使用） */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">ルール</h3>
          {loadingRules ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : ruleGroups.length > 0 ? (
            <div className="space-y-4">
              {ruleGroups.map((group) => (
                <div key={group.id}>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    {group.label}
                  </h4>
                  
                  {group.type === 'toggle' ? (
                    // トグルボタングループ（排他的選択）
                    <div className="flex flex-wrap gap-2">
                      {group.options.map((option) => {
                        const isSelected = selectedFilters.rules.includes(option.value);
                        return (
                          <button
                            key={option.value}
                            onClick={() => handleRuleToggle(option.value, 'toggle')}
                            className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                              isSelected
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {option.label}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    // チェックボックスグループ（複数選択）
                    <div className="space-y-1">
                      {group.options.map((option) => (
                        <label
                          key={option.value}
                          className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedFilters.rules.includes(option.value)}
                            onChange={() => handleRuleToggle(option.value, 'checkbox')}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">ルール情報がありません</p>
          )}
        </div>

        {/* 3. 特徴 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">特徴</h3>
          {loadingFeatures ? (
            <p className="text-sm text-gray-500">読み込み中...</p>
          ) : availableFeatures && availableFeatures.categorized_features ? (
            <div className="space-y-3">
              {Object.entries(availableFeatures.categorized_features).map(([categoryKey, category]) => {
                const isExpanded = expandedFeatureCategories.has(categoryKey);
                const hasSelectedInCategory = category.features.some((feature) =>
                  selectedFilters.features.includes(feature.key)
                );

                return (
                  <div key={categoryKey}>
                    <button
                      onClick={() => toggleFeatureCategory(categoryKey)}
                      className="flex items-center justify-between w-full text-left text-sm font-medium text-gray-700 hover:text-gray-900 py-1"
                    >
                      <span className={hasSelectedInCategory ? 'text-blue-600' : ''}>
                        {category.name}
                      </span>
                      <span className="text-gray-400">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-2 ml-2 space-y-1">
                        {category.features.map((feature) => (
                          <label
                            key={feature.key}
                            className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFilters.features.includes(feature.key)}
                              onChange={() => handleFeatureToggle(feature.key)}
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{feature.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500">特徴情報がありません</p>
          )}
        </div>

        {/* 4. 卓の種類 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">卓の種類</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.autoTable}
                onChange={() => handleBooleanToggle("autoTable")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">全自動卓あり</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.scoreTable}
                onChange={() => handleBooleanToggle("scoreTable")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">自動配牌卓あり</span>
            </label>
          </div>
        </div>

        {/* 5. エリア（市区町村） */}
        {cities.length > 0 && (
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">エリア</h3>
            <div className="space-y-2">
              {displayedCities.map((city) => (
                <label
                  key={city.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.cities.includes(String(city.id))}
                    onChange={() => handleCityToggle(String(city.id))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {city.label}
                  </span>
                  {city.count !== undefined && (
                    <span className="text-xs text-gray-500">
                      ({city.count})
                    </span>
                  )}
                </label>
              ))}
              {cities.length > 5 && (
                <button
                  onClick={() => setShowAllCities(!showAllCities)}
                  className="text-sm text-blue-600 hover:underline w-full text-left pl-6"
                >
                  {showAllCities
                    ? "閉じる"
                    : `+もっと見る (${cities.length - 5})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 6. 最寄り駅 */}
        {stations.length > 0 && (
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">最寄り駅</h3>
            <div className="space-y-2">
              {displayedStations.map((station) => (
                <label
                  key={station.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedFilters.stations.includes(
                      String(station.id)
                    )}
                    onChange={() => handleStationToggle(String(station.id))}
                    className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 flex-1">
                    {station.label}
                  </span>
                  {station.count !== undefined && (
                    <span className="text-xs text-gray-500">
                      ({station.count})
                    </span>
                  )}
                </label>
              ))}
              {stations.length > 5 && (
                <button
                  onClick={() => setShowAllStations(!showAllStations)}
                  className="text-sm text-blue-600 hover:underline w-full text-left pl-6"
                >
                  {showAllStations
                    ? "閉じる"
                    : `+もっと見る (${stations.length - 5})`}
                </button>
              )}
            </div>
          </div>
        )}

        {/* 駅からの距離フィルター（駅ページのみ） */}
        {showDistanceFilter && (
          <div className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">駅からの距離</h3>
            <div className="space-y-2">
              {[
                { value: "all" as const, label: "指定なし" },
                { value: "3" as const, label: "徒歩3分以内" },
                { value: "5" as const, label: "徒歩5分以内" },
                { value: "10" as const, label: "徒歩10分以内" },
              ].map((option) => (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="radio"
                    name="distance"
                    checked={selectedFilters.distanceFilter === option.value}
                    onChange={() => handleDistanceFilterChange(option.value)}
                    className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* その他 */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">その他</h3>
          <div className="space-y-2">
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.verifiedOnly}
                onChange={() => handleBooleanToggle("verifiedOnly")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">認証済み店舗のみ</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
              <input
                type="checkbox"
                checked={selectedFilters.hasPhotos}
                onChange={() => handleBooleanToggle("hasPhotos")}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">写真あり</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}