// src/app/(dashboard)/dashboard/shops/[id]/blog/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Edit, Trash2, Eye, AlertCircle, FileText } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getMyBlogPosts, deleteBlogPost, createBlogPost } from "@/lib/api/blogs"; // createBlogPost追加
import { Shop, BlogPost } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

export default function BlogListPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [creating, setCreating] = useState(false); // 追加
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // フィルター
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'DRAFT' | 'PUBLISHED'>('ALL');

  useEffect(() => {
    loadData();
  }, [shopId, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);

      // ブログ投稿一覧取得
      const postsResponse = await getMyBlogPosts({
        shop_id: Number(shopId),
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        per_page: 50,
      });

      if (postsResponse.success && postsResponse.data) {
        setPosts(postsResponse.data.data || []);
      }
    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 新規下書き作成
  const handleCreateNew = async () => {
    setCreating(true);
    setError("");

    try {
      const result = await createBlogPost({
        shop_id: Number(shopId),
        title: '無題',
        content: '',
        status: 'DRAFT',
      });

      if (!result.success || !result.data) {
        throw new Error(result.message || "下書きの作成に失敗しました");
      }

      // 編集ページへリダイレクト
      router.push(`/dashboard/shops/${shopId}/blog/${result.data.id}/edit`);
    } catch (err: any) {
      console.error("下書き作成エラー:", err);
      setError(err.message || "下書きの作成に失敗しました。");
      setCreating(false);
    }
  };

  const handleDelete = async (postId: number) => {
    if (!confirm("この記事を削除してもよろしいですか？")) return;

    setDeleting(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await deleteBlogPost(postId);

      if (!result.success) {
        throw new Error(result.message || "記事の削除に失敗しました");
      }

      setSuccessMessage("記事を削除しました。");
      await loadData();
    } catch (err: any) {
      console.error("記事削除エラー:", err);
      setError(err.message || "記事の削除に失敗しました。");
    } finally {
      setDeleting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            公開中
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            下書き
          </span>
        );
      case 'ARCHIVED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            アーカイブ
          </span>
        );
      default:
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

  if (!shop) {
    return <ErrorMessage message="店舗情報が見つかりません。" />;
  }

  const canUseBlog = shop.plan_info?.can_use_blog;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ブログ管理</h1>
            <p className="text-gray-600">
              お知らせやイベント情報を発信できます
            </p>
          </div>
          {!canUseBlog && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              🔒 有料プラン限定
            </span>
          )}
        </div>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {!canUseBlog ? (
        /* 無料プランの場合：ロック表示 */
        <div className="bg-white rounded-lg shadow p-6">
          <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                有料プラン限定機能
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                有料プランにアップグレードすると、ブログ機能を使って
                お知らせやイベント情報、雀荘の魅力を発信できます。
                SEO対策にも効果的です。
              </p>
              <a
                href={`/dashboard/shops/${shopId}/plan`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                有料プランを見る →
              </a>
            </div>
          </div>
        </div>
      ) : (
        /* 有料プランの場合：ブログ管理UI */
        <>
          {/* アクションバー */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">
                  絞り込み:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ALL">すべて</option>
                  <option value="PUBLISHED">公開中</option>
                  <option value="DRAFT">下書き</option>
                </select>
              </div>

              <button
                onClick={handleCreateNew}
                disabled={creating}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4 mr-2" />
                {creating ? '作成中...' : '新規作成'}
              </button>
            </div>
          </div>

          {/* ブログ投稿一覧 */}
          {posts.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12">
              <div className="text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  {statusFilter === 'ALL'
                    ? 'まだブログ記事がありません'
                    : `${statusFilter === 'PUBLISHED' ? '公開中' : '下書き'}の記事がありません`}
                </p>
                <button
                  onClick={handleCreateNew}
                  disabled={creating}
                  className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {creating ? '作成中...' : '最初の記事を書く'}
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
              {posts.map((post) => (
                <div key={post.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {post.title}
                        </h3>
                        {getStatusBadge(post.status)}
                      </div>

                      <div className="text-sm text-gray-500 mb-3">
                        {post.status === 'PUBLISHED' && post.published_at && (
                          <span>
                            公開日: {new Date(post.published_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                        {post.status === 'DRAFT' && (
                          <span>
                            更新日: {new Date(post.updated_at).toLocaleDateString('ja-JP')}
                          </span>
                        )}
                      </div>

                      <div className="text-sm text-gray-600 line-clamp-2">
                        {post.content 
                          ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + '...'
                          : '本文なし'}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <Link
                        href={`/shops/${shopId}/blog/${post.id}`}
                        target="_blank"
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="プレビュー"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        href={`/dashboard/shops/${shopId}/blog/${post.id}/edit`}
                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="編集"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>

                      <button
                        onClick={() => handleDelete(post.id)}
                        disabled={deleting}
                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                        title="削除"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}