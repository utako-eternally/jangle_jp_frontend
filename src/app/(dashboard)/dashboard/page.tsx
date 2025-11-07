// src/app/(dashboard)/dashboard/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, User } from "lucide-react";
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
        const shopsResponse = await getMyShops({ per_page: 5 });
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
      
      // バックエンドのストレージURLを使用
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      return `${storageUrl}/${relativePath}`;
    } catch {
      return null;
    }
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

      {/* 最近の雀荘 */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              登録済みの雀荘
            </h3>
            <Link
              href="/dashboard/shops"
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              すべて見る →
            </Link>
          </div>
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
            <div className="space-y-6">
              {shops.map((shop) => {
                const mainImageUrl = getMainImageUrl(shop.main_image_paths);

                return (
                  <Link
                    key={shop.id}
                    href={`/dashboard/shops/${shop.id}`}
                    className="block border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all overflow-hidden"
                  >
                    <div className="flex">
                      {/* 左: 基本情報 (30%) */}
                      <div className="w-[30%] p-6 bg-gray-50 flex flex-col justify-center">
                        <h4 className="text-xl font-bold text-gray-900 mb-3">
                          {shop.name}
                        </h4>
                        
                        {shop.phone && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="mr-2">📞</span>
                            <span>{shop.phone}</span>
                          </div>
                        )}
                        
                        {/* 非公開中の警告 */}
                        {!shop.is_verified && (
                        <div className="mb-3 px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-lg">
                            <p className="text-xs font-medium text-yellow-800">
                            ⚠️ 現在非公開
                            </p>
                            <p className="text-xs text-yellow-700 mt-1">
                            事務局確認中
                            </p>
                        </div>
                        )}

                        {shop.website_url && (
                          <div className="flex items-center text-sm text-blue-600 mb-2 truncate">
                            <span className="mr-2">🌐</span>
                            <span className="truncate">{shop.website_url}</span>
                          </div>
                        )}
                        
                        {shop.open_hours && (
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="mr-2">🕐</span>
                            <span>{shop.open_hours}</span>
                          </div>
                        )}

                        {shop.is_verified && (
                          <div className="mt-3">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              認証済み
                            </span>
                          </div>
                        )}
                      </div>

                      {/* 中央: メイン画像 (40%) */}
                      <div className="w-[40%]">
                        {mainImageUrl ? (
                          <div className="w-full h-64 bg-gray-100">
                            <img
                              src={mainImageUrl}
                              alt={shop.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-6xl">🀄</span>
                          </div>
                        )}
                      </div>

                      {/* 右: 詳細情報 (30%) */}
                      <div className="w-[30%] p-6 bg-white">
                        {/* 住所 */}
                        <p className="text-sm text-gray-600 mb-4">
                          📍 {shop.address_pref} {shop.address_city} {shop.address_town}
                        </p>

                        {/* 営業形態 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {shop.three_player_free && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              三麻フリー
                            </span>
                          )}
                          {shop.four_player_free && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              四麻フリー
                            </span>
                          )}
                          {shop.set && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                              セット
                            </span>
                          )}
                        </div>

                        {/* 卓数情報 */}
                        <div className="space-y-3 pt-4 border-t border-gray-200">
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">総卓数</span>
                            <span className="text-lg font-semibold text-gray-900">{shop.table_count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">点数卓</span>
                            <span className="text-lg font-semibold text-gray-900">{shop.score_table_count}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs text-gray-500">全自動卓</span>
                            <span className="text-lg font-semibold text-gray-900">{shop.auto_table_count}</span>
                          </div>
                        </div>

                        {/* プラン情報 */}
                        {shop.active_plan && (
                          <div className="mt-4 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">プラン</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                shop.active_plan.plan_type === 'free' 
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {shop.active_plan.plan_type === 'free' ? 'フリー' : '有料'}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
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