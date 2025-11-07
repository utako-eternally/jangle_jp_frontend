// src/components/shop/LineSection.tsx
'use client';

import { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { getShopLineInfo } from '@/lib/api/shops';

interface LineSectionProps {
  shopId: number;
}

export default function LineSection({ shopId }: LineSectionProps) {
  const [lineInfo, setLineInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadLineInfo = async () => {
      try {
        const response = await getShopLineInfo(shopId);
        if (response.success && response.data) {
          setLineInfo(response.data);
        }
      } catch (error) {
        console.error('LINE情報取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadLineInfo();
  }, [shopId]);

  // QRコードURL取得
  const getQrCodeUrl = (qrCodePaths: any) => {
    if (!qrCodePaths) return null;
    
    try {
      const paths = typeof qrCodePaths === 'string' ? JSON.parse(qrCodePaths) : qrCodePaths;
      const relativePath = paths?.original || paths?.large;
      
      if (!relativePath) return null;
      
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      return `${storageUrl}/${relativePath}`;
    } catch {
      return null;
    }
  };

  if (loading) {
    return null;
  }

  if (!lineInfo || !lineInfo.line_official_account_id) {
    return null;
  }

  const qrCodeUrl = getQrCodeUrl(lineInfo.qr_code_paths);

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-green-50 to-white">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              LINE公式アカウント
            </h2>
            <p className="text-gray-600">
              友だち追加で最新情報やお得な情報をお届けします
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* QRコード */}
            {qrCodeUrl && (
              <div className="flex justify-center">
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200">
                  <img
                    src={qrCodeUrl}
                    alt="LINE QRコード"
                    className="w-48 h-48 object-contain"
                  />
                  <p className="text-xs text-gray-500 text-center mt-2">
                    QRコードを読み取って友だち追加
                  </p>
                </div>
              </div>
            )}

            {/* アカウント情報 */}
            <div className="space-y-4">
              {lineInfo.account_name && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">アカウント名</div>
                  <div className="text-lg font-semibold text-gray-900">
                    {lineInfo.account_name}
                  </div>
                </div>
              )}

              {lineInfo.line_official_account_id && (
                <div>
                  <div className="text-sm text-gray-600 mb-1">LINE ID</div>
                  <div className="text-lg font-mono text-gray-900">
                    @{lineInfo.line_official_account_id}
                  </div>
                </div>
              )}

              {lineInfo.line_url && (
                <div className="pt-4">
                  <a
                    href={lineInfo.line_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block w-full px-6 py-3 bg-green-500 text-white text-center rounded-lg hover:bg-green-600 transition-colors font-medium"
                  >
                    友だち追加
                  </a>
                </div>
              )}

              {lineInfo.description && (
                <div className="pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600 whitespace-pre-line">
                    {lineInfo.description}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}