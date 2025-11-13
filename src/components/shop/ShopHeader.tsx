// src/components/shop/ShopHeader.tsx
"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Train, Clock, Building2 } from "lucide-react";
import { Shop, ShopImage } from "@/types/models";

interface ShopHeaderProps {
  shop: Shop;
  galleryImages?: ShopImage[];
  isPaidPlan: boolean;
}

const getImageUrl = (
  imagePaths: any,
  size: "thumb" | "medium" | "large" | "original" = "medium"
) => {
  if (!imagePaths) return null;

  try {
    const paths =
      typeof imagePaths === "string" ? JSON.parse(imagePaths) : imagePaths;
    const relativePath = paths?.[size] || paths?.original;

    if (!relativePath) return null;

    const storageUrl =
      process.env.NEXT_PUBLIC_STORAGE_URL || "http://localhost:8000/storage";
    return `${storageUrl}/${relativePath}`;
  } catch {
    return null;
  }
};

export function ShopHeader({ shop, galleryImages = [], isPaidPlan }: ShopHeaderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // スライダー用の画像配列を作成
  const getSliderImages = () => {
    const images: { url: string; alt: string }[] = [];

    // メイン画像
    const mainImageUrl = getImageUrl(shop.main_image_paths, "large");
    if (mainImageUrl) {
      images.push({ url: mainImageUrl, alt: shop.name || "店舗画像" });
    }

    // ギャラリー画像（有料プランのみ）
    if (isPaidPlan && galleryImages.length > 0) {
      galleryImages.forEach((image) => {
        const url = image.large_url || image.medium_url || image.thumbnail_url;
        if (url) {
          images.push({ url, alt: image.alt_text || "店舗画像" });
        }
      });
    }

    return images;
  };

  const sliderImages = getSliderImages();
  const hasMultipleImages = sliderImages.length > 1;
  const logoImageUrl = getImageUrl(shop.logo_image_paths);

  // スライダー操作
  const goToPrevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? sliderImages.length - 1 : prev - 1
    );
  };

  const goToNextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === sliderImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <>
      {/* ========================================
          ヘッダー画像エリア
      ======================================== */}
      <div className="relative w-full bg-gray-900">
        {sliderImages.length > 0 ? (
          <div className="relative w-full aspect-[21/9] max-h-[400px]">
            {/* 画像表示 */}
            <div className="relative w-full h-full">
              <img
                src={sliderImages[currentImageIndex].url}
                alt={sliderImages[currentImageIndex].alt}
                className="w-full h-full object-cover"
              />

              {/* グラデーションオーバーレイ */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            {/* スライダーコントロール（複数画像がある場合のみ） */}
            {hasMultipleImages && (
              <>
                {/* 前へボタン */}
                <button
                  onClick={goToPrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  aria-label="前の画像"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                {/* 次へボタン */}
                <button
                  onClick={goToNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors z-10"
                  aria-label="次の画像"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>

                {/* インジケーター */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                  {sliderImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentImageIndex
                          ? "bg-white w-8"
                          : "bg-white/50 hover:bg-white/75"
                      }`}
                      aria-label={`画像${index + 1}を表示`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* ロゴ画像オーバーレイ */}
            {logoImageUrl && (
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden border-4 border-white z-10">
                <img
                  src={logoImageUrl}
                  alt={`${shop.name} ロゴ`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        ) : (
          /* 画像がない場合のプレースホルダー */
          <div className="relative w-full aspect-[21/9] max-h-[400px] bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
            <div className="text-center text-white/50">
              <Building2 className="w-16 h-16 mx-auto mb-2" />
              <p className="text-sm">画像未設定</p>
            </div>

            {/* ロゴ画像 */}
            {logoImageUrl && (
              <div className="absolute bottom-4 left-4 w-24 h-24 bg-white rounded-full shadow-lg overflow-hidden border-4 border-white">
                <img
                  src={logoImageUrl}
                  alt={`${shop.name} ロゴ`}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ========================================
          最重要情報エリア
      ======================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-lg shadow-xl p-6 mb-6">
          {/* 店舗名 */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{shop.name}</h1>

          {/* 最寄り駅 + 営業時間 */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-gray-700">
            {/* 最寄り駅 */}
            {shop.nearest_station && (
              <div className="flex items-center">
                <Train className="w-5 h-5 mr-2 text-blue-600" />
                <span className="font-medium">
                  {shop.nearest_station.name}駅徒歩
                  {shop.nearest_station.walking_minutes}分
                </span>
              </div>
            )}

            {/* 本日の営業状況 */}
            {shop.today_business_hour && (
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600">本日</span>
                <span
                  className={`font-medium ${
                    shop.today_business_hour.is_open_now
                      ? "text-green-600"
                      : "text-gray-600"
                  }`}
                >
                  {shop.today_business_hour.display_text}
                </span>
                {shop.today_business_hour.is_open_now && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                    営業中
                  </span>
                )}
              </div>
            )}
          </div>

          {/* 営業形態バッジ + 料金 */}
          {((shop.frees && shop.frees.length > 0) || shop.set) && (
            <div className="flex flex-wrap gap-2 mb-3">
              {shop.frees &&
                shop.frees.map((free) => {
                  const minPrice = free.summary?.min_price ?? free.price;
                  const maxPrice = free.summary?.max_price ?? free.price;

                  return (
                    <span
                      key={free.id}
                      className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
                        free.game_format === "THREE_PLAYER"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {free.game_format_display}
                      {minPrice !== null && minPrice !== undefined && (
                        <span className="ml-2 font-semibold">
                          {minPrice === maxPrice
                            ? `¥${minPrice.toLocaleString()}`
                            : `¥${minPrice.toLocaleString()}〜`}
                        </span>
                      )}
                    </span>
                  );
                })}

              {shop.set &&
                (() => {
                  const minPrice =
                    shop.set.price_summary?.overall_min_price ?? shop.set.price;

                  return (
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                      セット
                      {minPrice !== null && minPrice !== undefined && (
                        <span className="ml-2 font-semibold">
                          ¥{minPrice.toLocaleString()}〜
                        </span>
                      )}
                    </span>
                  );
                })()}
            </div>
          )}

          {/* 店舗特徴タグ */}
          {shop.features && shop.features.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {shop.features.map((feature) => (
                <span
                  key={feature.id}
                  className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-700"
                >
                  {feature.display_name || feature.feature}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}