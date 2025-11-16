// src/components/prefecture/PrefectureGrid.tsx
'use client';

import Link from 'next/link';
import { Prefecture } from '@/types/models';
import { MapPin } from 'lucide-react';

interface PrefectureGridProps {
  prefectures: Prefecture[];
}

export default function PrefectureGrid({ prefectures }: PrefectureGridProps) {
  // 地域別にグループ化
  const regions = {
    '北海道': prefectures.filter(p => p.name === '北海道'),
    '東北': prefectures.filter(p => ['青森県', '岩手県', '宮城県', '秋田県', '山形県', '福島県'].includes(p.name)),
    '関東': prefectures.filter(p => ['茨城県', '栃木県', '群馬県', '埼玉県', '千葉県', '東京都', '神奈川県'].includes(p.name)),
    '中部': prefectures.filter(p => ['新潟県', '富山県', '石川県', '福井県', '山梨県', '長野県', '岐阜県', '静岡県', '愛知県'].includes(p.name)),
    '近畿': prefectures.filter(p => ['三重県', '滋賀県', '京都府', '大阪府', '兵庫県', '奈良県', '和歌山県'].includes(p.name)),
    '中国': prefectures.filter(p => ['鳥取県', '島根県', '岡山県', '広島県', '山口県'].includes(p.name)),
    '四国': prefectures.filter(p => ['徳島県', '香川県', '愛媛県', '高知県'].includes(p.name)),
    '九州・沖縄': prefectures.filter(p => ['福岡県', '佐賀県', '長崎県', '熊本県', '大分県', '宮崎県', '鹿児島県', '沖縄県'].includes(p.name)),
  };

  return (
    <div className="space-y-12">
      {Object.entries(regions).map(([regionName, regionPrefectures]) => (
        <div key={regionName}>
          <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-500" />
            {regionName}
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {regionPrefectures.map((prefecture) => (
              <Link
                key={prefecture.id}
                href={`/${prefecture.slug}`}
                className="block p-4 bg-white border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:shadow-md transition-all group"
              >
                <div className="text-center">
                  <div className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1">
                    {prefecture.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {prefecture.shop_count || 0}店舗
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}