// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getPrefectures } from '@/lib/api/prefectures';
import { getShops } from '@/lib/api/shops';
import SearchAutocomplete from '@/components/search/SearchAutocomplete';
import PrefectureGrid from '@/components/prefecture/PrefectureGrid';
import ShopCard from '@/components/_shop/ShopCard';
import { Building2, MapPin, TrendingUp, Sparkles } from 'lucide-react';
import { Prefecture, Shop } from '@/types/models';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function HomePage() {
  const [prefectures, setPrefectures] = useState<Prefecture[]>([]);
  const [newShops, setNewShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        // 都道府県データと新着店舗を並行取得
        const [prefData, shopsResponse] = await Promise.all([
          getPrefectures(),
          getShops({
            sort_by: 'created_at',
            sort_direction: 'desc',
            per_page: 9,
          })
        ]);

        setPrefectures(prefData);
        
        if (shopsResponse.success && shopsResponse.data) {
          setNewShops(shopsResponse.data.data);
        }
      } catch (err: any) {
        console.error('データ取得エラー:', err);
        setError('データの取得に失敗しました');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            再読み込み
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* ヘッダー部分（他ページと統一） */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">全国の雀荘を探す</h1>
          <p className="text-gray-600 mt-1">
            駅名・地域から、あなたにぴったりの雀荘を見つけよう
          </p>
        </div>
      </div>

      {/* ヒーローセクション */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* 検索ボックス */}
          <div className="max-w-2xl mx-auto">
            <SearchAutocomplete
              placeholder="駅名・市区町村名で検索（例：渋谷、新宿）"
              className="mb-4"
            />
            <p className="text-sm text-gray-500 text-center">
              全国{prefectures.reduce((sum, p) => sum + (p.shop_count || 0), 0)}店舗以上から検索可能
            </p>
          </div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                駅から探す
              </h3>
              <p className="text-gray-600">
                最寄り駅から徒歩圏内の雀荘を簡単検索
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Building2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                詳細情報
              </h3>
              <p className="text-gray-600">
                料金・ルール・設備情報を一覧で確認
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                最新情報
              </h3>
              <p className="text-gray-600">
                各店舗の最新イベント・キャンペーン情報
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 新着店舗セクション（グリッド表示） */}
      {newShops.length > 0 && (
        <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto">
            {/* ヘッダー */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">新着店舗</h2>
                <p className="text-gray-600">最近登録された雀荘</p>
              </div>
            </div>

            {/* グリッド表示 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {newShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 都道府県一覧セクション */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              都道府県から探す
            </h2>
            <p className="text-lg text-gray-600">
              お住まいの地域・訪問予定の地域から雀荘を検索
            </p>
          </div>

          <PrefectureGrid prefectures={prefectures} />
        </div>
      </section>

      {/* CTAセクション */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            雀荘オーナーの方へ
          </h2>
          <p className="text-lg mb-8 text-blue-100">
            Jangleに店舗を掲載して、より多くのお客様にアピールしませんか？
          </p>
          
          <a
            href="/register"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            無料で店舗登録
          </a>
        </div>
      </section>
    </div>
  );
}