// src/components/navigation/NavigationSidebar.tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { MapPin, Train, ChevronDown, ChevronUp } from 'lucide-react';

interface City {
  id: number;
  name: string;
  slug: string;
  shop_count: number;
}

interface Station {
  id: number;
  name: string;
  slug: string;
  line_name?: string;
  city_slug: string;
  shop_count: number;
}

interface NavigationSidebarProps {
  prefectureSlug: string;
  cities: City[];
  stations: Station[];
}

export default function NavigationSidebar({
  prefectureSlug,
  cities,
  stations,
}: NavigationSidebarProps) {
  const [showAllCities, setShowAllCities] = useState(false);
  const [showAllStations, setShowAllStations] = useState(false);

  const displayedCities = showAllCities ? cities : cities.slice(0, 5);
  const displayedStations = showAllStations ? stations : stations.slice(0, 5);

  return (
    <aside className="space-y-6">

      {/* 駅ナビゲーション */}
      {stations.length > 0 && (
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <Train className="w-5 h-5 text-green-600" />
              駅から探す
            </h2>
          </div>
          
          <div className="p-4">
            <ul className="space-y-2">
              {displayedStations.map((station) => (
                <li key={station.id}>
                  <Link
                    href={`/${prefectureSlug}/${station.city_slug}/${station.slug}`}
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

      {/* データがない場合 */}
      {cities.length === 0 && stations.length === 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center text-gray-500">
          エリア情報がありません
        </div>
      )}

      {/* 市区町村ナビゲーション */}
      {cities.length > 0 && (
        <nav className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
            <h2 className="flex items-center gap-2 font-bold text-gray-900">
              <MapPin className="w-5 h-5 text-blue-600" />
              市区町村から探す
            </h2>
          </div>
          
          <div className="p-4">
            <ul className="space-y-2">
              {displayedCities.map((city) => (
                <li key={city.id}>
                  <Link
                    href={`/${prefectureSlug}/${city.slug}`}
                    className="flex items-center justify-between p-2 rounded-lg hover:bg-blue-50 transition-colors group"
                  >
                    <span className="text-sm text-gray-700 group-hover:text-blue-600 font-medium">
                      {city.name}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {city.shop_count}店舗
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            
            {cities.length > 5 && (
              <button
                onClick={() => setShowAllCities(!showAllCities)}
                className="mt-3 w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-medium"
              >
                {showAllCities ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    閉じる
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    もっと見る ({cities.length - 5}件)
                  </>
                )}
              </button>
            )}
          </div>
        </nav>
      )}

    </aside>
  );
}