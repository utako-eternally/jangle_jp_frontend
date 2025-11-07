// src/app/(dashboard)/dashboard/shops/[id]/line/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Trash2, Save, AlertCircle, ExternalLink, Download } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import {
  getShopLineInfo,
  updateShopLineInfo,
  uploadLineQrCode,
  deleteLineQrCode,
} from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

export default function LinePage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // LINE情報
  const [lineOfficialId, setLineOfficialId] = useState("");
  const [lineAddUrl, setLineAddUrl] = useState("");
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [hasLineAccount, setHasLineAccount] = useState(false);

  // 変更検知
  const [hasChanges, setHasChanges] = useState(false);
  const [originalLineOfficialId, setOriginalLineOfficialId] = useState("");
  const [originalLineAddUrl, setOriginalLineAddUrl] = useState("");

  // データ取得
  useEffect(() => {
    loadData();
  }, [shopId]);

  // 変更検知
  useEffect(() => {
    const changed =
      lineOfficialId !== originalLineOfficialId ||
      lineAddUrl !== originalLineAddUrl;
    setHasChanges(changed);
  }, [lineOfficialId, lineAddUrl, originalLineOfficialId, originalLineAddUrl]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);

      // LINE情報取得
      const lineResponse = await getShopLineInfo(Number(shopId));
      if (lineResponse.success && lineResponse.data) {
        const lineData = lineResponse.data;
        setLineOfficialId(lineData.line_official_id || "");
        setLineAddUrl(lineData.line_add_url || "");
        setQrCodeUrl(lineData.line_qr_code_url || null);
        setHasLineAccount(lineData.has_line_account || false);

        // 初期値を保存
        setOriginalLineOfficialId(lineData.line_official_id || "");
        setOriginalLineAddUrl(lineData.line_add_url || "");
      }
    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // LINE情報を保存
  const handleSaveLineInfo = async () => {
    setSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await updateShopLineInfo(Number(shopId), {
        line_official_id: lineOfficialId || null,
        line_add_url: lineAddUrl || null,
      });

      if (!result.success) {
        throw new Error(result.message || "LINE情報の保存に失敗しました");
      }

      setSuccessMessage("LINE情報を保存しました。");
      setOriginalLineOfficialId(lineOfficialId);
      setOriginalLineAddUrl(lineAddUrl);
      setHasLineAccount(result.data?.has_line_account || false);
    } catch (err: any) {
      console.error("LINE情報保存エラー:", err);
      setError(err.message || "LINE情報の保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  };

  // QRコードアップロード
  const handleUploadQrCode = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError("QRコード画像は2MB以下にしてください。");
      return;
    }

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await uploadLineQrCode(Number(shopId), file);

      if (!result.success) {
        throw new Error(result.message || "QRコードのアップロードに失敗しました");
      }

      setSuccessMessage("QRコードをアップロードしました。");
      setQrCodeUrl(result.data?.line_qr_code_url || null);
    } catch (err: any) {
      console.error("QRコードアップロードエラー:", err);
      setError(err.message || "QRコードのアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }

    e.target.value = "";
  };

  // QRコード削除
  const handleDeleteQrCode = async () => {
    if (!confirm("QRコード画像を削除してもよろしいですか？")) return;

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await deleteLineQrCode(Number(shopId));

      if (!result.success) {
        throw new Error(result.message || "QRコードの削除に失敗しました");
      }

      setSuccessMessage("QRコード画像を削除しました。");
      setQrCodeUrl(null);
    } catch (err: any) {
      console.error("QRコード削除エラー:", err);
      setError(err.message || "QRコードの削除に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // QRコードダウンロード
  const handleDownloadQrCode = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.href = qrCodeUrl;
    link.download = `line_qr_code_${shopId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

  const canUseLine = shop.plan_info?.can_use_line;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">LINE連携</h1>
            <p className="text-gray-600">
              LINE公式アカウントと連携して、お客様とのコミュニケーションを強化できます
            </p>
          </div>
          {!canUseLine && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
              🔒 有料プラン限定
            </span>
          )}
        </div>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {!canUseLine ? (
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
                有料プランにアップグレードすると、LINE公式アカウントと連携して、
                お客様に友だち追加URLやQRコードを提供できます。
                予約受付やお知らせ配信など、集客力アップに役立ちます。
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
        /* 有料プランの場合：LINE連携UI */
        <>
          {/* LINE公式アカウント情報 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              LINE公式アカウント情報
            </h2>

            <div className="space-y-4">
              {/* LINE公式アカウントID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LINE公式アカウントID（任意）
                </label>
                <input
                  type="text"
                  value={lineOfficialId}
                  onChange={(e) => setLineOfficialId(e.target.value)}
                  placeholder="@example"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  例: @abc1234 （@から始まるID）
                </p>
              </div>

              {/* 友だち追加URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  友だち追加URL（任意）
                </label>
                <input
                  type="url"
                  value={lineAddUrl}
                  onChange={(e) => setLineAddUrl(e.target.value)}
                  placeholder="https://lin.ee/xxxxx"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={saving || uploading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  LINE公式アカウントの友だち追加URLを入力してください
                </p>
              </div>

              {/* 友だち追加URLリンク */}
              {lineAddUrl && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <span className="text-sm text-green-800">
                    友だち追加ページをプレビュー：
                  </span>
                  <a
                    href={lineAddUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    URLを開く
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              )}

              {/* 保存ボタン */}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSaveLineInfo}
                  disabled={!hasChanges || saving || uploading}
                  className={`flex items-center px-6 py-2 rounded-lg font-medium transition-colors ${
                    hasChanges && !saving && !uploading
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "保存中..." : "保存"}
                </button>

                {hasChanges && (
                  <span className="text-sm text-gray-500">
                    ※ 変更を保存してください
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* QRコード管理 */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              友だち追加用QRコード
            </h2>

            {qrCodeUrl ? (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* QRコード表示 */}
                  <div className="flex-shrink-0">
                    <div className="w-64 h-64 bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
                      <img
                        src={qrCodeUrl}
                        alt="LINE友だち追加QRコード"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* 説明とアクション */}
                  <div className="flex-1">
                    <p className="text-sm text-gray-600 mb-4">
                      このQRコードをお客様に提示することで、
                      LINE公式アカウントに友だち追加してもらえます。
                    </p>

                    <div className="space-y-3">
                      <button
                        onClick={handleDownloadQrCode}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        QRコードをダウンロード
                      </button>

                      <button
                        onClick={handleDeleteQrCode}
                        disabled={uploading}
                        className="flex items-center px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        QRコードを削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">
                    友だち追加用のQRコード画像をアップロードしてください
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium">
                    <Upload className="w-4 h-4 mr-2" />
                    QRコードをアップロード
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={handleUploadQrCode}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-2">
                    JPEG、PNG、WebP形式、2MB以下
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">
              💡 LINE連携のヒント
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• LINE公式アカウントの管理画面から友だち追加URLとQRコードを取得できます</li>
              <li>• QRコードは店内に掲示したり、チラシに印刷したりできます</li>
              <li>• 友だち追加URLはWebサイトやSNSで共有できます</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
}