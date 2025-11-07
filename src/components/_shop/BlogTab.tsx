// src/components/shop/BlogTab.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Calendar, ArrowRight } from 'lucide-react';
import { getShopBlogPosts } from '@/lib/api/blogs';
import { BlogPost } from '@/types/models';

interface BlogTabProps {
  shopId: number;
}

export default function BlogTab({ shopId }: BlogTabProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await getShopBlogPosts(shopId, { per_page: 5 });
        if (response.success && response.data) {
          setPosts(response.data.data);
        }
      } catch (error) {
        console.error('ブログ記事取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPosts();
  }, [shopId]);

  // サムネイルURL取得
  const getThumbnailUrl = (thumbnailPaths: any) => {
    if (!thumbnailPaths) return null;
    
    try {
      const paths = typeof thumbnailPaths === 'string' ? JSON.parse(thumbnailPaths) : thumbnailPaths;
      const relativePath = paths?.thumbnail || paths?.medium || paths?.original;
      
      if (!relativePath) return null;
      
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      return `${storageUrl}/${relativePath}`;
    } catch {
      return null;
    }
  };

  // 日付フォーマット
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-32 bg-gray-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📝</div>
        <p className="text-gray-500 text-lg">まだブログ記事がありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => {
        const thumbnailUrl = getThumbnailUrl(post.thumbnail_paths);
        
        return (
          <Link
            key={post.id}
            href={`/blogs/${post.id}`}
            className="block bg-white border border-gray-200 rounded-lg hover:shadow-md transition-all overflow-hidden group"
          >
            <div className="flex gap-4">
              {/* サムネイル */}
              <div className="w-48 h-32 flex-shrink-0 bg-gray-100 overflow-hidden">
                {thumbnailUrl ? (
                  <img
                    src={thumbnailUrl}
                    alt={post.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                    📝
                  </div>
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 p-4 min-w-0">
                <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {post.title}
                </h4>
                
                {/* 投稿日 */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(post.published_at || post.created_at)}</span>
                </div>

                {/* 抜粋 */}
                {post.content && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.content.replace(/<[^>]*>/g, '').substring(0, 100)}...
                  </p>
                )}
              </div>

              {/* 矢印 */}
              <div className="flex items-center pr-4">
                <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        );
      })}

      {/* もっと見るボタン */}
      {posts.length >= 5 && (
        <div className="text-center pt-4">
          <Link
            href={`/shops/${shopId}/blogs`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            すべての記事を見る
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </div>
  );
}