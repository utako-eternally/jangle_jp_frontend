// src/components/pagination/Pagination.tsx
'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  baseUrl?: string;
}

export default function Pagination({ currentPage, totalPages, baseUrl }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URLを構築
  const buildUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page');
    } else {
      params.set('page', page.toString());
    }
    const queryString = params.toString();
    const url = baseUrl || pathname;
    return queryString ? `${url}?${queryString}` : url;
  };

  // ページ番号の配列を生成
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 7; // 表示する最大ページ数

    if (totalPages <= maxVisible) {
      // 全ページを表示
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // 省略表示
      if (currentPage <= 4) {
        // 最初の方
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 3) {
        // 最後の方
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // 中間
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = getPageNumbers();

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="ページネーション">
      {/* 前へボタン */}
      {currentPage > 1 ? (
        <Link
          href={buildUrl(currentPage - 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          前へ
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4" />
          前へ
        </button>
      )}

      {/* ページ番号 */}
      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <Link
              key={pageNum}
              href={buildUrl(pageNum)}
              className={`min-w-[40px] px-3 py-2 text-sm font-medium rounded-lg transition-colors text-center ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {pageNum}
            </Link>
          );
        })}
      </div>

      {/* 次へボタン */}
      {currentPage < totalPages ? (
        <Link
          href={buildUrl(currentPage + 1)}
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          次へ
          <ChevronRight className="w-4 h-4" />
        </Link>
      ) : (
        <button
          disabled
          className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded-lg cursor-not-allowed"
        >
          次へ
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
}