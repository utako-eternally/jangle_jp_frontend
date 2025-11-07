// src/app/(dashboard)/dashboard/shops/[id]/blog/[postId]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, ArrowLeft, Eye } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import {
  getMyBlogPost,
  createBlogPost,
  updateBlogPost,
  addBlogContentImage,
} from "@/lib/api/blogs";
import { Shop, BlogPost } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { TiptapEditor } from "@/components/editor/tiptap-editor";

export default function BlogEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;
  const postId = params.postId as string;
  const isNew = postId === 'new';

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // フォームデータ
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  // 変更検知
  const [hasChanges, setHasChanges] = useState(false);
  const [originalTitle, setOriginalTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [originalStatus, setOriginalStatus] = useState<'DRAFT' | 'PUBLISHED'>('DRAFT');

  useEffect(() => {
    loadData();
  }, [shopId, postId]);

  useEffect(() => {
    const changed =
      title !== originalTitle ||
      content !== originalContent ||
      status !== originalStatus;
    setHasChanges(changed);
  }, [title, content, status, originalTitle, originalContent, originalStatus]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);

      // 編集モードの場合はブログ投稿を取得
      if (!isNew) {
        const postResponse = await getMyBlogPost(Number(postId));
        if (postResponse.success && postResponse.data) {
          const post = postResponse.data;
          setTitle(post.title);
          setContent(post.content);
          setStatus(post.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');

          setOriginalTitle(post.title);
          setOriginalContent(post.content);
          setOriginalStatus(post.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT');
        }
      }
    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 画像アップロード（Tiptap用）
  const handleImageUpload = async (file: File): Promise<string> => {
    try {
      // 新規作成時は先に下書き保存
      let currentPostId = postId;
      if (isNew && !currentPostId) {
        const result = await createBlogPost({
          shop_id: Number(shopId),
          title: title || '無題',
          content: content || '',
          status: 'DRAFT',
        });

        if (!result.success || !result.data) {
          throw new Error("記事の作成に失敗しました");
        }

        currentPostId = String(result.data.id);
        // URLを更新（新規作成→編集モードへ）
        router.replace(`/dashboard/shops/${shopId}/blog/${currentPostId}/edit`);
      }

      const result = await addBlogContentImage(Number(currentPostId), file);

      if (!result.success || !result.data?.image) {
        throw new Error("画像のアップロードに失敗しました");
      }

      return result.data.image.image_url;
    } catch (err: any) {
      console.error("画像アップロードエラー:", err);
      throw err;
    }
  };

  // 保存
  const handleSave = async (publishNow: boolean = false) => {
    if (!title.trim()) {
      setError("タイトルを入力してください。");
      return;
    }

    if (!content.trim()) {
      setError("本文を入力してください。");
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const saveStatus = publishNow ? 'PUBLISHED' : 'DRAFT';
      const data = {
        title: title.trim(),
        content,
        status: saveStatus,
        published_at: publishNow && saveStatus === 'PUBLISHED' ? new Date().toISOString() : undefined,
      };

      let result;
      if (isNew) {
        result = await createBlogPost({
          shop_id: Number(shopId),
          ...data,
        });

        if (result.success && result.data) {
          // 新規作成後は編集ページにリダイレクト
          router.replace(`/dashboard/shops/${shopId}/blog/${result.data.id}/edit`);
        }
      } else {
        result = await updateBlogPost(Number(postId), data);
      }

      if (!result.success) {
        console.error('保存エラーの詳細:', result);
        throw new Error(result.message || "記事の保存に失敗しました");
      }

      setSuccessMessage(
        publishNow
          ? "記事を公開しました。"
          : saveStatus === 'PUBLISHED'
          ? "記事を更新しました。"
          : "下書きを保存しました。"
      );

      // 初期値を更新
      setOriginalTitle(title);
      setOriginalContent(content);
      setOriginalStatus(saveStatus);
      setStatus(saveStatus);
      
      // データを再読み込み
      if (!isNew) {
        await loadData();
      }
    } catch (err: any) {
      console.error("記事保存エラー:", err);
      console.error("エラーレスポンス:", err.response);
      setError(err.response?.data?.message || err.message || "記事の保存に失敗しました。");
    } finally {
      setSaving(false);
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

  return (
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/dashboard/shops/${shopId}/blog`)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">
              {isNew ? '新規記事作成' : '記事編集'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isNew && (
              <a
                href={`/shops/${shopId}/blog/${postId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                プレビュー
              </a>
            )}

            <button
              onClick={() => handleSave(false)}
              disabled={saving}
              className={`inline-flex items-center px-4 py-2 rounded-lg font-medium transition-colors ${
                saving
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-600 text-white hover:bg-gray-700'
              }`}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? '保存中...' : '下書き保存'}
            </button>

            <button
              onClick={() => handleSave(true)}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:text-gray-500"
            >
              {saving ? '保存中...' : status === 'PUBLISHED' ? '更新して公開' : '公開'}
            </button>
          </div>
        </div>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* メインコンテンツ */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* タイトル */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="記事のタイトルを入力してください"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={saving}
            />
          </div>

          {/* 本文エディタ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              本文 <span className="text-red-500">*</span>
            </label>
            <TiptapEditor
              content={content}
              onChange={setContent}
              onImageUpload={handleImageUpload}
              editable={!saving}
            />
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 ブログ執筆のヒント
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• 画像をドラッグ＆ドロップで挿入できます</li>
              <li>• 見出しを使って読みやすい構成にしましょう</li>
              <li>• 定期的に下書き保存することをおすすめします</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}