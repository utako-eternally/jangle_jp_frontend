// src/app/[prefecture]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, Home, ChevronRight } from 'lucide-react';
import { getPrefecture, getPrefectureStations, getPrefectureCities, getPrefectureShops } from '@/lib/api/prefectures';
import { getRuleGroups } from '@/lib/api/rules';
import type { RuleGroup } from '@/lib/api/rules';
import FilterSidebar, { FilterState } from '@/components/filter/FilterSidebar';
import FilterModal from '@/components/filter/FilterModal';
import SelectedFilters from '@/components/filter/SelectedFilters';
import SortAndView, { SortOption } from '@/components/filter/SortAndView';
import NavigationSidebar from '@/components/navigation/NavigationSidebar';
import Pagination from '@/components/pagination/Pagination';
import ShopListCard from '@/components/shop/ShopListCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Prefecture, Shop } from '@/types/models';

interface Station {
  type: 'group' | 'single';
  station_group_id: number | null;
  station_id: number | null;
  name: string;
  name_kana: string;
  slug: string;
  line_name: string | null;
  prefecture_slug: string;
  city_slug: string;
  shop_count: number;
}

interface City {
  id: number;
  name: string;
  name_kana: string;
  slug: string;
  shop_count: number;
}

function PrefecturePageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const prefectureSlug = params.prefecture as string;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [prefecture, setPrefecture] = useState<Prefecture | null>(null);
  const [stations, setStations] = useState<Station[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);
  const [error, setError] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // ルールグループ
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

  // 市区町村・駅名のマッピング
  const cityNames = cities.reduce((acc, city) => {
    acc[String(city.id)] = city.name;
    return acc;
  }, {} as Record<string, string>);

  const stationNames = stations.reduce((acc, station) => {
    const id = station.type === 'group' ? station.station_group_id : station.station_id;
    if (id) acc[String(id)] = station.name;
    return acc;
  }, {} as Record<string, string>);

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        const prefData = await getPrefecture(prefectureSlug);
        setPrefecture(prefData);

        const stationsData = await getPrefectureStations(prefectureSlug, { limit: 50 });
        setStations(stationsData);

        const citiesData = await getPrefectureCities(prefectureSlug);
        setCities(citiesData);

        // ルールグループを取得
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
  }, [prefectureSlug]);

  // 店舗検索（フィルター・ソート・ページ変更時）
  useEffect(() => {
    if (!prefecture) return;

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

        // 市区町村フィルター
        if (filters.cities.length > 0) {
          params.cities = filters.cities.map(id => Number(id));
        }

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

        const shopsResponse = await getPrefectureShops(prefectureSlug, params);

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
  }, [prefecture, filters, sortBy, prefectureSlug, currentPage]);

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

  const handleRemoveCity = (cityId: string) => {
    setFilters({
      ...filters,
      cities: filters.cities.filter(id => id !== cityId),
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

  if (error || !prefecture) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '都道府県が見つかりませんでした'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  // フィルターオプションの整形
  const cityOptions = cities.map(city => ({
    id: city.id,
    label: city.name,
    count: city.shop_count,
  }));

  const stationOptions = stations.map(station => {
    const id = station.type === 'station_group' ? station.station_group_id : station.station_id;
    // ✅ type フィールドで判定
    const label = station.type === 'station_group' 
      ? station.name 
      : (station.line_name ? `${station.name} (${station.line_name})` : station.name);
    return {
      id: id!,
      label,
      count: station.shop_count,
    };
  });

  // ナビゲーション用データ整形
  const navigationCities = cities.map(city => ({
    id: city.id,
    name: city.name,
    slug: city.slug,
    shop_count: city.shop_count,
  }));

  const navigationStations = stations.map(station => ({
    id: station.type === 'group' ? station.station_group_id! : station.station_id!,
    name: station.name,
    slug: station.slug,
    line_name: station.line_name || undefined,
    city_slug: station.city_slug,
    shop_count: station.shop_count,
  }));

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
            <span className="text-gray-900 font-medium">{prefecture.name}</span>
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
              cities={cityOptions}
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
                {prefecture.name}の雀荘
              </h1>
            </div>

            {/* 選択中の条件 */}
            <div className="mb-4">
              <SelectedFilters
                filters={filters}
                ruleGroups={ruleGroups}
                cityNames={cityNames}
                stationNames={stationNames}
                onRemoveCity={handleRemoveCity}
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
              <NavigationSidebar
                prefectureSlug={prefectureSlug}
                cities={navigationCities}
                stations={navigationStations}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* モバイル用フィルターモーダル */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        cities={cityOptions}
        stations={stationOptions}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={() => setIsFilterModalOpen(false)}
      />
    </div>
  );
}

export default function PrefecturePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <PrefecturePageContent />
    </Suspense>
  );
}