"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Home, Calendar, User, ArrowLeft } from "lucide-react";
import { getBlogPost } from "@/lib/api/blogs";
import { getShop, getShopGalleryImages } from "@/lib/api/shops";
import { BlogPost, Shop, ShopImage } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { ShopHeader } from "@/components/shop/ShopHeader";

const formatDate = (dateString: string | null): string => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const getImageUrl = (
  imagePaths: any,
  size: "thumb" | "medium" | "large" | "original" = "large"
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

export default function BlogPostDetailPage() {
  const params = useParams();
  const shopId = params.id as string;
  const postId = params.postId as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [post, setPost] = useState<BlogPost | null>(null);
  const [galleryImages, setGalleryImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
        }

        // ブログ記事取得
        const postResponse = await getBlogPost(Number(postId));
        if (!postResponse.success || !postResponse.data) {
          throw new Error(postResponse.error || "記事が見つかりません");
        }

        // 記事の店舗IDが一致するか確認
        if (postResponse.data.shop_id !== Number(shopId)) {
          throw new Error("記事が見つかりません");
        }

        setPost(postResponse.data);
      } catch (err: any) {
        console.error("データ取得エラー:", err);
        setError(err.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId, postId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop || !post) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <ErrorMessage message={error || "記事が見つかりません"} />
      </div>
    );
  }

  const isPaidPlan =
    shop?.active_plan?.plan_type === "paid" &&
    shop?.active_plan?.status === "active";

  const thumbnailUrl =
    post.thumbnail_url || getImageUrl(post.thumbnail_paths, "large");

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずリスト */}
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
                  href={`/prefectures/${shop.prefecture.slug}`}
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
                  href={`/cities/${shop.prefecture_slug}/${shop.city.slug}`}
                  className="hover:text-blue-600"
                >
                  {shop.city.name}
                </Link>
                <ChevronRight className="w-4 h-4" />
              </>
            )}
            <Link href={`/shops/${shopId}`} className="hover:text-blue-600">
              {shop.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link
              href={`/shops/${shopId}/blog`}
              className="hover:text-blue-600"
            >
              ブログ
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium line-clamp-1">
              {post.title}
            </span>
          </div>
        </div>
      </div>

      {/* 店舗情報ヘッダー */}
      <ShopHeader
        shop={shop}
        galleryImages={galleryImages}
        isPaidPlan={isPaidPlan}
      />

      {/* 記事本文 */}
      <article className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 記事ヘッダー */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          {/* サムネイル画像 */}
          {thumbnailUrl && (
            <div className="relative w-full aspect-video bg-gray-200">
              <img
                src={thumbnailUrl}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 sm:p-8">
            {/* タイトル */}
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              {post.title}
            </h1>

            {/* メタ情報 */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 pb-6 border-b border-gray-200">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(post.published_at)}</span>
              </div>
              {post.author && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author.name}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 記事コンテンツ */}
        <div className="bg-white rounded-lg shadow p-6 sm:p-8 mb-6">
          {post.content ? (
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-bold
                prose-h1:text-3xl prose-h1:mb-4
                prose-h2:text-2xl prose-h2:mb-3 prose-h2:mt-8
                prose-h3:text-xl prose-h3:mb-2 prose-h3:mt-6
                prose-p:mb-4 prose-p:leading-relaxed
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-img:rounded-lg prose-img:shadow-md
                prose-strong:font-semibold prose-strong:text-gray-900
                prose-ul:mb-4 prose-ol:mb-4
                prose-li:mb-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          ) : (
            <p className="text-gray-500">本文がありません</p>
          )}
        </div>

        {/* 記事一覧へのリンク（下部） */}
        <div className="mt-8 text-center">
          <Link
            href={`/shops/${shopId}/blog`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            記事一覧に戻る
          </Link>
        </div>
      </article>
    </div>
  );
}
