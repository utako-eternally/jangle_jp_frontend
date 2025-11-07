// src/app/shops/[id]/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Phone, Globe, Share2, MapPin, Clock, Train, 
  Users, Utensils, Beer, Cigarette, ParkingCircle,
  Home, Wifi, ChevronRight
} from 'lucide-react';
import { getShop, getShopGalleryImages, getShopStations } from '@/lib/api/shops';
import ImageGallery from '@/components/_shop/ImageGallery';
import ShopInfoTab from '@/components/_shop/ShopInfoTab';
import RulesTab from '@/components/_shop/RulesTab';
import AccessTab from '@/components/shop/AccessTab';
import BlogTab from '@/components/_shop/BlogTab';
import LineSection from '@/components/_shop/LineSection';
import NearbyShops from '@/components/_shop/NearByShops';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { Shop, ShopImage } from '@/types/models';

type TabType = 'info' | 'rules' | 'access' | 'blog';

interface StationWithDistance {
  id: number;
  name: string;
  line_name: string;
  distance_km: number;
  walking_minutes: number;
}

export default function ShopDetailPage() {
  const params = useParams();
  const shopId = Number(params.id);

  const [shop, setShop] = useState<Shop | null>(null);
  const [galleryImages, setGalleryImages] = useState<ShopImage[]>([]);
  const [stations, setStations] = useState<StationWithDistance[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadShopData = async () => {
      try {
        setLoading(true);

        // 店舗詳細取得
        const shopResponse = await getShop(shopId);
        if (shopResponse.success && shopResponse.data) {
          setShop(shopResponse.data);
        }

        // ギャラリー画像取得
        const galleryResponse = await getShopGalleryImages(shopId);
        if (galleryResponse.success && galleryResponse.data) {
          setGalleryImages(galleryResponse.data);
        }

        // 最寄り駅情報取得
        const stationsResponse = await getShopStations(shopId);
        if (stationsResponse.success && stationsResponse.data) {
          const stationsData = stationsResponse.data.stations || [];
          setStations(stationsData.map((s: any) => ({
            ...s,
            walking_minutes: Math.ceil(s.distance_km * 1000 / 80), // 80m/分で計算
          })));
        }
      } catch (err: any) {
        console.error('店舗データ取得エラー:', err);
        setError('店舗情報の取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadShopData();
  }, [shopId]);

  // シェア機能
  const handleShare = async () => {
    if (navigator.share && shop) {
      try {
        await navigator.share({
          title: shop.name,
          text: `${shop.name} - ${shop.address_pref}${shop.address_city}の雀荘`,
          url: window.location.href,
        });
      } catch (err) {
        console.log('シェアがキャンセルされました');
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('URLをコピーしました');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || '店舗が見つかりませんでした'}</p>
          <a href="/" className="text-blue-600 hover:underline">
            トップページに戻る
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* パンくずリスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 overflow-x-auto">
            <Link href="/" className="hover:text-blue-600 whitespace-nowrap">
              トップ
            </Link>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            {shop.prefecture_slug && (
              <>
                <Link 
                  href={`/prefectures/${shop.prefecture_slug}`}
                  className="hover:text-blue-600 whitespace-nowrap"
                >
                  {shop.address_pref}
                </Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            {shop.city_slug && shop.prefecture_slug && (
              <>
                <Link 
                  href={`/cities/${shop.prefecture_slug}/${shop.city_slug}`}
                  className="hover:text-blue-600 whitespace-nowrap"
                >
                  {shop.address_city}
                </Link>
                <ChevronRight className="w-4 h-4 flex-shrink-0" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate">
              {shop.name}
            </span>
          </div>
        </div>
      </div>

      {/* ヘッダー（モバイルのみ） */}
      <div className="lg:hidden bg-white border-b border-gray-200 p-4">
        <h1 className="text-2xl font-bold text-gray-900">{shop.name}</h1>
        {shop.is_verified && (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-2">
            ✓ 認証済み
          </span>
        )}
      </div>

      {/* メインレイアウト */}
      <div className="max-w-7xl mx-auto lg:flex lg:gap-6 lg:p-6">
        {/* サイドバー（デスクトップ） */}
        <aside className="hidden lg:block lg:w-80 flex-shrink-0">
          <div className="sticky top-6 space-y-4">
            {/* 店舗名カード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{shop.name}</h1>
              {shop.is_verified && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  ✓ 認証済み
                </span>
              )}
            </div>

            {/* 基本情報カード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide">
                基本情報
              </h2>

              {/* 住所 */}
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <div className="text-gray-500 text-xs mb-1">住所</div>
                  <div className="text-gray-900">
                    {shop.address_pref}{shop.address_city}{shop.address_street}
                  </div>
                </div>
              </div>

              {/* 営業時間 */}
              {shop.business_hours && (
                <div className="flex gap-3">
                  <Clock className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-gray-500 text-xs mb-1">営業時間</div>
                    <div className="text-gray-900">{shop.business_hours}</div>
                  </div>
                </div>
              )}

              {/* 電話 */}
              {shop.phone && (
                <div className="flex gap-3">
                  <Phone className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-gray-500 text-xs mb-1">電話番号</div>
                    
                    <a
                      href={`tel:${shop.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {shop.phone}
                    </a>
                  </div>
                </div>
              )}

              {/* ウェブサイト */}
              {shop.website_url && (
                <div className="flex gap-3">
                  <Globe className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <div className="text-gray-500 text-xs mb-1">ウェブサイト</div>
                    
                    <a
                      href={shop.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline break-all"
                    >
                      {shop.website_url.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                </div>
              )}
            </div>

            {/* 駅情報カード */}
            {stations.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
                  最寄り駅
                </h2>
                <div className="space-y-3">
                  {stations.slice(0, 3).map((station) => (
                    <div key={station.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                      <Train className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">
                          {station.name}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {station.line_name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-lg font-bold text-blue-600">
                            {station.walking_minutes}
                          </span>
                          <span className="text-xs text-gray-600">分</span>
                          <span className="text-xs text-gray-400">
                            (約{station.distance_km.toFixed(1)}km)
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 営業形態カード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
                営業形態
              </h2>
              <div className="space-y-2">
                {shop.has_three_player_free && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">三麻フリー</span>
                  </div>
                )}
                {shop.has_four_player_free && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">四麻フリー</span>
                  </div>
                )}
                {shop.has_set && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-700">セット</span>
                  </div>
                )}
              </div>
            </div>

            {/* 卓情報カード */}
            {(shop.auto_table_count > 0 || shop.score_table_count > 0) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
                  卓情報
                </h2>
                <div className="space-y-3">
                  {shop.auto_table_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">全自動卓</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {shop.auto_table_count}
                        <span className="text-sm text-gray-600 ml-1">台</span>
                      </span>
                    </div>
                  )}
                  {shop.score_table_count > 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">点数表示卓</span>
                      <span className="text-2xl font-bold text-blue-600">
                        {shop.score_table_count}
                        <span className="text-sm text-gray-600 ml-1">台</span>
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 設備・サービスカード */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="font-semibold text-gray-900 text-sm uppercase tracking-wide mb-4">
                設備・サービス
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {shop.has_food && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Utensils className="w-4 h-4 text-gray-400" />
                    <span>料理</span>
                  </div>
                )}
                {shop.has_alcohol && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Beer className="w-4 h-4 text-gray-400" />
                    <span>お酒</span>
                  </div>
                )}
                {shop.smoking_allowed && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Cigarette className="w-4 h-4 text-gray-400" />
                    <span>喫煙可</span>
                  </div>
                )}
                {shop.has_parking && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <ParkingCircle className="w-4 h-4 text-gray-400" />
                    <span>駐車場</span>
                  </div>
                )}
                {shop.has_shower && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Home className="w-4 h-4 text-gray-400" />
                    <span>シャワー</span>
                  </div>
                )}
                {shop.has_wifi && (
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <Wifi className="w-4 h-4 text-gray-400" />
                    <span>Wi-Fi</span>
                  </div>
                )}
              </div>
            </div>

            {/* アクションボタン */}
            <div className="space-y-2">
              {shop.phone && (
                
                <a
                  href={`tel:${shop.phone}`}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                >
                  <Phone className="w-5 h-5" />
                  電話する
                </a>
              )}
              {shop.website_url && (
                
                <a
                  href={shop.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  <Globe className="w-5 h-5" />
                  ウェブサイト
                </a>
              )}
              <button
                onClick={handleShare}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
              >
                <Share2 className="w-5 h-5" />
                シェア
              </button>
            </div>
          </div>
        </aside>

        {/* メインコンテンツ */}
        <main className="flex-1 min-w-0">
          {/* 画像ギャラリー */}
          <div className="bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 lg:p-6 p-4">
            <ImageGallery
              mainImagePaths={shop.main_image_paths}
              galleryImages={galleryImages}
              shopName={shop.name}
            />
          </div>

          {/* モバイル用：駅情報 */}
          {stations.length > 0 && (
            <div className="lg:hidden bg-white border-t border-gray-200 p-4">
              <h2 className="font-semibold text-gray-900 mb-3">最寄り駅</h2>
              <div className="space-y-2">
                {stations.slice(0, 3).map((station) => (
                  <div key={station.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Train className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-sm">{station.name}</div>
                        <div className="text-xs text-gray-500">{station.line_name}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">
                        {station.walking_minutes}分
                      </div>
                      <div className="text-xs text-gray-500">
                        {station.distance_km.toFixed(1)}km
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* タブナビゲーション */}
          <div className="bg-white border-t lg:border-t-0 lg:border-b border-gray-200 lg:mt-6 lg:rounded-lg lg:shadow-sm lg:border sticky top-0 z-10">
            <div className="flex gap-6 overflow-x-auto px-4 lg:px-6">
              <button
                onClick={() => setActiveTab('info')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'info'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                店舗情報
              </button>
              <button
                onClick={() => setActiveTab('rules')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'rules'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                ルール
              </button>
              <button
                onClick={() => setActiveTab('access')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'access'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                アクセス
              </button>
              <button
                onClick={() => setActiveTab('blog')}
                className={`py-4 px-2 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === 'blog'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                ブログ
              </button>
            </div>
          </div>

          {/* タブコンテンツ */}
          <div className="bg-white lg:rounded-lg lg:shadow-sm lg:border lg:border-gray-200 p-4 lg:p-6 mt-0 lg:mt-6">
            {activeTab === 'info' && <ShopInfoTab shop={shop} />}
            {activeTab === 'rules' && <RulesTab shopId={shop.id} />}
            {activeTab === 'access' && <AccessTab shop={shop} stations={stations} />}
            {activeTab === 'blog' && <BlogTab shopId={shop.id} />}
          </div>
        </main>
      </div>

      {/* LINE連携 */}
      <div className="mt-6">
        <LineSection shopId={shop.id} />
      </div>

      {/* 近隣店舗 */}
      <NearbyShops
        currentShopId={shop.id}
        prefecture={shop.address_pref}
        city={shop.address_city}
      />

      {/* モバイル用フッターアクション */}
      <div className="lg:hidden sticky bottom-0 bg-white border-t border-gray-200 shadow-lg z-20">
        <div className="px-4 py-3">
          <div className="flex gap-2">
            {shop.phone && (
              
              <a
                href={`tel:${shop.phone}`}
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-green-500 text-white rounded-lg font-medium"
              >
                <Phone className="w-5 h-5" />
                <span>電話</span>
              </a>
            )}
            {shop.website_url && (
              
              <a
                href={shop.website_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 px-3 py-3 bg-blue-500 text-white rounded-lg font-medium"
              >
                <Globe className="w-5 h-5" />
                <span>Web</span>
              </a>
            )}
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-600 text-white rounded-lg font-medium"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}