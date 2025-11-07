// src/components/shop/ShopGrid.tsx
'use client';

import { Shop } from '@/types/models';
import ShopCard from './ShopCard';

interface ShopGridProps {
  shops: Shop[];
  loading?: boolean;
}

export default function ShopGrid({ shops, loading = false }: ShopGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-[420px] bg-gray-200 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🀄</div>
        <p className="text-gray-500 text-lg">該当する店舗が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}