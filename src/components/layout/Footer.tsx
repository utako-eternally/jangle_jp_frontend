// src/components/layout/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">雀荘ポータル</h3>
            <p className="text-sm text-gray-600">
              全国の雀荘を検索できるポータルサイト
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">メニュー</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/shops" className="text-gray-600 hover:text-primary transition-colors">
                  雀荘を探す
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-primary transition-colors">
                  ブログ
                </Link>
              </li>
              <li>
                <Link href="/mypage" className="text-gray-600 hover:text-primary transition-colors">
                  マイページ
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">サポート</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-gray-600 hover:text-primary transition-colors">
                  利用規約
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-primary transition-colors">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-primary transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
          © {currentYear} 雀荘ポータル. All rights reserved.
        </div>
      </div>
    </footer>
  );
}