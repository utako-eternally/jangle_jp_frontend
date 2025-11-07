// src/app/(dashboard)/dashboard/shops/[id]/layout.tsx
"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard,
  FileText,
  Train,
  Briefcase,
  Star,
  ClipboardList,
  Utensils,
  Target,
  Users,
  Image as ImageIcon,
  MessageCircle,
  Crown,
  Lock,
  PenSquare,
  Clock // 追加
} from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";

export default function ShopDetailLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const pathname = usePathname();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadShop = async () => {
      console.log('=== 店舗詳細取得開始 ===', { shopId });
      
      try {
        const response = await getMyShop(Number(shopId));
        console.log('=== 店舗詳細取得レスポンス ===', response);
        console.log('=== response.data の内容 ===', response.data);
        console.log('=== activePlan の内容 ===', response.data?.activePlan);
        console.log('=== activePlan.plan_type ===', response.data?.activePlan?.plan_type);
        console.log('=== activePlan.status ===', response.data?.activePlan?.status);
        
        if (response.success && response.data) {
          setShop(response.data);
        } else {
          console.error('=== 店舗詳細取得失敗 ===', response);
          setError("店舗情報の取得に失敗しました。");
        }
      } catch (err: any) {
        console.error('=== 店舗詳細取得エラー ===', err);
        console.error('エラー詳細:', err.response?.data);
        setError(err.response?.data?.message || "店舗情報の取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  // 有料プランかどうか判定
  const isPaidPlan = shop?.active_plan?.plan_type === 'paid';

  // サイドバーメニュー項目
  const menuItems = [
    { href: `/dashboard/shops/${shopId}`, label: "概要", Icon: LayoutDashboard, locked: false },
    { href: `/dashboard/shops/${shopId}/basic`, label: "基本情報", Icon: FileText, locked: false },
    { href: `/dashboard/shops/${shopId}/hours`, label: "営業時間", Icon: Clock, locked: false }, // 追加
    { href: `/dashboard/shops/${shopId}/stations`, label: "駅情報", Icon: Train, locked: false },
    { href: `/dashboard/shops/${shopId}/business`, label: "営業形態", Icon: Briefcase, locked: false },
    { href: `/dashboard/shops/${shopId}/features`, label: "特徴", Icon: Star, locked: false },
    { href: `/dashboard/shops/${shopId}/rules`, label: "ルール", Icon: ClipboardList, locked: false },
    { href: `/dashboard/shops/${shopId}/services`, label: "サービス", Icon: Sparkles, locked: false },
    { href: `/dashboard/shops/${shopId}/menus`, label: "メニュー", Icon: Utensils, locked: false },
    { href: `/dashboard/shops/${shopId}/prices`, label: "料金設定", Icon: Target, locked: false },
    { href: `/dashboard/shops/${shopId}/gallery`, label: "ギャラリー", Icon: ImageIcon, locked: !isPaidPlan },
    { href: `/dashboard/shops/${shopId}/line`, label: "LINE連携", Icon: MessageCircle, locked: !isPaidPlan },
    { href: `/dashboard/shops/${shopId}/plan`, label: "プラン管理", Icon: Crown, locked: false },
  ];

  const isActive = (href: string) => {
    if (href === `/dashboard/shops/${shopId}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop) {
    return (
      <div className="max-w-2xl mx-auto py-12">
        <ErrorMessage message={error || "店舗が見つかりません。"} />
        <div className="mt-4 text-center">
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-700"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-6">
      {/* サイドバー */}
      <aside className="w-64 flex-shrink-0">
        <div className="bg-white rounded-lg shadow sticky top-6">
          {/* 店舗情報ヘッダー */}
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900 truncate" title={shop.name}>
              {shop.name}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              {shop.address_pref} {shop.address_city}
            </p>
          </div>

          {/* ブログ管理ボタン */}
          <div className="p-3 border-b border-gray-200">
            <Link
              href={isPaidPlan ? `/dashboard/shops/${shopId}/blog` : `/dashboard/shops/${shopId}/plan`}
              className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                isPaidPlan
                  ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  : "bg-gray-50 text-gray-500 hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center space-x-2">
                <PenSquare className="w-4 h-4" />
                <span className="font-medium">ブログ管理</span>
              </div>
              {!isPaidPlan && <Lock className="w-3 h-3" />}
            </Link>
          </div>

          {/* 店舗設定セクション */}
          <div className="px-3 pt-3 pb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              店舗設定
            </p>
          </div>

          {/* メニュー */}
          <nav className="p-2">
            {menuItems.map((item) => {
              const Icon = item.Icon;
              const targetHref = item.locked ? `/dashboard/shops/${shopId}/plan` : item.href;
              
              return (
                <Link
                  key={item.href}
                  href={targetHref}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : item.locked
                      ? "text-gray-400 hover:bg-gray-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.locked && <Lock className="w-3 h-3" />}
                </Link>
              );
            })}
          </nav>

          {/* 戻るリンク */}
          <div className="p-4 border-t border-gray-200">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
            >
              <span>←</span>
              <span>ダッシュボードに戻る</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* メインコンテンツ */}
      <main className="flex-1 min-w-0">
        {children}
      </main>
    </div>
  );
}