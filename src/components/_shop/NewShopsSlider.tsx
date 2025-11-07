// src/components/shop/NewShopsSlider.tsx
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { getShops } from '@/lib/api/shops';
import { Shop } from '@/types/models';
import ShopCard from './ShopCard';

export default function NewShopsSlider() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const autoScrollInterval = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const loadNewShops = async () => {
      try {
        const response = await getShops({
          sort_by: 'created_at',
          sort_direction: 'desc',
          per_page: 12,
        });
        
        if (response.success && response.data) {
          setShops(response.data.data);
        }
      } catch (error) {
        console.error('新着店舗の取得エラー:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNewShops();
  }, []);

  // 自動スクロール
  const autoScroll = useCallback(() => {
    if (!sliderRef.current || isPaused) return;

    const slider = sliderRef.current;
    const cardWidth = 320; // カード幅 + gap
    const maxScroll = slider.scrollWidth - slider.clientWidth;

    // 最後まで到達したら最初に戻る
    if (slider.scrollLeft >= maxScroll - 10) {
      slider.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      slider.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  }, [isPaused]);

  // 自動スクロールのインターバル設定
  useEffect(() => {
    if (shops.length > 0 && !isPaused) {
      autoScrollInterval.current = setInterval(autoScroll, 3000); // 3秒ごと
    }

    return () => {
      if (autoScrollInterval.current) {
        clearInterval(autoScrollInterval.current);
      }
    };
  }, [shops.length, isPaused, autoScroll]);

  const scroll = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = 320;
      const newScrollLeft = sliderRef.current.scrollLeft + (direction === 'left' ? -scrollAmount : scrollAmount);
      sliderRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth',
      });
    }
  };

  // マウスホバーで一時停止
  const handleMouseEnter = () => setIsPaused(true);
  const handleMouseLeave = () => setIsPaused(false);

  if (loading) {
    return (
      <div className="py-12">
        <div className="flex justify-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (shops.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white to-blue-50">
      <div className="w-full">
        {/* ヘッダー */}
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-900">新着店舗</h2>
              <p className="text-gray-600">最近登録された雀荘</p>
            </div>
          </div>

          {/* ナビゲーションボタン */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => scroll('left')}
              className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors"
              aria-label="前へ"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-2 rounded-full bg-white border-2 border-gray-200 hover:border-blue-500 hover:text-blue-500 transition-colors"
              aria-label="次へ"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* スライダー */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div
            ref={sliderRef}
            className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
            style={{
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
          >
            {shops.map((shop) => (
              <div key={shop.id} className="flex-none w-80">
                <ShopCard shop={shop} />
              </div>
            ))}
          </div>

          {/* グラデーション（端のフェードアウト効果） */}
          <div className="absolute top-0 left-0 w-8 h-full bg-gradient-to-r from-white to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-8 h-full bg-gradient-to-l from-blue-50 to-transparent pointer-events-none" />
        </div>

        {/* 自動スライダーのインジケーター */}
        <div className="flex justify-center items-center gap-2 mt-4">
          <div className="flex gap-1">
            {Array.from({ length: Math.min(shops.length, 5) }).map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  isPaused ? 'w-2 bg-gray-300' : 'w-8 bg-blue-500'
                }`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500 ml-2">
            {isPaused ? '一時停止中' : '自動スライド中'}
          </span>
        </div>

        {/* モバイル用のスクロールヒント */}
        <div className="md:hidden text-center mt-4 text-sm text-gray-500">
          ← スワイプして他の店舗を見る →
        </div>
      </div>
    </section>
  );
}