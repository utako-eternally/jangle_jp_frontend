// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, User, Phone, MapPin, Train, ExternalLink, Settings } from "lucide-react";
import { getMyShops } from "@/lib/api/shops";
import { getProfile } from "@/lib/api/auth";
import { Shop, User as UserType } from "@/types/models";
import { ErrorMessage } from "@/components/ui/error-message";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function DashboardPage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // ユーザー情報取得
        const userResponse = await getProfile();
        if (userResponse.success && userResponse.data) {
          setUser(userResponse.data);
        }

        // 雀荘一覧取得
        const shopsResponse = await getMyShops({ per_page: 10 });
        if (shopsResponse.success && shopsResponse.data) {
          setShops(shopsResponse.data.data);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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

  // 日時フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ウェルカムメッセージ */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ようこそ、{user?.nick_name || user?.first_name || "ユーザー"}さん
        </h2>
        <p className="text-gray-600">
          雀荘管理システムへようこそ。ここから雀荘の管理やブログ投稿を行えます。
        </p>
      </div>

      {error && <ErrorMessage message={error} />}

      {/* クイックアクション */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          href="/shops/new"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                雀荘を新規登録
              </h3>
              <p className="text-sm text-gray-500">新しい雀荘を登録する</p>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/profile"
          className="bg-white rounded-lg shadow p-6 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                プロフィール設定
              </h3>
              <p className="text-sm text-gray-500">アカウント情報を編集</p>
            </div>
          </div>
        </Link>
      </div>

      {/* 登録済みの雀荘 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            登録済みの雀荘 ({shops.length}件)
          </h3>
        </div>
        <div className="p-6">
          {shops.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">まだ雀荘が登録されていません</p>
              <Link
                href="/shops/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                最初の雀荘を登録する
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {shops.map((shop) => {
                const mainImageUrl = getMainImageUrl(shop.main_image_paths);

                return (
                  <div
                    key={shop.id}
                    className="border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="flex gap-4 p-4">
                      {/* 左：画像 */}
                      <div className="w-40 h-40 flex-shrink-0 rounded-lg overflow-hidden">
                        {mainImageUrl ? (
                          <img
                            src={mainImageUrl}
                            alt={shop.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-5xl">🀄</span>
                          </div>
                        )}
                      </div>

                      {/* 右：情報 */}
                      <div className="flex-1 min-w-0">
                        {/* 上部：店舗名 + ステータス */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xl font-bold text-gray-900 mb-1 truncate">
                              {shop.name}
                            </h4>
                            <p className="text-sm text-gray-500">
                              最終更新: {formatDate(shop.updated_at)}
                            </p>
                          </div>
                          <div className="flex gap-2 ml-4">
                            {/* 公開状態バッジ */}
                            {shop.is_verified ? (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 whitespace-nowrap">
                                ✓ 公開中
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 whitespace-nowrap">
                                ⚠ 非公開
                              </span>
                            )}
                            {/* プランバッジ */}
                            {shop.active_plan && (
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                                shop.active_plan.plan_type === 'free'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {shop.active_plan.plan_type === 'free' ? 'フリープラン' : '有料プラン'}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 営業形態と料金（3列グリッド） */}
                        <div className="grid grid-cols-3 gap-4 mb-3">
                          {/* 三麻 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">三麻フリー</p>
                            {shop.frees && shop.frees.find((f: any) => f.game_format === 'THREE_PLAYER') ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                                  対応
                                </span>
                                {(() => {
                                  const threePlayerFree = shop.frees.find((f: any) => f.game_format === 'THREE_PLAYER');
                                  const minPrice = threePlayerFree?.summary?.min_price ?? threePlayerFree?.price;
                                  const maxPrice = threePlayerFree?.summary?.max_price ?? threePlayerFree?.price;
                                  
                                  if (minPrice !== null && minPrice !== undefined) {
                                    return (
                                      <p className="text-sm text-gray-900 font-semibold">
                                        {minPrice === maxPrice ? (
                                          `¥${minPrice.toLocaleString()}`
                                        ) : (
                                          `¥${minPrice.toLocaleString()}〜`
                                        )}
                                      </p>
                                    );
                                  }
                                  return <p className="text-xs text-gray-400">料金未設定</p>;
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">未対応</span>
                            )}
                          </div>

                          {/* 四麻 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">四麻フリー</p>
                            {shop.frees && shop.frees.find((f: any) => f.game_format === 'FOUR_PLAYER') ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                                  対応
                                </span>
                                {(() => {
                                  const fourPlayerFree = shop.frees.find((f: any) => f.game_format === 'FOUR_PLAYER');
                                  const minPrice = fourPlayerFree?.summary?.min_price ?? fourPlayerFree?.price;
                                  const maxPrice = fourPlayerFree?.summary?.max_price ?? fourPlayerFree?.price;
                                  
                                  if (minPrice !== null && minPrice !== undefined) {
                                    return (
                                      <p className="text-sm text-gray-900 font-semibold">
                                        {minPrice === maxPrice ? (
                                          `¥${minPrice.toLocaleString()}`
                                        ) : (
                                          `¥${minPrice.toLocaleString()}〜`
                                        )}
                                      </p>
                                    );
                                  }
                                  return <p className="text-xs text-gray-400">料金未設定</p>;
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">未対応</span>
                            )}
                          </div>

                          {/* セット */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">セット</p>
                            {shop.set ? (
                              <div>
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mb-1">
                                  対応
                                </span>
                                {(() => {
                                  const minPrice = shop.set.price_summary?.overall_min_price ?? shop.set.price;
                                  
                                  if (minPrice !== null && minPrice !== undefined) {
                                    return (
                                      <p className="text-sm text-gray-900 font-semibold">
                                        ¥{minPrice.toLocaleString()} / 時間
                                      </p>
                                    );
                                  }
                                  return <p className="text-xs text-gray-400">料金未設定</p>;
                                })()}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">未対応</span>
                            )}
                          </div>
                        </div>

                        {/* 最寄り駅 */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">最寄り駅</p>
                          {shop.nearest_station ? (
                            <div className="flex items-center text-sm text-gray-900">
                              <Train className="w-3 h-3 mr-1 flex-shrink-0 text-blue-600" />
                              <span className="truncate">
                                {shop.nearest_station.name}駅 徒歩{shop.nearest_station.walking_minutes}分
                              </span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">未設定</span>
                          )}
                        </div>

                        {/* 住所 */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">住所</p>
                          <div className="flex items-start text-sm text-gray-900">
                            <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0 text-red-600" />
                            <span className="truncate">
                              〒{shop.postal_code || '―'} {shop.address_pref}{shop.address_city}{shop.address_town}
                            </span>
                          </div>
                        </div>

                        {/* 卓数・電話番号（2列） */}
                        <div className="grid grid-cols-2 gap-4 mb-3">
                          {/* 卓数 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">卓数</p>
                            <p className="text-sm text-gray-900">
                              全{shop.table_count}卓
                              {shop.table_count > 0 && (
                                <span className="text-xs text-gray-600 ml-1">
                                  (点{shop.score_table_count}・自{shop.auto_table_count})
                                </span>
                              )}
                            </p>
                          </div>

                          {/* 電話番号 */}
                          <div>
                            <p className="text-xs text-gray-500 mb-1">電話番号</p>
                            {shop.phone ? (
                              <div className="flex items-center text-sm text-gray-900">
                                <Phone className="w-3 h-3 mr-1 flex-shrink-0 text-green-600" />
                                <span>{shop.phone}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">未設定</span>
                            )}
                          </div>
                        </div>

                        {/* 下部：アクションボタン */}
                        <div className="flex gap-2 pt-3 border-t border-gray-100">
                          <Link
                            href={`/dashboard/shops/${shop.id}`}
                            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Settings className="w-4 h-4" />
                            管理画面へ
                          </Link>
                          <Link
                            href={`/shops/${shop.id}`}
                            target="_blank"
                            className="flex items-center gap-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                            公開ページを見る
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* お知らせ・ヘルプ */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">💡 はじめに</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• まずは雀荘を登録しましょう</li>
          <li>• 有料プランでブログやギャラリー機能が使えます</li>
          <li>• LINE公式アカウントと連携できます</li>
        </ul>
      </div>
    </div>
  );
}