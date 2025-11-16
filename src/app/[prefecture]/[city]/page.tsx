// src/app/[prefecture]/[city]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, Home, ChevronRight } from 'lucide-react';
import { getCity, getCityStations, getCityShops } from '@/lib/api/cities';
import { getRuleGroups } from '@/lib/api/rules';
import type { RuleGroup } from '@/lib/api/rules';
import FilterSidebar, { FilterState } from '@/components/filter/FilterSidebar';
import FilterModal from '@/components/filter/FilterModal';
import SelectedFilters from '@/components/filter/SelectedFilters';
import SortAndView, { SortOption } from '@/components/filter/SortAndView';
import CityNavigationSidebar from '@/components/navigation/CityNavigationSidebar';
import Pagination from '@/components/pagination/Pagination';
import ShopListCard from '@/components/shop/ShopListCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Shop } from '@/types/models';
import type { CityDetailResponse, CityStation } from '@/types/api';

function CityPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const prefectureSlug = params.prefecture as string;
  const citySlug = params.city as string;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [city, setCity] = useState<CityDetailResponse | null>(null);
  const [stations, setStations] = useState<CityStation[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);
  const [error, setError] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // ✅ 追加: ルールグループ
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  
  // フィルター状態
  const [filters, setFilters] = useState<FilterState>({
    cities: [],
    stations: [],
    distanceFilter: 'all',
    threePlayerFree: false,
    fourPlayerFree: false,
    set: false,
    rules: [],
    features: [],
    autoTable: false,
    scoreTable: false,
    verifiedOnly: false,
    hasPhotos: false,
  });

  // 並び替え
  const [sortBy, setSortBy] = useState<SortOption>('created_at');

  // 駅名のマッピング
  const stationNames = Array.isArray(stations) 
    ? stations.reduce((acc, station) => {
        acc[String(station.id)] = station.name;
        return acc;
      }, {} as Record<string, string>)
    : {};

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 市区町村情報取得
        const cityData = await getCity(prefectureSlug, citySlug);
        setCity(cityData);

        // 市区町村内の駅リスト取得
        const stationsResponse = await getCityStations(prefectureSlug, citySlug, {
          limit: 50,
          sort_by: 'shop_count',
        });
        
        console.log('Stations Response:', stationsResponse);
        
        if (stationsResponse && stationsResponse.data && Array.isArray(stationsResponse.data.stations)) {
          setStations(stationsResponse.data.stations);
        } else {
          console.error('Invalid stations response:', stationsResponse);
          setStations([]);
        }

        // ✅ 追加: ルールグループを取得
        const rulesData = await getRuleGroups();
        setRuleGroups(rulesData);

      } catch (err: any) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [prefectureSlug, citySlug]);

  // 店舗検索（フィルター・ソート・ページ変更時）
  useEffect(() => {
    if (!city) return;

    const loadShops = async () => {
      try {
        setLoadingShops(true);

        // バックエンドに送信するパラメータを構築
        const params: any = {
          per_page: 15,
          page: currentPage,
          sort_by: sortBy,
          sort_direction: sortBy === 'name' ? 'asc' : 'desc',
        };

        // 営業形態フィルター
        if (filters.threePlayerFree) {
          params.has_three_player_free = true;
        }
        if (filters.fourPlayerFree) {
          params.has_four_player_free = true;
        }
        if (filters.set) {
          params.has_set = true;
        }

        // 卓の種類フィルター
        if (filters.autoTable) {
          params.auto_table = true;
        }
        if (filters.scoreTable) {
          params.score_table = true;
        }

        // ルールフィルター
        if (filters.rules.length > 0) {
          params.rules = filters.rules;
        }

        // 特徴フィルター
        if (filters.features.length > 0) {
          params.features = filters.features;
        }

        console.log('店舗検索パラメータ:', params);

        const shopsResponse = await getCityShops(prefectureSlug, citySlug, params);

        console.log('店舗検索レスポンス:', shopsResponse);

        setShops(shopsResponse.data || []);
        setTotalPages(shopsResponse.last_page || 1);
        setTotalCount(shopsResponse.total || 0);

      } catch (err: any) {
        console.error('店舗検索エラー:', err);
        setShops([]);
        setTotalCount(0);
      } finally {
        setLoadingShops(false);
      }
    };

    loadShops();
  }, [city, filters, sortBy, prefectureSlug, citySlug, currentPage]);

  // フィルター変更ハンドラー
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleResetFilters = () => {
    setFilters({
      cities: [],
      stations: [],
      distanceFilter: 'all',
      threePlayerFree: false,
      fourPlayerFree: false,
      set: false,
      rules: [],
      features: [],
      autoTable: false,
      scoreTable: false,
      verifiedOnly: false,
      hasPhotos: false,
    });
  };

  const handleRemoveStation = (stationId: string) => {
    setFilters({
      ...filters,
      stations: filters.stations.filter(id => id !== stationId),
    });
  };

  const handleRemoveFilter = (key: keyof FilterState) => {
    setFilters({
      ...filters,
      [key]: false,
    });
  };

  const handleRemoveRule = (ruleValue: string) => {
    setFilters({
      ...filters,
      rules: filters.rules.filter(r => r !== ruleValue),
    });
  };

  const handleRemoveFeature = (featureValue: string) => {
    setFilters({
      ...filters,
      features: filters.features.filter(f => f !== featureValue),
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !city) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '市区町村が見つかりませんでした'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // フィルターオプションの整形（市区町村ページでは駅のみ）
  const stationOptions = Array.isArray(stations)
    ? stations.map(station => ({
        id: station.id,
        // ✅ type フィールドで判定
        label: station.type === 'station_group' 
          ? station.name 
          : (station.line_name ? `${station.name} (${station.line_name})` : station.name),
        count: station.shop_count,
      }))
    : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずリスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home className="w-4 h-4" />
              トップ
            </Link>
            <ChevronRight className="w-4 h-4" />
            {city.prefecture && (
              <>
                <Link
                  href={`/${city.prefecture.slug}`}
                  className="hover:text-blue-600"
                >
                  {city.prefecture.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-gray-900 font-medium">{city.name}</span>
          </div>
        </div>
      </div>

      {/* モバイル用フィルターボタン */}
      <div className="lg:hidden sticky top-0 z-20 bg-white border-b border-gray-200 p-4">
        <button
          onClick={() => setIsFilterModalOpen(true)}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Filter className="w-5 h-5" />
          絞り込み
        </button>
      </div>

      {/* メインコンテンツ（3カラム） */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          {/* 左サイドバー（フィルター） */}
          <aside className="hidden lg:block w-60 flex-shrink-0">
            <FilterSidebar
              cities={[]}
              stations={stationOptions}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
            />
          </aside>

          {/* 中央エリア（店舗一覧） */}
          <main className="flex-1 min-w-0">
            {/* ヘッダー */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {city.name}の雀荘
              </h1>
            </div>

            {/* 選択中の条件 */}
            <div className="mb-4">
              <SelectedFilters
                filters={filters}
                ruleGroups={ruleGroups}
                cityNames={{}}
                stationNames={stationNames}
                onRemoveCity={() => {}}
                onRemoveStation={handleRemoveStation}
                onRemoveFilter={handleRemoveFilter}
                onRemoveRule={handleRemoveRule}
                onRemoveFeature={handleRemoveFeature}
                onClearAll={handleResetFilters}
              />
            </div>

            {/* 並び替え */}
            <div className="mb-6">
              <SortAndView
                totalCount={totalCount}
                sortBy={sortBy}
                onSortChange={setSortBy}
                viewMode="list"
                onViewModeChange={() => {}}
              />
            </div>

            {/* ローディング */}
            {loadingShops ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner />
              </div>
            ) : shops.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🀄</div>
                <p className="text-gray-500 text-lg">該当する店舗が見つかりませんでした</p>
              </div>
            ) : (
              <>
                <div className="space-y-4 mb-8">
                  {shops.map((shop) => (
                    <ShopListCard key={shop.id} shop={shop} />
                  ))}
                </div>

                {/* ページネーション */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                  />
                )}
              </>
            )}
          </main>

          {/* 右サイドバー（ナビゲーション） */}
          <aside className="hidden xl:block w-72 flex-shrink-0">
            <div className="sticky top-4">
              <CityNavigationSidebar
                prefectureSlug={prefectureSlug}
                cityName={city.name}
                stations={stations}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* モバイル用フィルターモーダル */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        cities={[]}
        stations={stationOptions}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
}

export default function CityPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <CityPageContent />
    </Suspense>
  );
}