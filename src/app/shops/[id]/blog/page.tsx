"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Home, Calendar, User } from "lucide-react";
import { getShopBlogPosts } from "@/lib/api/blogs";
import { getShop, getShopGalleryImages } from "@/lib/api/shops";
import { BlogPost, Shop, ShopImage } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { ShopHeader } from "@/components/shop/ShopHeader";

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const getImageUrl = (imagePaths: any, size: 'thumb' | 'medium' | 'large' | 'original' = 'medium') => {
  if (!imagePaths) return null;
  
  try {
    const paths = typeof imagePaths === 'string' ? JSON.parse(imagePaths) : imagePaths;
    const relativePath = paths?.[size] || paths?.original;
    
    if (!relativePath) return null;
    
    const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
    return `${storageUrl}/${relativePath}`;
  } catch {
    return null;
  }
};

const createExcerpt = (content: string | null, maxLength: number = 150): string => {
  if (!content) return '';
  
  // HTMLタグを除去
  const text = content.replace(/<[^>]*>/g, '');
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength) + '...';
};

export default function ShopBlogPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const shopId = params.id as string;
  const currentPage = parseInt(searchParams.get('page') || '1');

  const [shop, setShop] = useState<Shop | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [galleryImages, setGalleryImages] = useState<ShopImage[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });
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

        // ブログ記事一覧取得
        const postsResponse = await getShopBlogPosts(Number(shopId), {
          page: currentPage,
          per_page: 12,
          sort_by: 'published_at',
          sort_direction: 'desc',
        });

        if (!postsResponse.success || !postsResponse.data) {
          throw new Error(postsResponse.error || "記事の取得に失敗しました");
        }

        setPosts(postsResponse.data.data);
        setPagination({
          current_page: postsResponse.data.current_page,
          last_page: postsResponse.data.last_page,
          per_page: postsResponse.data.per_page,
          total: postsResponse.data.total,
        });
      } catch (err: any) {
        console.error("データ取得エラー:", err);
        setError(err.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId, currentPage]);

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

  const isPaidPlan =
    shop?.active_plan?.plan_type === "paid" &&
    shop?.active_plan?.status === "active";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* パンくずリスト */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link href="/" className="hover:text-blue-600 flex items-center gap-1">
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
            <Link
              href={`/shops/${shopId}`}
              className="hover:text-blue-600"
            >
              {shop.name}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">ブログ</span>
          </div>
        </div>
      </div>

      {/* 店舗情報ヘッダー */}
      <ShopHeader shop={shop} galleryImages={galleryImages} isPaidPlan={isPaidPlan} />

      {/* ブログタイトル */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ブログ
          </h2>
          <p className="text-gray-600">
            最新情報やお知らせをお届けします
          </p>
        </div>
      </div>

      {/* 記事一覧 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {posts.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-500">まだ記事が投稿されていません</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => {
                // サムネイル画像を取得（店舗トップページと同じロジック）
                let thumbnailUrl = post.thumbnail_url || getImageUrl(post.thumbnail_paths, 'medium');
                
                // thumbnail_pathsがnullの場合、contentから最初の画像を抽出
                if (!thumbnailUrl && post.content) {
                  const imgMatch = post.content.match(/<img[^>]+src="([^">]+)"/);
                  if (imgMatch) {
                    thumbnailUrl = imgMatch[1];
                  }
                }
                
                return (
                  <Link
                    key={post.id}
                    href={`/shops/${shopId}/blog/${post.id}`}
                    className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                  >
                    {/* サムネイル画像 */}
                    <div className="relative w-full aspect-video bg-gray-200">
                      {thumbnailUrl ? (
                        <img
                          src={thumbnailUrl}
                          alt={post.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <Calendar className="w-12 h-12" />
                        </div>
                      )}
                    </div>

                    {/* 記事情報 */}
                    <div className="p-4">
                      <h2 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                        {post.title}
                      </h2>
                      
                      {post.excerpt && (
                        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                          {post.excerpt || createExcerpt(post.content)}
                        </p>
                      )}

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
                  </Link>
                );
              })}
            </div>

            {/* ページネーション */}
            {pagination.last_page > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                {/* 前へボタン */}
                {pagination.current_page > 1 && (
                  <Link
                    href={`/shops/${shopId}/blog?page=${pagination.current_page - 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    前へ
                  </Link>
                )}

                {/* ページ番号 */}
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                    .filter(page => {
                      // 現在のページの前後2ページを表示
                      return (
                        page === 1 ||
                        page === pagination.last_page ||
                        Math.abs(page - pagination.current_page) <= 2
                      );
                    })
                    .map((page, index, array) => {
                      // ページ番号の間に省略記号を挿入
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      
                      return (
                        <div key={page} className="flex items-center gap-2">
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <Link
                            href={`/shops/${shopId}/blog?page=${page}`}
                            className={`px-4 py-2 rounded-lg ${
                              page === pagination.current_page
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </Link>
                        </div>
                      );
                    })}
                </div>

                {/* 次へボタン */}
                {pagination.current_page < pagination.last_page && (
                  <Link
                    href={`/shops/${shopId}/blog?page=${pagination.current_page + 1}`}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                  >
                    次へ
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}