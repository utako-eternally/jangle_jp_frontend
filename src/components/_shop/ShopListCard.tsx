// src/components/shop/ShopListCard.tsx
import Link from 'next/link';
import { Shop } from '@/types/models';
import { MapPin, Train, Clock, Users, CheckCircle } from 'lucide-react';

interface ShopListCardProps {
  shop: Shop;
  showDistance?: boolean;
}

export default function ShopListCard({ shop, showDistance = false }: ShopListCardProps) {
  // メイン画像のURLを取得
  const getImageUrl = (imagePaths: any) => {
    if (!imagePaths) return null;
    
    try {
      const paths = typeof imagePaths === 'string' ? JSON.parse(imagePaths) : imagePaths;
      const relativePath = paths?.medium || paths?.large || paths?.original;
      
      if (!relativePath) return null;
      
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      return `${storageUrl}/${relativePath}`;
    } catch {
      return null;
    }
  };

  const mainImageUrl = getImageUrl(shop.main_image_paths);
  const logoImageUrl = getImageUrl(shop.logo_image_paths);

  // 今日の営業時間を取得
  const getTodayBusinessHour = () => {
    if (!shop.business_hours || shop.business_hours.length === 0) {
      return null;
    }

    const today = new Date().getDay(); // 0=日曜, 1=月曜, ...
    const todayHour = shop.business_hours.find((h: any) => h.day_of_week === today);

    if (!todayHour) return null;

    if (todayHour.is_closed) {
      return { text: '定休日', isOpen: false };
    }

    if (todayHour.is_24h) {
      return { text: 'オープン～ラスト', isOpen: true };
    }

    return {
      text: `${todayHour.open_time || '--:--'}-${todayHour.close_time || '--:--'}`,
      isOpen: true,
    };
  };

  const todayHour = getTodayBusinessHour();

  return (
    <Link
      href={`/shops/${shop.id}`}
      className="flex gap-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-all overflow-hidden border border-gray-200 group"
    >
      {/* 左側：画像エリア */}
      <div className="relative w-64 h-40 flex-shrink-0 overflow-hidden bg-gray-100">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-5xl">🀄</span>
          </div>
        )}
        
        {/* ロゴ（左上に小さく） */}
        {logoImageUrl && (
          <div className="absolute top-3 left-3">
            <div className="w-12 h-12 rounded-full border-2 border-white bg-white shadow-md overflow-hidden">
              <img
                src={logoImageUrl}
                alt={`${shop.name}のロゴ`}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* 認証バッジ */}
        {shop.is_verified && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded flex items-center gap-1 shadow-md">
            <CheckCircle className="w-3 h-3" />
            認証済み
          </div>
        )}
      </div>

      {/* 右側：情報エリア */}
      <div className="flex-1 py-4 pr-4 min-w-0">
        {/* 店舗名 + 営業形態バッジ */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
            {shop.name}
          </h3>
          <div className="flex gap-2 flex-shrink-0">
            {shop.has_three_player_free && (
              <span className="px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded">
                三麻
              </span>
            )}
            {shop.has_four_player_free && (
              <span className="px-3 py-1 bg-blue-500 text-white text-sm font-bold rounded">
                四麻
              </span>
            )}
            {shop.has_set && (
              <span className="px-3 py-1 bg-purple-500 text-white text-sm font-bold rounded">
                セット
              </span>
            )}
          </div>
        </div>

        {/* 住所・駅 */}
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">
              {shop.address_pref} {shop.address_city}
            </span>
          </div>
          {shop.nearest_station && (
            <>
              <span className="text-gray-300">|</span>
              <div className="flex items-center gap-1">
                <Train className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-1">
                  {shop.nearest_station.name}
                  {showDistance && shop.nearest_station.walking_minutes && (
                    <span className="text-gray-500 ml-1">徒歩{shop.nearest_station.walking_minutes}分</span>
                  )}
                </span>
              </div>
            </>
          )}
        </div>

        {/* 今日の営業時間 */}
        {todayHour && (
          <div className="flex items-center gap-2 text-sm mb-2">
            <Clock className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className={todayHour.isOpen ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              今日: {todayHour.text}
              {todayHour.isOpen && <span className="ml-2 text-green-600">営業中</span>}
            </span>
          </div>
        )}

        {/* 卓数 + 内訳 */}
        {shop.table_count > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>
              全{shop.table_count}卓
              {(shop.auto_table_count > 0 || shop.score_table_count > 0) && (
                <span className="text-gray-500 ml-1">
                  (
                  {shop.auto_table_count > 0 && `全自動${shop.auto_table_count}`}
                  {shop.auto_table_count > 0 && shop.score_table_count > 0 && ' / '}
                  {shop.score_table_count > 0 && `自動配牌${shop.score_table_count}`}
                  )
                </span>
              )}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}