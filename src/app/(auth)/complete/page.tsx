// src/app/(auth)/complete/page.tsx
'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { completeRegistration } from '@/lib/api/auth';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function CompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    password: '',
    password_confirmation: '',
    first_name: '',
    last_name: '',
    nick_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirmation) {
      setError('パスワードが一致しません');
      return;
    }

    setLoading(true);

    try {
      const response = await completeRegistration({
        token,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        first_name: formData.first_name || undefined,
        last_name: formData.last_name || undefined,
        nick_name: formData.nick_name || undefined,
      });

      if (response.success && response.data) {
        // トークンを保存
        localStorage.setItem('token', response.data.token);
        
        // ダッシュボードへリダイレクト
        router.push('/dashboard');
      } else {
        setError(response.message || '登録完了に失敗しました');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">
        アカウント情報入力
      </h2>
      <p className="text-sm text-gray-600 mb-6">{email}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && <ErrorMessage message={error} />}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード <span className="text-red-500">*</span>
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={formData.password}
            onChange={(e) =>
              setFormData({ ...formData, password: e.target.value })
            }
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">8文字以上</p>
        </div>

        <div>
          <label
            htmlFor="password_confirmation"
            className="block text-sm font-medium text-gray-700"
          >
            パスワード（確認） <span className="text-red-500">*</span>
          </label>
          <input
            id="password_confirmation"
            type="password"
            required
            minLength={8}
            value={formData.password_confirmation}
            onChange={(e) =>
              setFormData({ ...formData, password_confirmation: e.target.value })
            }
            className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="border-t pt-6">
          <p className="text-sm text-gray-600 mb-4">
            以下は任意項目です（後から設定できます）
          </p>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="last_name"
                className="block text-sm font-medium text-gray-700"
              >
                姓
              </label>
              <input
                id="last_name"
                type="text"
                value={formData.last_name}
                onChange={(e) =>
                  setFormData({ ...formData, last_name: e.target.value })
                }
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="first_name"
                className="block text-sm font-medium text-gray-700"
              >
                名
              </label>
              <input
                id="first_name"
                type="text"
                value={formData.first_name}
                onChange={(e) =>
                  setFormData({ ...formData, first_name: e.target.value })
                }
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="nick_name"
                className="block text-sm font-medium text-gray-700"
              >
                ニックネーム
              </label>
              <input
                id="nick_name"
                type="text"
                value={formData.nick_name}
                onChange={(e) =>
                  setFormData({ ...formData, nick_name: e.target.value })
                }
                className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="表示名として使用されます"
              />
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <LoadingSpinner /> : '登録完了'}
          </button>
        </div>
      </form>
    </div>
  );
}