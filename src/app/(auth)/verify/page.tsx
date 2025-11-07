// src/app/(auth)/verify/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { verifyEmail } from '@/lib/api/auth';
import { ErrorMessage } from '@/components/ui/error-message';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('トークンが見つかりません。');
      setLoading(false);
      return;
    }

    const verify = async () => {
      try {
        const response = await verifyEmail({ token });

        if (response.success && response.data) {
          router.push(`/complete?token=${token}&email=${response.data.email}`);
        } else {
          setError(response.message || 'メール認証に失敗しました。');
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'エラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    verify();
  }, [searchParams, router]);

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        メール認証中...
      </h2>

      {loading ? (
        <LoadingSpinner />
      ) : error ? (
        <>
          <ErrorMessage message={error} />
          <div className="mt-6">
            <a href="/register" className="text-blue-600 hover:text-blue-500">
              登録画面に戻る
            </a>
          </div>
        </>
      ) : null}
    </div>
  );
}