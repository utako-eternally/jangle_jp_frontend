// src/components/layout/Header.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { Button } from '@/components/ui/button';

export default function Header() {
  const { isAuthenticated, user, handleLogout } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          雀荘ポータル
        </Link>
        
        <nav className="flex items-center gap-6">
          <Link href="/shops" className="hover:text-primary transition-colors">
            雀荘を探す
          </Link>
          <Link href="/blog" className="hover:text-primary transition-colors">
            ブログ
          </Link>
          
          {isAuthenticated ? (
            <>
              <Link href="/mypage" className="hover:text-primary transition-colors">
                マイページ
              </Link>
              <Button variant="outline" onClick={handleLogout}>
                ログアウト
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline">ログイン</Button>
              </Link>
              <Link href="/register">
                <Button>新規登録</Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}