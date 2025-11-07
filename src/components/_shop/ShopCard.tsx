// src/components/shop/ShopCard.tsx
import Link from 'next/link';
import { Shop } from '@/types/models';
import { MapPin, Clock, Users } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  className?: string;
}

export default function ShopCard({ shop, className = '' }: ShopCardProps) {
  // メイン画像のURLを取得
  const getMainImageUrl = (imagePaths: any) => {
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

  const mainImageUrl = getMainImageUrl(shop.main_image_paths);

  return (
    <Link
      href={`/shops/${shop.id}`}
      className={`flex flex-col h-[420px] bg-white rounded-xl shadow-md hover:shadow-xl transition-all overflow-hidden group ${className}`}
    >
      {/* 画像 */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden bg-gray-100">
        {mainImageUrl ? (
          <img
            src={mainImageUrl}
            alt={shop.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-6xl">🀄</span>
          </div>
        )}
        
        {/* NEW バッジ */}
        {isNewShop(shop.created_at) && (
          <div className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            NEW
          </div>
        )}
        
        {/* 認証バッジ */}
        {shop.is_verified && (
          <div className="absolute top-3 right-3 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded">
            認証済み
          </div>
        )}
      </div>

      {/* 情報 */}
      <div className="flex-1 flex flex-col p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">
          {shop.name}
        </h3>

        {/* 住所 */}
        <div className="flex items-start gap-2 text-sm text-gray-600 mb-2 min-h-[40px]">
          <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span className="line-clamp-2">
            {shop.address_pref} {shop.address_city} {shop.address_town}
          </span>
        </div>

        {/* 営業時間 */}
        <div className="min-h-[28px] mb-2">
          {shop.open_hours && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span className="line-clamp-1">{shop.open_hours}</span>
            </div>
          )}
        </div>

        {/* タグ */}
        <div className="flex flex-wrap gap-2 mb-3 min-h-[32px]">
          {shop.three_player_free && (
            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
              三麻
            </span>
          )}
          {shop.four_player_free && (
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              四麻
            </span>
          )}
          {shop.set && (
            <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
              セット
            </span>
          )}
        </div>

        {/* スペーサー */}
        <div className="flex-1"></div>

        {/* 卓数 */}
        {shop.table_count > 0 && (
          <div className="flex items-center gap-2 text-sm text-gray-600 pt-3 border-t border-gray-100">
            <Users className="w-4 h-4 flex-shrink-0" />
            <span className="line-clamp-1">全{shop.table_count}卓（点数{shop.score_table_count}・全自動{shop.auto_table_count}）</span>
          </div>
        )}
      </div>
    </Link>
  );
}

// 7日以内に作成された店舗を「新着」とする
function isNewShop(createdAt: string | Date): boolean {
  const created = new Date(createdAt);
  const now = new Date();
  const diffInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffInDays <= 7;
}