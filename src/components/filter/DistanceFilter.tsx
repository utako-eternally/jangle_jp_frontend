// src/components/filter/DistanceFilter.tsx
'use client';

interface DistanceFilterProps {
  selectedDistance: 'all' | '3' | '5' | '10';
  onChange: (distance: 'all' | '3' | '5' | '10') => void;
}

export default function DistanceFilter({ selectedDistance, onChange }: DistanceFilterProps) {
  return (
    <div className="p-4 border-b border-gray-200">
      <h3 className="font-semibold text-gray-900 mb-3">駅からの距離</h3>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input
            type="radio"
            name="distance"
            value="all"
            checked={selectedDistance === 'all'}
            onChange={() => onChange('all')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">すべて表示</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input
            type="radio"
            name="distance"
            value="3"
            checked={selectedDistance === '3'}
            onChange={() => onChange('3')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">徒歩3分以内</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input
            type="radio"
            name="distance"
            value="5"
            checked={selectedDistance === '5'}
            onChange={() => onChange('5')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">徒歩5分以内</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
          <input
            type="radio"
            name="distance"
            value="10"
            checked={selectedDistance === '10'}
            onChange={() => onChange('10')}
            className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">徒歩10分以内</span>
        </label>
      </div>
    </div>
  );
}