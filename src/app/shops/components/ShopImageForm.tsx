// src/app/shops/components/ShopImageForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Camera, Image, Info, Star, Trash2 } from 'lucide-react';
import { ShopImageFormProps } from '@/types/form';
import { ImageCropper } from '@/components/image-crop/image-cropper';

export default function ShopImageForm({
  value,
  onChange,
  onValidationChange,
  maxImages = 2,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
}: ShopImageFormProps) {
  const [imageData, setImageData] = useState(value);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingMainImage, setUploadingMainImage] = useState(false); // 変更: uploadingCover -> uploadingMainImage

  // 画像トリミング用の状態
  const [showLogoCropper, setShowLogoCropper] = useState(false);
  const [showMainImageCropper, setShowMainImageCropper] = useState(false); // 変更: showCoverCropper -> showMainImageCropper
  const [logoImageSrc, setLogoImageSrc] = useState('');
  const [mainImageSrc, setMainImageSrc] = useState(''); // 変更: coverImageSrc -> mainImageSrc
  const [pendingLogoFile, setPendingLogoFile] = useState<File | null>(null);
  const [pendingMainImageFile, setPendingMainImageFile] = useState<File | null>(null); // 変更: pendingCoverFile -> pendingMainImageFile

  useEffect(() => {
    if (value) {
      setImageData({
        logo_image: value.logo_image || null,
        cover_image: value.cover_image || null,
      });
    }
  }, [value]);

  // 画像データを更新
  const updateImageData = (field: 'logo_image' | 'cover_image', file: File | null) => {
    const newData = { ...imageData, [field]: file };
    setImageData(newData);
    onChange(newData);
  };

  // バリデーション状態を更新（画像は任意なので常にtrue）
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(true);
    }
  }, [onValidationChange]);

  // ファイル形式チェック
  const isValidFileType = (file: File): boolean => {
    return allowedTypes.includes(file.type);
  };

  // ファイルサイズチェック（10MB制限）
  const isValidFileSize = (file: File): boolean => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  };

  // ロゴ画像選択
  const handleLogoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      alert(`サポートされていないファイル形式です。対応形式: ${allowedTypes.join(', ')}`);
      return;
    }

    if (!isValidFileSize(file)) {
      alert('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
      return;
    }

    setPendingLogoFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setLogoImageSrc(reader.result as string);
      setShowLogoCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // ロゴ画像のトリミング完了
  const handleLogoCropComplete = async (croppedImage: Blob) => {
    setShowLogoCropper(false);
    setUploadingLogo(true);

    try {
      const file = new File([croppedImage], pendingLogoFile?.name || 'logo.jpg', {
        type: 'image/jpeg',
      });

      updateImageData('logo_image', file);
    } catch (error) {
      console.error('Logo crop error:', error);
      alert('ロゴ画像の設定に失敗しました。');
    } finally {
      setUploadingLogo(false);
      setPendingLogoFile(null);
      setLogoImageSrc('');
    }
  };

  // ロゴ画像のトリミングキャンセル
  const handleLogoCropCancel = () => {
    setShowLogoCropper(false);
    setPendingLogoFile(null);
    setLogoImageSrc('');
  };

  // ロゴ画像の削除
  const handleLogoDelete = () => {
    if (confirm('ロゴ画像を削除しますか？')) {
      updateImageData('logo_image', null);
    }
  };

  // メイン画像選択（変更: handleCoverFileSelect -> handleMainImageFileSelect）
  const handleMainImageFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidFileType(file)) {
      alert(`サポートされていないファイル形式です。対応形式: ${allowedTypes.join(', ')}`);
      return;
    }

    if (!isValidFileSize(file)) {
      alert('ファイルサイズが大きすぎます。10MB以下のファイルを選択してください。');
      return;
    }

    setPendingMainImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setMainImageSrc(reader.result as string);
      setShowMainImageCropper(true);
    };
    reader.readAsDataURL(file);
  };

  // メイン画像のトリミング完了（変更: handleCoverCropComplete -> handleMainImageCropComplete）
  const handleMainImageCropComplete = async (croppedImage: Blob) => {
    setShowMainImageCropper(false);
    setUploadingMainImage(true);

    try {
      const file = new File([croppedImage], pendingMainImageFile?.name || 'main.jpg', {
        type: 'image/jpeg',
      });

      updateImageData('cover_image', file);
    } catch (error) {
      console.error('Main image crop error:', error);
      alert('メイン画像の設定に失敗しました。');
    } finally {
      setUploadingMainImage(false);
      setPendingMainImageFile(null);
      setMainImageSrc('');
    }
  };

  // メイン画像のトリミングキャンセル（変更: handleCoverCropCancel -> handleMainImageCropCancel）
  const handleMainImageCropCancel = () => {
    setShowMainImageCropper(false);
    setPendingMainImageFile(null);
    setMainImageSrc('');
  };

  // メイン画像の削除（変更: handleCoverDelete -> handleMainImageDelete）
  const handleMainImageDelete = () => {
    if (confirm('メイン画像を削除しますか？')) {
      updateImageData('cover_image', null);
    }
  };

  // ファイルのプレビューURL生成
  const getPreviewUrl = (file: File | null): string | null => {
    if (!file) return null;
    return URL.createObjectURL(file);
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">店舗画像</h2>
        <p className="text-sm text-gray-600">
          店舗のロゴとメイン画像を設定してください。画像は任意ですが、設定することで店舗の魅力をより伝えることができます。
        </p>
      </div>

      {/* ロゴ画像 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-orange-100 rounded-lg">
            <Camera className="w-5 h-5 text-orange-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">ロゴ画像</h3>
            <p className="text-sm text-gray-600">店舗のロゴやアイコン（推奨: 正方形）</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* プレビュー */}
          <div className="flex justify-center">
            {imageData.logo_image ? (
              <div className="relative">
                <img
                  src={getPreviewUrl(imageData.logo_image)!}
                  alt="ロゴプレビュー"
                  className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                />
                <button
                  onClick={handleLogoDelete}
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-32 h-32 bg-gray-100 rounded-full border-2 border-dashed border-gray-300">
                <Camera className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* アップロードボタン */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleLogoFileSelect}
                disabled={uploadingLogo}
                className="hidden"
              />
              <div className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 text-sm font-medium">
                {imageData.logo_image ? 'ロゴ画像を変更' : 'ロゴ画像を選択'}
              </div>
            </label>
          </div>

          {imageData.logo_image && (
            <div className="text-center">
              <p className="text-sm text-gray-900 font-medium">{imageData.logo_image.name}</p>
              <p className="text-xs text-gray-500">{Math.round(imageData.logo_image.size / 1024)}KB</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-blue-700">
              <p className="font-medium mb-1">ロゴ画像について</p>
              <ul className="space-y-1">
                <li>• 店舗一覧や詳細ページで表示されます</li>
                <li>• 正方形にトリミングされ、丸いアイコンとして表示されます</li>
                <li>• 背景が透明なPNG形式がおすすめです</li>
                <li>• 対応形式: {allowedTypes.join(', ')}</li>
                <li>• 最大サイズ: 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* メイン画像（変更: カバー画像 -> メイン画像） */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Image className="w-5 h-5 text-purple-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-gray-900">メイン画像</h3>
            <p className="text-sm text-gray-600">店舗の外観や内装写真（推奨: 横長）</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* プレビュー */}
          <div className="w-full" style={{ aspectRatio: '16/9' }}>
            {imageData.cover_image ? (
              <div className="relative w-full h-full">
                <img
                  src={getPreviewUrl(imageData.cover_image)!}
                  alt="メイン画像プレビュー"
                  className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                />
                <button
                  onClick={handleMainImageDelete}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                  title="削除"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300">
                <Image className="w-12 h-12 text-gray-400" />
              </div>
            )}
          </div>

          {/* アップロードボタン */}
          <div className="flex justify-center">
            <label className="cursor-pointer">
              <input
                type="file"
                accept={allowedTypes.join(',')}
                onChange={handleMainImageFileSelect}
                disabled={uploadingMainImage}
                className="hidden"
              />
              <div className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-gray-300 text-sm font-medium">
                {imageData.cover_image ? 'メイン画像を変更' : 'メイン画像を選択'}
              </div>
            </label>
          </div>

          {imageData.cover_image && (
            <div className="text-center">
              <p className="text-sm text-gray-900 font-medium">{imageData.cover_image.name}</p>
              <p className="text-xs text-gray-500">{Math.round(imageData.cover_image.size / 1024)}KB</p>
            </div>
          )}
        </div>

        <div className="mt-4 bg-purple-50 border border-purple-200 rounded-lg p-3">
          <div className="flex items-start">
            <Info className="w-4 h-4 text-purple-600 mt-0.5 mr-2 flex-shrink-0" />
            <div className="text-xs text-purple-700">
              <p className="font-medium mb-1">メイン画像について</p>
              <ul className="space-y-1">
                <li>• 店舗詳細ページのメイン画像として表示されます</li>
                <li>• 16:9の横長比率でトリミングされます</li>
                <li>• 店舗の外観、内装、雰囲気が伝わる写真がおすすめです</li>
                <li>• 対応形式: {allowedTypes.join(', ')}</li>
                <li>• 最大サイズ: 10MB</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 現在の設定状況 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Star className="w-5 h-5 text-gray-600 mr-2" />
          <h3 className="text-sm font-medium text-gray-800">画像設定状況</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${imageData.logo_image ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <div>
              <span className={`text-sm ${imageData.logo_image ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                ロゴ画像 {imageData.logo_image ? '✓' : '(未設定)'}
              </span>
            </div>
          </div>

          <div className="flex items-center">
            <div
              className={`w-3 h-3 rounded-full mr-3 ${imageData.cover_image ? 'bg-green-500' : 'bg-gray-300'}`}
            />
            <div>
              <span className={`text-sm ${imageData.cover_image ? 'text-green-700 font-medium' : 'text-gray-600'}`}>
                メイン画像 {imageData.cover_image ? '✓' : '(未設定)'}
              </span>
            </div>
          </div>
        </div>

        {!imageData.logo_image && !imageData.cover_image && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-700">
              💡 画像を設定すると、店舗の魅力をより効果的にアピールできます。後からでも追加・変更可能です。
            </p>
          </div>
        )}
      </div>

      {/* 画像トリミングモーダル */}
      {showLogoCropper && logoImageSrc && (
        <ImageCropper imageSrc={logoImageSrc} aspect={1} onCropComplete={handleLogoCropComplete} onCancel={handleLogoCropCancel} />
      )}

      {showMainImageCropper && mainImageSrc && (
        <ImageCropper imageSrc={mainImageSrc} aspect={16 / 9} onCropComplete={handleMainImageCropComplete} onCancel={handleMainImageCropCancel} />
      )}
    </div>
  );
}