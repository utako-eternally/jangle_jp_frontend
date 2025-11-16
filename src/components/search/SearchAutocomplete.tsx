// src/components/search/SearchAutocomplete.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Building2 } from 'lucide-react';
import { searchSuggest } from '@/lib/api/search';
import { SearchSuggestResponse } from '@/types/api';
import { debounce } from 'lodash';

interface SearchAutocompleteProps {
  placeholder?: string;
  prefectureFilter?: string;
  className?: string;
}

export default function SearchAutocomplete({
  placeholder = '駅名・市区町村名で検索',
  prefectureFilter,
  className = '',
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchSuggestResponse | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // 外側クリックで閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 検索処理（デバウンス）
  const debouncedSearch = useRef(
    debounce(async (searchQuery: string, prefecture?: string) => {
      if (searchQuery.length < 2) {
        setResults(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await searchSuggest({
          q: searchQuery,
          prefecture,
          limit: 10,
        });
        setResults(response);
        setIsOpen(true);
      } catch (error) {
        console.error('検索エラー:', error);
        setResults(null);
      } finally {
        setIsLoading(false);
      }
    }, 300)
  ).current;

  // クエリ変更時
  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length < 2) {
      setResults(null);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    debouncedSearch(value, prefectureFilter);
  };

  // 駅選択時
  const handleSelectStation = (station: SearchSuggestResponse['stations'][0]) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/${station.prefecture_slug}/${station.city_slug}/${station.slug}`);
  };

  // 市区町村選択時
  const handleSelectCity = (city: SearchSuggestResponse['cities'][0]) => {
    setQuery('');
    setIsOpen(false);
    router.push(`/${city.prefecture_slug}/${city.slug}`);
  };

  const hasResults = results && (results.stations.length > 0 || results.cities.length > 0);
  const showNoResults = !isLoading && query.length >= 2 && !hasResults;

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      {/* 検索入力 */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={handleQueryChange}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-4 text-lg border-2 border-gray-300 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
        />
        {isLoading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>

      {/* 検索結果ドロップダウン */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-96 overflow-y-auto">
          {showNoResults && (
            <div className="px-4 py-8 text-center text-gray-500">
              該当する駅・市区町村が見つかりませんでした
            </div>
          )}

          {/* 駅の検索結果 */}
          {results && results.stations.length > 0 && (
            <div className="border-b border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                駅
              </div>
              {results.stations.map((station) => (
                <button
                  key={`${station.type}-${station.station_group_id || station.station_id}`}
                  onClick={() => handleSelectStation(station)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                >
                  <MapPin className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {station.name}
                      {station.line_name && (
                        <span className="ml-2 text-sm text-gray-500">
                          {station.line_name}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{station.prefecture_name}</span>
                      <span className="text-gray-300">•</span>
                      <span>{station.shop_count}店舗</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* 市区町村の検索結果 */}
          {results && results.cities.length > 0 && (
            <div>
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                市区町村
              </div>
              {results.cities.map((city) => (
                <button
                  key={`city-${city.city_id}`}
                  onClick={() => handleSelectCity(city)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors flex items-center gap-3 group"
                >
                  <Building2 className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-gray-900 truncate">
                      {city.name}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center gap-2">
                      <span>{city.prefecture_name}</span>
                      <span className="text-gray-300">•</span>
                      <span>{city.shop_count}店舗</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}