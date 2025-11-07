// src/app/(dashboard)/dashboard/profile/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { getProfile, updateProfile, uploadAvatar, deleteAvatar } from '@/lib/api/auth';
import { User } from '@/types/models';
import { ErrorMessage } from '@/components/ui/error-message';
import { SuccessMessage } from '@/components/ui/success-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ImageCropper } from '@/components/image-crop/image-cropper';
import { getImageUrlBySize } from '@/lib/utils/image';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // フォームデータ
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    nick_name: '',
  });

  // 画像関連
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string>('');
  const [showCropper, setShowCropper] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const response = await getProfile();
      if (response.success && response.data) {
        setUser(response.data);
        setFormData({
          first_name: response.data.first_name || '',
          last_name: response.data.last_name || '',
          nick_name: response.data.nick_name || '',
        });
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'プロフィールの取得に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await updateProfile(formData);
      console.log(response);
      if (response.success && response.data) {
        setUser(response.data);
        setSuccess('プロフィールを更新しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'プロフィールの更新に失敗しました');
    } finally {
      setSaving(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = async (croppedImage: Blob) => {
    setShowCropper(false);
    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      const file = new File([croppedImage], imageFile?.name || 'avatar.jpg', {
        type: 'image/jpeg',
      });

      const response = await uploadAvatar(file);
      if (response.success) {
        await loadProfile();
        setSuccess('アバター画像を更新しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'アバター画像のアップロードに失敗しました');
    } finally {
      setUploadingImage(false);
      setImageFile(null);
      setImageSrc('');
    }
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setImageFile(null);
    setImageSrc('');
  };

  const handleDeleteAvatar = async () => {
    if (!confirm('アバター画像を削除しますか？')) return;

    setUploadingImage(true);
    setError('');
    setSuccess('');

    try {
      const response = await deleteAvatar();
      if (response.success) {
        await loadProfile();
        setSuccess('アバター画像を削除しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'アバター画像の削除に失敗しました');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  const avatarUrl = getImageUrlBySize(user?.avatar_paths, 'medium');

  return (
    <div className="max-w-3xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        プロフィール設定
      </h2>

      {error && <ErrorMessage message={error} />}
      {success && <SuccessMessage message={success} />}

      {/* アバター画像 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          アバター画像
        </h3>

        <div className="flex items-center space-x-6">
          <div className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-500 text-3xl">
                {(user?.nick_name || user?.email || '').charAt(0).toUpperCase()}
              </span>
            )}
          </div>

          <div className="flex-1">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              disabled={uploadingImage}
              className="hidden"
              id="avatar-upload"
            />
            <label
              htmlFor="avatar-upload"
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer disabled:opacity-50"
            >
              {uploadingImage ? <LoadingSpinner /> : '画像を変更'}
            </label>
            {avatarUrl && (
              <button
                onClick={handleDeleteAvatar}
                disabled={uploadingImage}
                className="ml-3 text-sm text-red-600 hover:text-red-700"
              >
                削除
              </button>
            )}
            <p className="mt-2 text-xs text-gray-500">
              JPG, PNG形式、10MB以下
            </p>
          </div>
        </div>
      </div>

      {/* プロフィール情報 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          基本情報
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-500">
              メールアドレスは変更できません
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓
              </label>
              <input
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                名
              </label>
              <input
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ニックネーム
            </label>
            <input
              type="text"
              value={formData.nick_name}
              onChange={(e) =>
                setFormData({ ...formData, nick_name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="表示名として使用されます"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? <LoadingSpinner /> : '保存'}
            </button>
          </div>
        </form>
      </div>

      {/* 画像トリミングモーダル */}
      {showCropper && imageSrc && (
        <ImageCropper
            imageSrc={imageSrc}
            aspect={1}
            onCropComplete={handleCropComplete}
            onCancel={handleCropCancel}
        />
      )}
    </div>
  );
}