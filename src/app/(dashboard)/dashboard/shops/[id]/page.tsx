// src/app/(dashboard)/dashboard/shops/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMyShop } from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

const formatPostalCode = (code: string | null | undefined): string => {
  if (!code || code.length !== 7) return '';
  return `〒${code.slice(0, 3)}-${code.slice(3)}`;
};

export default function ShopOverviewPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadShop = async () => {
      console.log('=== ページ: 店舗詳細取得開始 ===', { shopId });
      
      try {
        const response = await getMyShop(Number(shopId));
        console.log('=== ページ: 店舗詳細取得レスポンス ===', response);
        
        if (response.success && response.data) {
          setShop(response.data);
        }
      } catch (err: any) {
        console.error('=== ページ: 店舗詳細取得エラー ===', err);
        setError(err.response?.data?.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

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

  // 営業形態をチェック
  const hasThreePlayerFree = shop?.frees?.some(free => free.game_format === 'THREE_PLAYER');
  const hasFourPlayerFree = shop?.frees?.some(free => free.game_format === 'FOUR_PLAYER');
  const hasSet = shop?.set !== null && shop?.set !== undefined;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop) {
    return <ErrorMessage message={error || "店舗情報が見つかりません。"} />;
  }

  const mainImageUrl = getMainImageUrl(shop.main_image_paths);

  return (
    <div className="space-y-6">
      {/* 非公開中の警告メッセージ */}
      {!shop.is_verified && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                この店舗は現在非公開です
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  管理事務局による確認が完了していないため、公開ページには表示されていません。
                  確認が完了次第、自動的に公開されます。
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">店舗概要</h1>
        <p className="text-gray-600">
          店舗の基本情報と設定状況を確認できます。
        </p>
      </div>

      {/* メイン画像 */}
      {mainImageUrl && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <img
            src={mainImageUrl}
            alt={shop.name}
            className="w-full h-64 object-cover"
          />
        </div>
      )}

      {/* 基本情報カード */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">基本情報</h2>
          <Link
            href={`/dashboard/shops/${shopId}/basic`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            編集 →
          </Link>
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-sm text-gray-500">店舗名</span>
            <p className="text-gray-900 font-medium">{shop.name}</p>
          </div>

          {shop.phone && (
            <div>
              <span className="text-sm text-gray-500">電話番号</span>
              <p className="text-gray-900">{shop.phone}</p>
            </div>
          )}

          {shop.website_url && (
            <div>
              <span className="text-sm text-gray-500">ウェブサイト</span>
              <p className="text-gray-900 truncate">
                <a
                  href={shop.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {shop.website_url}
                </a>
              </p>
            </div>
          )}

          {shop.open_hours && (
            <div>
              <span className="text-sm text-gray-500">営業時間</span>
              <p className="text-gray-900">{shop.open_hours}</p>
            </div>
          )}

          <div>
            <span className="text-sm text-gray-500">住所</span>
            <p className="text-gray-900">
              {shop.postal_code && (
                <span className="block text-sm mb-1">
                  {formatPostalCode(shop.postal_code)}
                </span>
              )}
              {shop.address_pref} {shop.address_city} {shop.address_town}{" "}
              {shop.address_street}
            </p>
          </div>

          {shop.description && (
            <div>
              <span className="text-sm text-gray-500">説明</span>
              <p className="text-gray-900">{shop.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* 営業形態カード */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-gray-900">営業形態</h2>
          <Link
            href={`/dashboard/shops/${shopId}/business`}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            編集 →
          </Link>
        </div>

        <div className="flex flex-wrap gap-2">
          {hasThreePlayerFree && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              三麻フリー
            </span>
          )}
          {hasFourPlayerFree && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              四麻フリー
            </span>
          )}
          {hasSet && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-orange-100 text-orange-800">
              セット
            </span>
          )}
          {!hasThreePlayerFree && !hasFourPlayerFree && !hasSet && (
            <p className="text-sm text-gray-500">営業形態が設定されていません</p>
          )}
        </div>
      </div>

      {/* 卓数情報カード */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">卓数情報</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">総卓数</p>
            <p className="text-3xl font-bold text-gray-900">{shop.table_count}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">点数卓</p>
            <p className="text-3xl font-bold text-gray-900">{shop.score_table_count}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-500 mb-1">全自動卓</p>
            <p className="text-3xl font-bold text-gray-900">{shop.auto_table_count}</p>
          </div>
        </div>
      </div>

      {/* ステータスカード */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">ステータス</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">認証状態</span>
            {shop.is_verified ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                認証済み
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                未認証
              </span>
            )}
          </div>

          {shop.active_plan && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">現在のプラン</span>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                shop.active_plan.plan_type === 'free'
                  ? 'bg-gray-100 text-gray-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {shop.active_plan.plan_type === 'free' ? 'フリープラン' : '有料プラン'}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-gray-600">作成日</span>
            <span className="text-gray-900">
              {new Date(shop.created_at).toLocaleDateString('ja-JP')}
            </span>
          </div>

          {shop.updated_at && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">最終更新日</span>
              <span className="text-gray-900">
                {new Date(shop.updated_at).toLocaleDateString('ja-JP')}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}