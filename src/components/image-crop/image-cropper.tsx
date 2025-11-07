// src/components/image-crop/image-cropper.tsx
'use client';

import { useState, useRef } from 'react';
import ReactCrop, { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface ImageCropperProps {
  imageSrc: string;
  aspect?: number;
  onCropComplete: (croppedImage: Blob) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageSrc,
  aspect = 1,
  onCropComplete,
  onCancel,
}: ImageCropperProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();

  // 画像読み込み完了時にクロップ領域を設定
  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    
    // アスペクト比に応じてクロップサイズを調整
    let cropWidth, cropHeight;
    
    if (aspect === 1) {
      // 正方形の場合
      const size = Math.min(width, height);
      cropWidth = cropHeight = size * 0.8;
    } else if (aspect === 16/9) {
      // 16:9の場合
      if (width / height > 16 / 9) {
        // 横長画像
        cropHeight = height * 0.8;
        cropWidth = cropHeight * (16 / 9);
      } else {
        // 縦長画像
        cropWidth = width * 0.8;
        cropHeight = cropWidth / (16 / 9);
      }
    } else {
      // その他のアスペクト比
      cropWidth = width * 0.8;
      cropHeight = height * 0.8;
    }
    
    const newCrop: Crop = {
      unit: 'px',
      width: cropWidth,
      height: cropHeight,
      x: (width - cropWidth) / 2,
      y: (height - cropHeight) / 2,
    };
    
    setCrop(newCrop);
  };

  const getCroppedImg = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const cropWidth = completedCrop.width * scaleX;
    const cropHeight = completedCrop.height * scaleY;

    canvas.width = cropWidth;
    canvas.height = cropHeight;

    ctx.drawImage(
      image,
      cropX,
      cropY,
      cropWidth,
      cropHeight,
      0,
      0,
      cropWidth,
      cropHeight
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
      }, 'image/jpeg', 0.95);
    });
  };

  const handleCropComplete = async () => {
    const croppedImage = await getCroppedImg();
    if (croppedImage) {
      onCropComplete(croppedImage);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            画像をトリミング
            {aspect === 1 && (
              <span className="ml-2 text-sm text-gray-500">（正方形）</span>
            )}
            {aspect === 16/9 && (
              <span className="ml-2 text-sm text-gray-500">（横長 16:9）</span>
            )}
          </h3>

          <div className="mb-4 flex justify-center">
            <ReactCrop
              crop={crop}
              onChange={(c) => setCrop(c)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={aspect}
            >
              <img
                ref={imgRef}
                src={imageSrc}
                alt="Crop preview"
                onLoad={onImageLoad}
                style={{ maxHeight: '60vh', maxWidth: '100%' }}
              />
            </ReactCrop>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleCropComplete}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              トリミング完了
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}