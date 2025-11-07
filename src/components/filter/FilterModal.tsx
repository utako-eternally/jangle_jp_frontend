// src/components/filter/FilterModal.tsx
'use client';

import { X } from 'lucide-react';
import FilterSidebar, { FilterState } from './FilterSidebar';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  cities: Array<{ id: string | number; label: string; count?: number }>;
  stations: Array<{ id: string | number; label: string; count?: number }>;
  selectedFilters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  onApply: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  cities,
  stations,
  selectedFilters,
  onFilterChange,
  onReset,
  onApply,
}: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* オーバーレイ */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* モーダルコンテンツ */}
      <div className="absolute inset-x-0 bottom-0 bg-white rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* ヘッダー */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">絞り込み条件</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* フィルター内容（スクロール可能） */}
        <div className="flex-1 overflow-y-auto">
          <FilterSidebar
            cities={cities}
            stations={stations}
            selectedFilters={selectedFilters}
            onFilterChange={onFilterChange}
            onReset={onReset}
          />
        </div>

        {/* フッターボタン */}
        <div className="p-4 border-t border-gray-200 bg-white">
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            この条件で検索
          </button>
        </div>
      </div>
    </div>
  );
}