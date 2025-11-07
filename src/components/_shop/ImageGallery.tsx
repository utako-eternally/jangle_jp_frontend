// src/components/shop/ImageGallery.tsx
'use client';

import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { ShopImage } from '@/types/models';

interface ImageGalleryProps {
  mainImagePaths: any;
  galleryImages: ShopImage[];
  shopName: string;
}

export default function ImageGallery({ mainImagePaths, galleryImages, shopName }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // 画像URLを取得
  const getImageUrl = (imagePaths: any, size: 'thumbnail' | 'medium' | 'large' = 'large') => {
    if (!imagePaths) return null;
    
    try {
      const paths = typeof imagePaths === 'string' ? JSON.parse(imagePaths) : imagePaths;
      const relativePath = paths?.[size] || paths?.large || paths?.original;
      
      if (!relativePath) return null;
      
      const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
      return `${storageUrl}/${relativePath}`;
    } catch {
      return null;
    }
  };

  const mainImageUrl = getImageUrl(mainImagePaths, 'large');
  const allImages = [
    mainImageUrl,
    ...galleryImages.map(img => getImageUrl(img.image_paths, 'large'))
  ].filter(Boolean) as string[];

  const openModal = (index: number) => {
    setSelectedIndex(index);
  };

  const closeModal = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex((selectedIndex + 1) % allImages.length);
    }
  };

  // キーボード操作
  const handleKeyDown = (e: KeyboardEvent) => {
    if (selectedIndex === null) return;
    
    if (e.key === 'ArrowLeft') goToPrevious();
    if (e.key === 'ArrowRight') goToNext();
    if (e.key === 'Escape') closeModal();
  };

  return (
    <>
      <div className="space-y-4">
        {/* メイン画像 */}
        <div 
          className="relative h-96 bg-gray-100 rounded-xl overflow-hidden cursor-pointer group"
          onClick={() => openModal(0)}
        >
          {mainImageUrl ? (
            <img
              src={mainImageUrl}
              alt={shopName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <span className="text-gray-400 text-8xl">🀄</span>
            </div>
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-opacity" />
        </div>

        {/* サムネイル一覧 */}
        {galleryImages.length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
            {galleryImages.slice(0, 11).map((image, index) => {
              const thumbnailUrl = getImageUrl(image.image_paths, 'thumbnail');
              const actualIndex = index + 1; // +1 because mainImage is at index 0
              
              return (
                <div
                  key={image.id}
                  className="relative h-20 bg-gray-100 rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => openModal(actualIndex)}
                >
                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={image.alt_text || `${shopName} 画像${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-2xl">🀄</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity" />
                </div>
              );
            })}
            
            {/* もっと見るボタン */}
            {galleryImages.length > 11 && (
              <div
                className="relative h-20 bg-gray-800 rounded-lg overflow-hidden cursor-pointer group flex items-center justify-center"
                onClick={() => openModal(12)}
              >
                <span className="text-white font-bold">
                  +{galleryImages.length - 11}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* モーダル */}
      {selectedIndex !== null && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={closeModal}
          onKeyDown={(e: any) => handleKeyDown(e)}
        >
          {/* 閉じるボタン */}
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors z-10"
            aria-label="閉じる"
          >
            <X className="w-6 h-6" />
          </button>

          {/* 前へボタン */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              aria-label="前の画像"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* 画像 */}
          <div className="max-w-5xl max-h-[90vh] px-16" onClick={(e) => e.stopPropagation()}>
            <img
              src={allImages[selectedIndex]}
              alt={`${shopName} 画像${selectedIndex + 1}`}
              className="max-w-full max-h-[90vh] object-contain"
            />
          </div>

          {/* 次へボタン */}
          {allImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full text-white transition-colors"
              aria-label="次の画像"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* 画像インデックス */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black bg-opacity-50 rounded-full text-white text-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        </div>
      )}
    </>
  );
}