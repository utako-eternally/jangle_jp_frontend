// src/components/filter/SortAndView.tsx
'use client';

import { Grid, List, Map, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

export type SortOption = 'created_at' | 'name' | 'shop_count';
export type ViewMode = 'grid' | 'list' | 'map';

interface SortAndViewProps {
  totalCount: number;
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
}

export default function SortAndView({
  totalCount,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
}: SortAndViewProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions: Record<SortOption, string> = {
    created_at: '新着順',
    name: '名前順（五十音）',
    shop_count: '店舗数順',
  };

  // ドロップダウン外クリックで閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border border-gray-200">
      {/* 件数表示 */}
      <div className="text-gray-700">
        全<span className="font-bold text-gray-900 text-lg mx-1">{totalCount}</span>件
      </div>

      <div className="flex items-center gap-3">
        {/* 並び替え */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <span className="text-sm text-gray-700">{sortOptions[sortBy]}</span>
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </button>

          {/* ドロップダウンメニュー */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              {(Object.keys(sortOptions) as SortOption[]).map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    onSortChange(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                    sortBy === option ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
                  }`}
                >
                  {sortOptions[option]}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 表示切り替え（デスクトップのみ） */}
        <div className="hidden md:flex items-center gap-1 border border-gray-300 rounded-lg p-1">
          <button
            onClick={() => onViewModeChange('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="グリッド表示"
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="リスト表示"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'map'
                ? 'bg-blue-500 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            aria-label="地図表示"
          >
            <Map className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}