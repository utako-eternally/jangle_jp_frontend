// src/components/shop/NearbyShops.tsx
'use client';

import { useEffect, useState } from 'react';
import { getShops } from '@/lib/api/shops';
import ShopCard from './ShopCard';
import { Shop } from '@/types/models';
import { Store } from 'lucide-react';

interface NearbyShopsProps {
  currentShopId: number;
  prefecture: string;
  city: string;
}

export default function NearbyShops({ currentShopId, prefecture, city }: NearbyShopsProps) {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNearbyShops = async () => {
      try {
        const response = await getShops({
          prefecture_name: prefecture,
          per_page: 4,
          sort_by: 'created_at',
          sort_direction: 'desc',
        });

        if (response.success && response.data) {
          // 現在の店舗を除外
          const filtered = response.data.data.filter(shop => shop.id !== currentShopId);
          setShops(filtered.slice(0, 3));
        }
      } catch (error) {
        console.error('近隣店舗取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNearbyShops();
  }, [currentShopId, prefecture, city]);

  if (loading) {
    return (
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">近隣の店舗</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-[420px] bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Store className="w-6 h-6 text-blue-500" />
          <h2 className="text-2xl font-bold text-gray-900">近隣の店舗</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {shops.map((shop) => (
            <ShopCard key={shop.id} shop={shop} />
          ))}
        </div>
      </div>
    </section>
  );
}