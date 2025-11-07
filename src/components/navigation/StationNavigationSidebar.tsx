// src/components/navigation/StationNavigationSidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Train, MapPin, Store, ChevronDown, ChevronUp } from 'lucide-react';
import type { NearbyStation } from '@/types/api';

interface StationNavigationSidebarProps {
  prefectureSlug: string;
  stationName: string;
  cityName?: string;
  citySlug?: string;
  lineName: string;
  shopCount: number;
  nearbyStations?: NearbyStation[];
}

export default function StationNavigationSidebar({
  prefectureSlug,
  stationName,
  cityName,
  citySlug,
  lineName,
  shopCount,
  nearbyStations = [],
}: StationNavigationSidebarProps) {
  const [showAllStations, setShowAllStations] = useState(false);

  const displayedStations = showAllStations ? nearbyStations : nearbyStations.slice(0, 5);

  return (
    <aside className="space-y-6">
      {/* 駅情報カード */}
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-blue-600 rounded-full">
            <Train className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{stationName}駅</h2>
          </div>
        </div>

        <div className="space-y-3">
          {/* 路線 */}
          <div className="flex items-start gap-2">
            <Train className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-600 mb-1">路線</div>
              <div className="text-sm text-gray-900 font-medium leading-relaxed">
                {lineName}
              </div>
            </div>
          </div>

          {/* 店舗数 */}
          <div className="flex items-center gap-2">
            <Store className="w-5 h-5 text-blue-600 flex-shrink-0" />
            <div>
              <div className="text-xs text-gray-600 mb-1">駅周辺の店舗数</div>
              <div className="text-sm text-gray-900 font-medium">
                {shopCount}店舗
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 周辺の駅 */}
      {nearbyStations.length > 0 && (
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <Train className="w-5 h-5 text-green-600" />
              周辺の駅
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
                    <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                      <span className="text-xs text-gray-500">
                        {station.distance_km.toFixed(1)}km
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {station.shop_count}店舗
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            
            {nearbyStations.length > 5 && (
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
                    もっと見る ({nearbyStations.length - 5}件)
                  </>
                )}
              </button>
            )}
          </div>
        </nav>
      )}

      {/* 所在地 */}
      {cityName && citySlug && (
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <MapPin className="w-5 h-5 text-blue-600" />
              所在地
            </h2>
          </div>
          
          <div className="p-4">
            <Link
              href={`/cities/${prefectureSlug}/${citySlug}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors group border border-gray-200"
            >
              <div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                  {cityName}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  この市区町村の雀荘を見る →
                </div>
              </div>
            </Link>
          </div>
        </nav>
      )}
    </aside>
  );
}