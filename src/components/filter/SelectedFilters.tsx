// src/components/filter/SelectedFilters.tsx

import { X } from 'lucide-react';
import { getRuleLabel } from '@/lib/api/rules';
import type { RuleGroup } from '@/lib/api/rules';
import type { FilterState } from './FilterSidebar';

interface SelectedFiltersProps {
  filters: FilterState;
  ruleGroups: RuleGroup[];
  cityNames: Record<string, string>;
  stationNames: Record<string, string>;
  onRemoveCity: (cityId: string) => void;
  onRemoveStation: (stationId: string) => void;
  onRemoveFilter: (key: keyof FilterState) => void;
  onRemoveRule: (ruleValue: string) => void;
  onRemoveFeature: (featureValue: string) => void;
  onClearAll: () => void;
}

export default function SelectedFilters({
  filters,
  ruleGroups,
  cityNames,
  stationNames,
  onRemoveCity,
  onRemoveStation,
  onRemoveFilter,
  onRemoveRule,
  onRemoveFeature,
  onClearAll,
}: SelectedFiltersProps) {
  // デバッグ用
  console.log('SelectedFilters - ruleGroups:', ruleGroups);
  console.log('SelectedFilters - ruleGroups type:', typeof ruleGroups);
  console.log('SelectedFilters - is array?', Array.isArray(ruleGroups));

  const hasFilters =
    filters.cities.length > 0 ||
    filters.stations.length > 0 ||
    filters.threePlayerFree ||
    filters.fourPlayerFree ||
    filters.set ||
    filters.rules.length > 0 ||
    filters.features.length > 0 ||
    filters.autoTable ||
    filters.scoreTable ||
    filters.verifiedOnly ||
    filters.hasPhotos;

  if (!hasFilters) {
    return null;
  }

  const safeRuleGroups = Array.isArray(ruleGroups) ? ruleGroups : [];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900">選択中の条件</h3>
        <button
          onClick={onClearAll}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline"
        >
          すべてクリア
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.cities.map((cityId) => (
          <FilterTag
            key={`city-${cityId}`}
            label={cityNames[cityId] || cityId}
            onRemove={() => onRemoveCity(cityId)}
          />
        ))}

        {filters.stations.map((stationId) => (
          <FilterTag
            key={`station-${stationId}`}
            label={stationNames[stationId] || stationId}
            onRemove={() => onRemoveStation(stationId)}
          />
        ))}

        {filters.threePlayerFree && (
          <FilterTag
            label="三麻フリー"
            onRemove={() => onRemoveFilter('threePlayerFree')}
          />
        )}
        {filters.fourPlayerFree && (
          <FilterTag
            label="四麻フリー"
            onRemove={() => onRemoveFilter('fourPlayerFree')}
          />
        )}
        {filters.set && (
          <FilterTag
            label="セット"
            onRemove={() => onRemoveFilter('set')}
          />
        )}

        {filters.rules.map((rule) => (
          <FilterTag
            key={`rule-${rule}`}
            label={getRuleLabel(rule, safeRuleGroups)}
            onRemove={() => onRemoveRule(rule)}
          />
        ))}

        {filters.features.map((feature) => (
          <FilterTag
            key={`feature-${feature}`}
            label={feature}
            onRemove={() => onRemoveFeature(feature)}
          />
        ))}

        {filters.autoTable && (
          <FilterTag
            label="全自動卓あり"
            onRemove={() => onRemoveFilter('autoTable')}
          />
        )}
        {filters.scoreTable && (
          <FilterTag
            label="自動配牌卓あり"
            onRemove={() => onRemoveFilter('scoreTable')}
          />
        )}

        {filters.verifiedOnly && (
          <FilterTag
            label="認証済み店舗のみ"
            onRemove={() => onRemoveFilter('verifiedOnly')}
          />
        )}
        {filters.hasPhotos && (
          <FilterTag
            label="写真あり"
            onRemove={() => onRemoveFilter('hasPhotos')}
          />
        )}
      </div>
    </div>
  );
}

function FilterTag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
        aria-label={`${label}を削除`}
      >
        <X className="w-3 h-3" />
      </button>
    </span>
  );
}