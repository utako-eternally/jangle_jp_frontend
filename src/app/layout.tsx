// src/app/layout.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "全国の雀荘を検索 Jangle",
  description: "雀荘オーナー向け管理システム",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        {children}
        
        {/* フッター - 黒ベース・コンパクト・右揃え版 */}
        <footer className="bg-gray-900 border-t border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-wrap gap-6 justify-end text-sm text-gray-400">
              <Link href="/privacy" className="hover:text-gray-200 transition-colors">
                プライバシーポリシー
              </Link>
              <Link href="/terms" className="hover:text-gray-200 transition-colors">
                利用規約
              </Link>
              <Link href="/legal" className="hover:text-gray-200 transition-colors">
                特定商取引法に基づく表記
              </Link>
            </div>
            <div className="mt-3 text-sm text-gray-500 text-right">
              © 2025 Jangle by Config. All rights reserved.
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}