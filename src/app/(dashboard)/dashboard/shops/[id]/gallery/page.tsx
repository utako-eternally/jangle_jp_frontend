// src/app/(dashboard)/dashboard/shops/[id]/gallery/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Upload, Trash2, GripVertical, Image as ImageIcon, Loader2, X, AlertCircle } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { 
  getShopGalleryImages as getGalleryImages,
  uploadShopMainImage as uploadMainImage,
  uploadShopLogoImage as uploadLogoImage,
  deleteShopLogoImage as deleteLogoImage,
  addShopGalleryImage as addGalleryImage,
  deleteShopGalleryImage as deleteGalleryImage,
  reorderShopGalleryImages as reorderGalleryImages
} from "@/lib/api/shops";
import { Shop, ShopImage } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { ImageCropper } from "@/components/image-crop/image-cropper";

const MAX_GALLERY_IMAGES = 6;

export default function GalleryPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [logoImage, setLogoImage] = useState<string | null>(null);
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [galleryImages, setGalleryImages] = useState<ShopImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ドラッグ＆ドロップ用
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // 画像トリミング用
  const [showCropper, setShowCropper] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState("");
  const [cropType, setCropType] = useState<"logo" | "main" | "gallery">("main");
  const [cropAspect, setCropAspect] = useState(16 / 9);

  // 新規画像追加モーダル
  const [showAddModal, setShowAddModal] = useState(false);
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImagePreview, setNewImagePreview] = useState<string>("");
  const [newImageCaption, setNewImageCaption] = useState("");

  // 画像URLを取得する共通関数
  const getImageUrl = (imagePaths: any) => {
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

  // データ取得
  useEffect(() => {
    loadData();
  }, [shopId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);
      
      // ロゴ画像URLを取得
      const logoImageUrl = getImageUrl(shopResponse.data.logo_image_paths);
      setLogoImage(logoImageUrl);
      
      // メイン画像URLを取得
      const mainImageUrl = getImageUrl(shopResponse.data.main_image_paths);
      setMainImage(mainImageUrl);

      // ギャラリー画像取得
      const galleryResponse = await getGalleryImages(Number(shopId));
      if (galleryResponse.success && galleryResponse.data) {
        setGalleryImages(galleryResponse.data.sort((a, b) => a.display_order - b.display_order));
      }

    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // ロゴ画像選択（トリミング前）
  const handleSelectLogoImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("画像サイズは10MB以下にしてください。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImageSrc(e.target?.result as string);
      setCropType("logo");
      setCropAspect(1); // 正方形
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    e.target.value = "";
  };

  // ロゴ画像トリミング完了
  const handleLogoImageCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const croppedFile = new File([croppedBlob], "logo-image.jpg", { type: "image/jpeg" });
      const result = await uploadLogoImage(Number(shopId), croppedFile);

      if (!result.success) {
        throw new Error(result.message || "ロゴ画像のアップロードに失敗しました");
      }

      setSuccessMessage("ロゴ画像をアップロードしました。");
      await loadData();

    } catch (err: any) {
      console.error("ロゴ画像アップロードエラー:", err);
      setError(err.message || "ロゴ画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // ロゴ画像削除
  const handleDeleteLogoImage = async () => {
    if (!confirm("ロゴ画像を削除してもよろしいですか？")) return;

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await deleteLogoImage(Number(shopId));

      if (!result.success) {
        throw new Error(result.message || "ロゴ画像の削除に失敗しました");
      }

      setSuccessMessage("ロゴ画像を削除しました。");
      await loadData();

    } catch (err: any) {
      console.error("ロゴ画像削除エラー:", err);
      setError(err.message || "ロゴ画像の削除に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // メイン画像選択（トリミング前）
  const handleSelectMainImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック (10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("画像サイズは10MB以下にしてください。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImageSrc(e.target?.result as string);
      setCropType("main");
      setCropAspect(16 / 9);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
    
    e.target.value = "";
  };

  // メイン画像トリミング完了
  const handleMainImageCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const croppedFile = new File([croppedBlob], "main-image.jpg", { type: "image/jpeg" });
      const result = await uploadMainImage(Number(shopId), croppedFile);

      if (!result.success) {
        throw new Error(result.message || "メイン画像のアップロードに失敗しました");
      }

      setSuccessMessage("メイン画像をアップロードしました。");
      await loadData();

    } catch (err: any) {
      console.error("メイン画像アップロードエラー:", err);
      setError(err.message || "メイン画像のアップロードに失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // 新規画像選択（トリミング前）
  const handleSelectNewImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイルサイズチェック
    if (file.size > 10 * 1024 * 1024) {
      setError("画像サイズは10MB以下にしてください。");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setCropImageSrc(e.target?.result as string);
      setCropType("gallery");
      setCropAspect(16 / 9);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);

    e.target.value = "";
  };

  // ギャラリー画像トリミング完了
  const handleGalleryCropComplete = async (croppedBlob: Blob) => {
    setShowCropper(false);
    
    // トリミング済み画像をプレビュー表示
    const croppedFile = new File([croppedBlob], "gallery-image.jpg", { type: "image/jpeg" });
    setNewImageFile(croppedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setNewImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(croppedFile);
    
    // キャプション入力モーダルを表示
    setShowAddModal(true);
  };

  // ギャラリー画像追加
  const handleAddGalleryImage = async () => {
    if (!newImageFile) return;

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await addGalleryImage(Number(shopId), newImageFile, newImageCaption);

      if (!result.success) {
        throw new Error(result.message || "ギャラリー画像の追加に失敗しました");
      }

      setSuccessMessage("ギャラリー画像を追加しました。");
      setShowAddModal(false);
      setNewImageFile(null);
      setNewImagePreview("");
      setNewImageCaption("");
      await loadData();

    } catch (err: any) {
      console.error("ギャラリー画像追加エラー:", err);
      setError(err.message || "ギャラリー画像の追加に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // ギャラリー画像削除
  const handleDeleteGalleryImage = async (imageId: number) => {
    if (!confirm("この画像を削除してもよろしいですか？")) return;

    setUploading(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await deleteGalleryImage(Number(shopId), imageId);

      if (!result.success) {
        throw new Error(result.message || "画像の削除に失敗しました");
      }

      setSuccessMessage("画像を削除しました。");
      await loadData();

    } catch (err: any) {
      console.error("画像削除エラー:", err);
      setError(err.message || "画像の削除に失敗しました。");
    } finally {
      setUploading(false);
    }
  };

  // ドラッグ開始
  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  // ドロップ
  const handleDrop = async (dropIndex: number) => {
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    const newImages = [...galleryImages];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(dropIndex, 0, draggedImage);

    // display_orderを更新
    const imageOrders = newImages.map((img, idx) => ({
      id: img.id,
      display_order: idx + 1,
    }));

    setGalleryImages(newImages);
    setDraggedIndex(null);

    // サーバーに送信
    try {
      const result = await reorderGalleryImages(Number(shopId), { image_orders: imageOrders });

      if (!result.success) {
        throw new Error(result.message || "並び順の更新に失敗しました");
      }

      setSuccessMessage("画像の並び順を更新しました。");

    } catch (err: any) {
      console.error("並び順更新エラー:", err);
      setError(err.message || "並び順の更新に失敗しました。");
      await loadData(); // エラー時は元に戻す
    }
  };

  // ドラッグオーバー
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // トリミング完了のハンドラを分岐
  const handleCropComplete = (croppedBlob: Blob) => {
    switch (cropType) {
      case "logo":
        return handleLogoImageCropComplete(croppedBlob);
      case "main":
        return handleMainImageCropComplete(croppedBlob);
      case "gallery":
        return handleGalleryCropComplete(croppedBlob);
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

  const canUseGallery = shop.plan_info?.can_use_gallery;
  const canAddMore = galleryImages.length < MAX_GALLERY_IMAGES;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">画像管理</h1>
        <p className="text-gray-600">
          店舗のロゴ、メイン画像、ギャラリー画像を管理できます
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* ロゴ画像（無料機能） */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">ロゴ画像</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            すべてのプランで利用可能
          </span>
        </div>
        
        {logoImage ? (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="relative">
                <img
                  src={logoImage}
                  alt="ロゴ画像"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                />
              </div>
            </div>
            <div className="flex justify-center gap-3">
              <label className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                ロゴ画像を変更
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleSelectLogoImage}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <button
                onClick={handleDeleteLogoImage}
                disabled={uploading}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:bg-gray-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                削除
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-12 h-12 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-600 mb-4">ロゴ画像が未設定です</p>
            <label className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              ロゴ画像をアップロード
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleSelectLogoImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          ※ JPEG、PNG、WebP形式、10MB以下（正方形にトリミングされます）
        </p>
      </div>

      {/* メイン画像（無料機能） */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">メイン画像</h2>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            すべてのプランで利用可能
          </span>
        </div>
        
        {mainImage ? (
          <div className="space-y-4">
            <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={mainImage}
                alt="メイン画像"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 mr-2" />
                メイン画像を変更
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleSelectMainImage}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">メイン画像が未設定です</p>
            <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload className="w-4 h-4 mr-2" />
              メイン画像をアップロード
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleSelectMainImage}
                disabled={uploading}
                className="hidden"
              />
            </label>
          </div>
        )}

        <p className="text-xs text-gray-500 mt-2">
          ※ JPEG、PNG、WebP形式、10MB以下（16:9にトリミングされます）
        </p>
      </div>

      {/* ギャラリー画像（有料機能） */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900">ギャラリー画像</h2>
            {!canUseGallery && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                🔒 有料プラン限定
              </span>
            )}
          </div>
          
          {canUseGallery && (
            <p className="text-sm text-gray-600">
              {galleryImages.length} / {MAX_GALLERY_IMAGES} 枚
            </p>
          )}
        </div>

        {!canUseGallery ? (
          /* 無料プランの場合：ロック表示 */
          <div className="border-2 border-dashed border-yellow-300 bg-yellow-50 rounded-lg p-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                有料プラン限定機能
              </h3>
              <p className="text-sm text-gray-600 mb-4 max-w-md mx-auto">
                有料プランにアップグレードすると、最大6枚の画像をギャラリーに追加できます。
                複数の店舗写真を掲載することで、より多くのお客様にアピールできます。
              </p>

              <a
                href={`/dashboard/shops/${shopId}/plan`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                有料プランを見る →
              </a>
            </div>
          </div>
        ) : (
          /* 有料プランの場合：通常のギャラリー管理UI */
          <>
            {canAddMore && (
              <div className="mb-4">
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  画像を追加
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSelectNewImage}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            )}

            {galleryImages.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">ギャラリー画像がありません</p>
                <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  最初の画像を追加
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleSelectNewImage}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDrop={() => handleDrop(index)}
                    onDragOver={handleDragOver}
                    className="relative border border-gray-200 rounded-lg overflow-hidden cursor-move hover:border-blue-500 transition-colors"
                  >
                    <div className="absolute top-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs flex items-center">
                      <GripVertical className="w-3 h-3 mr-1" />
                      {index + 1}
                    </div>
                    
                    <div className="aspect-video bg-gray-100">
                      <img
                        src={image.medium_url || image.large_url || image.thumbnail_url}
                        alt={image.alt_text || "ギャラリー画像"}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="p-3">
                      {image.alt_text && (
                        <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                          {image.alt_text}
                        </p>
                      )}
                      
                      <button
                        onClick={() => handleDeleteGalleryImage(image.id)}
                        disabled={uploading}
                        className="flex items-center text-sm text-red-600 hover:text-red-700 disabled:text-gray-400"
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="text-xs text-gray-500 mt-4">
              ※ ドラッグ＆ドロップで画像の並び順を変更できます
            </p>
          </>
        )}
      </div>

      {/* 画像トリミングモーダル */}
      {showCropper && (
        <ImageCropper
          imageSrc={cropImageSrc}
          aspect={cropAspect}
          onCropComplete={handleCropComplete}
          onCancel={() => setShowCropper(false)}
        />
      )}

      {/* キャプション入力モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  キャプションを入力
                </h3>
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewImageFile(null);
                    setNewImagePreview("");
                    setNewImageCaption("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* プレビュー */}
                {newImagePreview && (
                  <div className="relative">
                    <img
                      src={newImagePreview}
                      alt="プレビュー"
                      className="w-full aspect-video object-cover rounded-lg"
                    />
                  </div>
                )}

                {/* キャプション */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    キャプション（任意）
                  </label>
                  <textarea
                    value={newImageCaption}
                    onChange={(e) => setNewImageCaption(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="画像の説明を入力してください"
                    rows={3}
                    maxLength={200}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {newImageCaption.length} / 200 文字
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewImageFile(null);
                    setNewImagePreview("");
                    setNewImageCaption("");
                  }}
                  disabled={uploading}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleAddGalleryImage}
                  disabled={!newImageFile || uploading}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    !newImageFile || uploading
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      アップロード中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      追加
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}