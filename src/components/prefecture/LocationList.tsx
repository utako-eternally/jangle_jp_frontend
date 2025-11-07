// src/components/prefecture/LocationList.tsx
'use client';

import Link from 'next/link';
import { MapPin, Building2 } from 'lucide-react';

interface Station {
  type: 'group' | 'single';
  station_group_id: number | null;
  station_id: number | null;
  name: string;
  name_kana: string;
  slug: string;
  line_name: string | null;
  shop_count: number;
}

interface City {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count: number;
}

interface LocationListProps {
  prefectureSlug: string;
  stations: Station[];
  cities: City[];
}

export default function LocationList({ prefectureSlug, stations, cities }: LocationListProps) {
  return (
    <div className="space-y-8">
      {/* 駅一覧 */}
      {stations.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-blue-500" />
            <h3 className="text-xl font-bold text-gray-900">駅から探す</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {stations.map((station) => {
              const key = station.type === 'group' 
                ? `group-${station.station_group_id}` 
                : `single-${station.station_id}`;
              
              return (
                <Link
                  key={key}
                  href={`/stations/${prefectureSlug}/${station.slug}`}
                  className="block p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
                >
                  <div className="text-center">
                    <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-1">
                      {station.name}
                    </div>
                    {station.line_name && (
                      <div className="text-xs text-gray-500 mb-1 line-clamp-1">
                        {station.line_name}
                      </div>
                    )}
                    <div className="text-sm text-gray-600">
                      {station.shop_count}店舗
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 市区町村一覧 */}
      {cities.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-green-500" />
            <h3 className="text-xl font-bold text-gray-900">市区町村から探す</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {cities.map((city) => (
              <Link
                key={city.id}
                href={`/cities/${prefectureSlug}/${city.slug}`}
                className="block p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-green-500 hover:shadow-md transition-all group"
              >
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-green-600 transition-colors mb-1 line-clamp-1">
                    {city.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {city.shop_count}店舗
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* データがない場合 */}
      {stations.length === 0 && cities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          この都道府県にはまだ店舗が登録されていません
        </div>
      )}
    </div>
  );
}