// src/lib/utils/image.ts

/**
 * ストレージパスからフルURLを生成
 */
export function getImageUrl(path: string | null | undefined): string | null {
  if (!path) return null;
  
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL || 'http://localhost:8000/storage';
  
  // すでにフルURLの場合はそのまま返す
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // パスの先頭のスラッシュを削除
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  return `${storageUrl}/${cleanPath}`;
}

/**
 * 画像パスオブジェクトから指定サイズのURLを取得
 */
export function getImageUrlBySize(
  imagePaths: { [key: string]: string } | null | undefined,
  size: 'thumb' | 'medium' | 'large' | 'original' = 'medium'
): string | null {
  if (!imagePaths) return null;
  
  const path = imagePaths[size];
  return getImageUrl(path);
}