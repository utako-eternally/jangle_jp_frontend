// src/app/stations/[prefecture]/[station]/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Filter, Home, ChevronRight } from 'lucide-react';
import { getStation, getStationShops, getLineNames, getStationNearby } from '@/lib/api/stations';
import { getRuleGroups } from '@/lib/api/rules';
import type { RuleGroup } from '@/lib/api/rules';
import FilterSidebar, { FilterState } from '@/components/filter/FilterSidebar';
import FilterModal from '@/components/filter/FilterModal';
import SelectedFilters from '@/components/filter/SelectedFilters';
import SortAndView, { SortOption } from '@/components/filter/SortAndView';
import StationNavigationSidebar from '@/components/navigation/StationNavigationSidebar';
import Pagination from '@/components/pagination/Pagination';
import ShopListCard from '@/components/_shop/ShopListCard';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import type { Shop } from '@/types/models';
import type { StationDetailResponse, NearbyStation } from '@/types/api';

function StationPageContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const prefectureSlug = params.prefecture as string;
  const stationSlug = params.station as string;
  const currentPage = Number(searchParams.get('page')) || 1;

  const [station, setStation] = useState<StationDetailResponse | null>(null);
  const [nearbyStations, setNearbyStations] = useState<NearbyStation[]>([]);
  const [shops, setShops] = useState<Shop[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingShops, setLoadingShops] = useState(false);
  const [error, setError] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  
  // ✅ 追加: ルールグループ
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  
  // 市区町村情報（店舗データから取得）
  const [cityInfo, setCityInfo] = useState<{ name: string; slug: string } | null>(null);

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

  // 並び替え（駅ページではデフォルトで距離順）
  const [sortBy, setSortBy] = useState<SortOption>('distance');

  // 初期データ読み込み
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);

        // 駅情報を取得
        const stationData = await getStation(prefectureSlug, stationSlug);
        setStation(stationData);

        // 周辺駅を取得
        try {
          const nearbyData = await getStationNearby(prefectureSlug, stationSlug, {
            limit: 20,
            max_distance_km: 10.0,
          });
          if (nearbyData && nearbyData.data && nearbyData.data.nearby_stations) {
            setNearbyStations(nearbyData.data.nearby_stations);
          }
        } catch (nearbyErr) {
          console.log('周辺駅の取得に失敗（スキップ）:', nearbyErr);
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
  }, [prefectureSlug, stationSlug]);

  // 店舗検索（フィルター・ソート・ページ変更時）
  useEffect(() => {
    if (!station) return;

    const loadShops = async () => {
      try {
        setLoadingShops(true);

        const params: any = {
          per_page: 15,
          page: currentPage,
          sort_by: sortBy === 'distance' ? 'distance_km' : sortBy,
          sort_direction: sortBy === 'name' ? 'asc' : 'desc',
        };

        if (filters.distanceFilter !== 'all') {
          params.max_distance_km = Number(filters.distanceFilter) * 80 / 1000;
        }

        if (filters.threePlayerFree) {
          params.has_three_player_free = true;
        }
        if (filters.fourPlayerFree) {
          params.has_four_player_free = true;
        }
        if (filters.set) {
          params.has_set = true;
        }

        if (filters.autoTable) {
          params.auto_table = true;
        }
        if (filters.scoreTable) {
          params.score_table = true;
        }

        if (filters.rules.length > 0) {
          params.rules = filters.rules;
        }

        if (filters.features.length > 0) {
          params.features = filters.features;
        }

        console.log('店舗検索パラメータ:', params);

        const shopsResponse = await getStationShops(prefectureSlug, stationSlug, params);

        console.log('店舗検索レスポンス:', shopsResponse);

        if (shopsResponse && shopsResponse.success && shopsResponse.data) {
          const data = shopsResponse.data;
          setShops(data.data || []);
          setTotalPages(data.last_page || 1);
          setTotalCount(data.total || 0);

          if (data.data && data.data.length > 0 && data.data[0].city_name && data.data[0].city_slug) {
            setCityInfo({
              name: data.data[0].city_name,
              slug: data.data[0].city_slug,
            });
          }
        } else {
          console.error('店舗検索失敗:', shopsResponse);
          setShops([]);
          setTotalCount(0);
        }
      } catch (err: any) {
        console.error('店舗検索エラー:', err);
        console.error('エラー詳細:', err.response?.data);
        setShops([]);
        setTotalCount(0);
      } finally {
        setLoadingShops(false);
      }
    };

    loadShops();
  }, [station, filters, sortBy, prefectureSlug, stationSlug, currentPage]);

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

  const handleRemoveFilter = (key: keyof FilterState) => {
    if (key === 'distanceFilter') {
      setFilters({
        ...filters,
        distanceFilter: 'all',
      });
    } else {
      setFilters({
        ...filters,
        [key]: false,
      });
    }
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

  if (error || !station) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '駅が見つかりませんでした'}</p>
          <Link href="/" className="text-blue-600 hover:text-blue-700 underline">
            トップページに戻る
          </Link>
        </div>
      </div>
    );
  }

  const lineName = getLineNames(station);

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
            {station.prefecture && (
              <>
                <Link
                  href={`/prefectures/${station.prefecture.slug}`}
                  className="hover:text-blue-600"
                >
                  {station.prefecture.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            {station.city && (
              <>
                <Link
                  href={`/cities/${station.prefecture.slug}/${station.city.slug}`}
                  className="hover:text-blue-600"
                >
                  {station.city.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-gray-900 font-medium">{station.name}</span>
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
              stations={[]}
              selectedFilters={filters}
              onFilterChange={handleFilterChange}
              onReset={handleResetFilters}
              showDistanceFilter={true}
            />
          </aside>

          {/* 中央エリア（店舗一覧） */}
          <main className="flex-1 min-w-0">
            {/* ヘッダー */}
            <div className="mb-6">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                {station.name}周辺の雀荘
              </h1>
              <p className="text-gray-600">
                {lineName}
              </p>
            </div>

            {/* 選択中の条件 */}
            <div className="mb-4">
              <SelectedFilters
                filters={filters}
                ruleGroups={ruleGroups}
                cityNames={{}}
                stationNames={{}}
                onRemoveCity={() => {}}
                onRemoveStation={() => {}}
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
                    <ShopListCard key={shop.id} shop={shop} showDistance={true} />
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
              <StationNavigationSidebar
                prefectureSlug={prefectureSlug}
                stationName={station.name}
                cityName={cityInfo?.name}
                citySlug={cityInfo?.slug}
                lineName={lineName}
                shopCount={totalCount}
                nearbyStations={nearbyStations}
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
        stations={[]}
        selectedFilters={filters}
        onFilterChange={handleFilterChange}
        onReset={handleResetFilters}
        onApply={() => setIsFilterModalOpen(false)}
        showDistanceFilter={true}
      />
    </div>
  );
}

export default function StationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><LoadingSpinner /></div>}>
      <StationPageContent />
    </Suspense>
  );
}