// src/components/navigation/CityNavigationSidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Train, ChevronDown, ChevronUp } from 'lucide-react';
import type { CityStation } from '@/types/api';

interface CityNavigationSidebarProps {
  prefectureSlug: string;
  cityName: string;
  stations: CityStation[];
}

export default function CityNavigationSidebar({
  prefectureSlug,
  cityName,
  stations,
}: CityNavigationSidebarProps) {
  const [showAllStations, setShowAllStations] = useState(false);

  const displayedStations = showAllStations ? stations : stations.slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* 駅ナビゲーション */}
      {stations.length > 0 && (
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <Train className="w-5 h-5 text-green-600" />
              {cityName}内の駅から探す
            </h2>
          </div>
          
          <div className="p-4">
            <ul className="space-y-2">
              {displayedStations.map((station) => (
                <li key={station.id}>
                  <Link
                    href={`/stations/${prefectureSlug}/${station.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-green-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-gray-700 group-hover:text-green-600 font-medium">
                        {station.name}
                      </div>
                      {station.line_name && (
                        <div className="text-xs text-gray-500 truncate">
                          {station.line_name}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full ml-2 flex-shrink-0">
                      {station.shop_count}店舗
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {stations.length > 5 && (
              <button
                onClick={() => setShowAllStations(!showAllStations)}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50 rounded-lg transition-colors font-medium"
              >
                {showAllStations ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    閉じる
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    もっと見る ({stations.length - 5}件)
                  </>
                )}
              </button>
            )}
          </div>
        </nav>
      )}

      {/* 駅がない場合 */}
      {stations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          駅情報がありません
        </div>
      )}
    </aside>
  );
}