// src/app/[prefecture]/[city]/shops/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Train,
  Coins,
  User,
  Users,
  Building2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Home,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { getShop, getShopGalleryImages } from "@/lib/api/shops";
import { getShopBlogPosts } from "@/lib/api/blogs";
import {
  Shop,
  ShopImage,
  DAY_OF_WEEK_SHORT_LABELS,
  BlogPost,
} from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

const formatPostalCode = (code: string | null | undefined): string => {
  if (!code || code.length !== 7) return "";
  return `${code.slice(0, 3)}-${code.slice(3)}`;
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export default function ShopPublicPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [galleryImages, setGalleryImages] = useState<ShopImage[]>([]);
  const [recentBlogPosts, setRecentBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // スライダー用state
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 店舗情報取得
        const shopResponse = await getShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報が見つかりません");
        }
        setShop(shopResponse.data);

        // ギャラリー画像取得（有料プランの場合）
        const isPaid =
          shopResponse.data.active_plan?.plan_type === "paid" &&
          shopResponse.data.active_plan?.status === "active";

        if (isPaid) {
          const imagesResponse = await getShopGalleryImages(Number(shopId));
          if (imagesResponse.success && imagesResponse.data) {
            setGalleryImages(imagesResponse.data);
          }

          // ブログ最新記事取得（有料プランのみ）
          const blogResponse = await getShopBlogPosts(Number(shopId), {
            per_page: 5,
            sort_by: "published_at",
            sort_direction: "desc",
          });
          if (blogResponse.success && blogResponse.data) {
            setRecentBlogPosts(blogResponse.data.data);
          }
        }
      } catch (err: any) {
        console.error("データ取得エラー:", err);
        setError(err.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // 画像URLを取得
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

  // プラン判定（より安全な判定）
  const isPaidPlan =
    shop?.active_plan?.plan_type === "paid" &&
    shop?.active_plan?.status === "active";

  // スライダー用の画像配列を作成
  const getSliderImages = () => {
    const images: { url: string; alt: string }[] = [];

    // メイン画像
    const mainImageUrl = getImageUrl(shop?.main_image_paths, "large");
    if (mainImageUrl) {
      images.push({ url: mainImageUrl, alt: shop?.name || "店舗画像" });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error || "店舗情報が見つかりません"} />
      </div>
    );
  }

  const logoImageUrl = getImageUrl(shop.logo_image_paths);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ========================================
          パンくずリスト
      ======================================== */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link
              href="/"
              className="hover:text-blue-600 flex items-center gap-1"
            >
              <Home className="w-4 h-4" />
              トップ
            </Link>
            <ChevronRight className="w-4 h-4" />
            {shop.prefecture && (
              <>
                <Link
                  href={`${shop.prefecture.slug}`}
                  className="hover:text-blue-600"
                >
                  {shop.prefecture.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            {shop.city && (
              <>
                <Link
                  href={`/${shop.prefecture_slug}/${shop.city.slug}`}
                  className="hover:text-blue-600"
                >
                  {shop.city.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <span className="text-gray-900 font-medium">{shop.name}</span>
          </div>
        </div>
      </div>

      {/* ========================================
          1. ヘッダー画像エリア
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
          2. 最重要情報エリア
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

      {/* ========================================
          3. 店舗説明文
      ======================================== */}
      {shop.description && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              店舗について
            </h2>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
              {shop.description}
            </p>
          </div>
        </div>
      )}

      {/* ========================================
          4. 営業時間
      ======================================== */}
      {shop.business_hours && shop.business_hours.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-blue-600" />
              営業時間
            </h2>

            {/* 横長テーブル */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    {shop.business_hours
                      .filter((hour) => hour.day_of_week <= 6)
                      .map((hour) => (
                        <th
                          key={hour.day_of_week}
                          className="px-2 py-2 text-center text-sm font-semibold text-gray-700"
                        >
                          {DAY_OF_WEEK_SHORT_LABELS[hour.day_of_week]}
                        </th>
                      ))}
                    {shop.business_hours.find((h) => h.day_of_week === 7) && (
                      <th className="px-2 py-2 text-center text-sm font-semibold text-gray-700">
                        {DAY_OF_WEEK_SHORT_LABELS[7]}
                      </th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {shop.business_hours
                      .filter((hour) => hour.day_of_week <= 6)
                      .map((hour) => (
                        <td
                          key={hour.day_of_week}
                          className={`px-2 py-3 text-center text-sm border-r border-gray-100 last:border-0 ${
                            hour.is_closed
                              ? "text-red-600 font-medium"
                              : "text-gray-900"
                          }`}
                        >
                          {hour.display_text}
                        </td>
                      ))}
                    {shop.business_hours.find((h) => h.day_of_week === 7) && (
                      <td
                        className={`px-2 py-3 text-center text-sm ${
                          shop.business_hours.find((h) => h.day_of_week === 7)
                            ?.is_closed
                            ? "text-red-600 font-medium"
                            : "text-gray-900"
                        }`}
                      >
                        {
                          shop.business_hours.find((h) => h.day_of_week === 7)
                            ?.display_text
                        }
                      </td>
                    )}
                  </tr>
                </tbody>
              </table>
            </div>

            {/* 営業時間補足 */}
            {shop.open_hours_text && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                {shop.open_hours_text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================
          5. アクセス・連絡先
      ======================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            アクセス・連絡先
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 左カラム：連絡先情報 */}
            <div className="space-y-4">
              {/* 住所 */}
              <div>
                <div className="flex items-start mb-2">
                  <MapPin className="w-5 h-5 mr-2 text-red-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">住所</h3>
                    <div className="text-gray-700">
                      {shop.postal_code && (
                        <p className="text-sm text-gray-600 mb-1">
                          〒{formatPostalCode(shop.postal_code)}
                        </p>
                      )}
                      <p>
                        {shop.address_pref}
                        {shop.address_city}
                        {shop.address_town}
                        {shop.address_street && ` ${shop.address_street}`}
                        {shop.address_building && ` ${shop.address_building}`}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 最寄り駅詳細 */}
              {(shop.nearest_station ||
                (shop.sub_stations && shop.sub_stations.length > 0)) && (
                <div>
                  <div className="flex items-start mb-2">
                    <Train className="w-5 h-5 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        最寄り駅
                      </h3>

                      {/* メイン駅 */}
                      {shop.nearest_station && (
                        <div className="mb-2">
                          <p className="text-gray-900 font-medium">
                            {shop.nearest_station.line_name}{" "}
                            {shop.nearest_station.name}
                          </p>
                          {shop.nearest_station.walking_minutes && (
                            <p className="text-sm text-gray-600">
                              徒歩 約{shop.nearest_station.walking_minutes}分
                              {shop.nearest_station.distance_km && (
                                <span className="ml-2">
                                  ({shop.nearest_station.distance_km.toFixed(1)}
                                  km)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                      )}

                      {/* サブ駅 */}
                      {shop.sub_stations && shop.sub_stations.length > 0 && (
                        <div className="space-y-1 text-sm">
                          {shop.sub_stations.map((station, index) => (
                            <p key={index} className="text-gray-600">
                              {station.line_name} {station.name}
                              {station.walking_minutes &&
                                ` 徒歩${station.walking_minutes}分`}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 電話番号 */}
              {shop.phone && (
                <div>
                  <div className="flex items-start">
                    <Phone className="w-5 h-5 mr-2 text-green-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        電話番号
                      </h3>
                      <a
                        href={`tel:${shop.phone}`}
                        className="text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        {shop.phone}
                      </a>
                    </div>
                  </div>
                </div>
              )}

              {/* ウェブサイト */}
              {shop.website_url && (
                <div>
                  <div className="flex items-start">
                    <Globe className="w-5 h-5 mr-2 text-purple-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        ウェブサイト
                      </h3>
                      <a
                        href={shop.website_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center"
                      >
                        公式サイトを開く
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 右カラム：地図 */}
            {shop.lat && shop.lng && (
              <div>
                <div className="w-full h-80 bg-gray-100 rounded-lg overflow-hidden">
                  <iframe
                    src={`https://www.google.com/maps?q=${shop.lat},${shop.lng}&output=embed&z=16`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="店舗の地図"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========================================
          6. LINE連携（有料プランのみ）
      ======================================== */}
      {isPaidPlan &&
        (shop.line_official_id ||
          shop.line_add_url ||
          shop.line_qr_code_url) && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg shadow p-6 border border-green-200">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                LINE公式アカウント
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* LINE情報 */}
                <div className="space-y-4">
                  {shop.line_official_id && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">LINE ID</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {shop.line_official_id}
                      </p>
                    </div>
                  )}

                  {shop.line_add_url && (
                    <div>
                      <a
                        href={shop.line_add_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium shadow-md"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"></path>
                        </svg>
                        友だち追加
                      </a>
                    </div>
                  )}

                  <p className="text-sm text-gray-600">
                    LINEで最新情報やお得なクーポンを受け取れます
                  </p>
                </div>

                {/* QRコード */}
                {shop.line_qr_code_url && (
                  <div className="flex items-center justify-center">
                    <div className="bg-white p-4 rounded-lg shadow">
                      <img
                        src={shop.line_qr_code_url}
                        alt="LINE友だち追加QRコード"
                        className="w-48 h-48 object-contain"
                      />
                      <p className="text-xs text-center text-gray-600 mt-2">
                        QRコードで友だち追加
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      {/* ========================================
          7. 提供サービス
      ======================================== */}
      {shop.services && shop.services.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              提供サービス
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {shop.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center text-gray-700"
                >
                  <span className="text-green-600 mr-2 text-lg">✓</span>
                  <span>{service.display_name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          8. ルール
      ======================================== */}
      {shop.rules && shop.rules.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">店舗ルール</h2>

            {/* 横長テーブル */}
            <div className="overflow-x-auto">
              {(() => {
                // カテゴリ別にグループ化
                const groupedRules: { [category: string]: typeof shop.rules } =
                  {};
                shop.rules.forEach((rule) => {
                  const category = rule.category_name || "その他";
                  if (!groupedRules[category]) {
                    groupedRules[category] = [];
                  }
                  groupedRules[category].push(rule);
                });

                return (
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b-2 border-gray-300">
                        {Object.entries(groupedRules).map(([category]) => (
                          <th
                            key={category}
                            className="px-4 py-3 text-left text-sm font-semibold text-gray-700 bg-gray-50"
                          >
                            {category}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {Object.entries(groupedRules).map(
                          ([category, rules]) => (
                            <td
                              key={category}
                              className="px-4 py-3 align-top border-r border-gray-200 last:border-r-0"
                            >
                              <div className="space-y-1">
                                {rules.map((rule) => (
                                  <div
                                    key={rule.id}
                                    className="text-sm text-gray-900"
                                  >
                                    {rule.display_name || rule.rule}
                                  </div>
                                ))}
                              </div>
                            </td>
                          )
                        )}
                      </tr>
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          9. メニュー
      ======================================== */}
      {shop.menus && shop.menus.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">メニュー</h2>

            {/* カテゴリ別にグループ化 */}
            {(() => {
              const groupedMenus: { [category: string]: typeof shop.menus } =
                {};
              shop.menus
                .filter((menu) => menu.is_available)
                .forEach((menu) => {
                  const category = menu.category_display || "その他";
                  if (!groupedMenus[category]) {
                    groupedMenus[category] = [];
                  }
                  groupedMenus[category].push(menu);
                });

              return (
                <div className="space-y-6">
                  {Object.entries(groupedMenus).map(([category, menus]) => (
                    <div key={category}>
                      <h3 className="text-lg font-semibold text-gray-800 mb-3 border-b pb-2">
                        {category}
                      </h3>
                      <div className="space-y-3">
                        {menus.map((menu) => (
                          <div
                            key={menu.id}
                            className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">
                                {menu.item_name}
                              </h4>
                              {menu.description && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {menu.description}
                                </p>
                              )}
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="text-lg font-semibold text-gray-900">
                                ¥{menu.price.toLocaleString()}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ========================================
          10. ブログ最新記事（有料プランのみ）
      ======================================== */}
      {isPaidPlan && recentBlogPosts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                ブログ
              </h2>
              <Link
                href={`/${shop.prefecture.slug}/${shop.city.slug}/shops/${shopId}/blog`}
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1 text-sm"
              >
                すべて見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* リスト型レイアウト */}
            <div className="space-y-4">
              {recentBlogPosts.map((post) => {
                // サムネイル画像を取得（thumbnail_pathsまたはcontentから）
                let thumbnailUrl =
                  post.thumbnail_url ||
                  getImageUrl(post.thumbnail_paths, "medium");

                // thumbnail_pathsがnullの場合、contentから最初の画像を抽出
                if (!thumbnailUrl && post.content) {
                  const imgMatch = post.content.match(
                    /<img[^>]+src="([^">]+)"/
                  );
                  if (imgMatch) {
                    thumbnailUrl = imgMatch[1];
                  }
                }

                return (
                  <Link
                    key={post.id}
                    href={`/${shop.prefecture.slug}/${shop.city.slug}/shops/${shopId}/blog/${post.id}`}
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                  >
                    {/* サムネイル画像（左側・固定サイズ） */}
                    <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg overflow-hidden">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Calendar className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    {/* 記事情報（右側） */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(post.published_at)}</span>
                        </div>
                        {post.author && (
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{post.author.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* 矢印アイコン */}
                    <div className="flex-shrink-0 flex items-center">
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* すべて見るボタン（下部） */}
            <div className="mt-6 text-center">
              <Link
                href={`/shops/${shopId}/blog`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                ブログ記事一覧を見る
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* フッター余白 */}
      <div className="h-12" />
    </div>
  );
}
