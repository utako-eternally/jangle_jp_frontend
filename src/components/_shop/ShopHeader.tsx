// src/components/shop/ShopHeader.tsx
import Link from 'next/link';
import { MapPin, Phone, Clock, Calendar, Globe, Home, ChevronRight, CheckCircle } from 'lucide-react';
import { Shop } from '@/types/models';

interface ShopHeaderProps {
  shop: Shop;
}

export default function ShopHeader({ shop }: ShopHeaderProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* パンくずリスト */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
            <Home className="w-4 h-4" />
            トップ
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/prefectures/${shop.prefecture_slug || ''}`} className="hover:text-blue-600">
            {shop.address_pref}
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-900">{shop.name}</span>
        </div>

        {/* 店舗名・バッジ */}
        <div className="flex items-start gap-3 mb-4">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {shop.name}
          </h1>
          {shop.is_verified && (
            <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
              <CheckCircle className="w-4 h-4" />
              認証済み
            </div>
          )}
        </div>

        {/* 基本情報 */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* 住所 */}
          <div className="flex items-start gap-2 text-gray-700">
            <MapPin className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-500" />
            <div>
              <div className="font-medium text-gray-900 mb-1">住所</div>
              <div className="text-sm">
                〒{shop.postal_code && `${shop.postal_code.slice(0, 3)}-${shop.postal_code.slice(3)}`}<br />
                {shop.address_pref}{shop.address_city}{shop.address_town}
                {shop.address_building && <><br />{shop.address_building}</>}
              </div>
            </div>
          </div>

          {/* 電話番号 */}
          {shop.phone && (
            <div className="flex items-start gap-2 text-gray-700">
              <Phone className="w-5 h-5 mt-0.5 flex-shrink-0 text-green-500" />
              <div>
                <div className="font-medium text-gray-900 mb-1">電話番号</div>
                <a 
                  href={`tel:${shop.phone}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  {shop.phone}
                </a>
              </div>
            </div>
          )}

          {/* 営業時間 */}
          {shop.open_hours && (
            <div className="flex items-start gap-2 text-gray-700">
              <Clock className="w-5 h-5 mt-0.5 flex-shrink-0 text-orange-500" />
              <div>
                <div className="font-medium text-gray-900 mb-1">営業時間</div>
                <div className="text-sm whitespace-pre-line">{shop.open_hours}</div>
              </div>
            </div>
          )}

          {/* 定休日 */}
          {shop.regular_holiday && (
            <div className="flex items-start gap-2 text-gray-700">
              <Calendar className="w-5 h-5 mt-0.5 flex-shrink-0 text-purple-500" />
              <div>
                <div className="font-medium text-gray-900 mb-1">定休日</div>
                <div className="text-sm">{shop.regular_holiday}</div>
              </div>
            </div>
          )}

          {/* ウェブサイト */}
          {shop.website_url && (
            <div className="flex items-start gap-2 text-gray-700">
              <Globe className="w-5 h-5 mt-0.5 flex-shrink-0 text-indigo-500" />
              <div>
                <div className="font-medium text-gray-900 mb-1">ウェブサイト</div>
                <a 
                  href={shop.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {shop.website_url}
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}