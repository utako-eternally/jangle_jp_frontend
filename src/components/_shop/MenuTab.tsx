// src/components/shop/MenuTab.tsx
import { useEffect, useState } from 'react';
import { ShopMenu } from '@/types/models';
import { Utensils, Beer, Coffee, MoreHorizontal } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface MenuTabProps {
  shopId: number;
  menus?: ShopMenu[];
}

export default function MenuTab({ shopId, menus }: MenuTabProps) {
  const [loading, setLoading] = useState(!menus);
  const [menuList, setMenuList] = useState<ShopMenu[]>(menus || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!menus) {
      // menusが渡されていない場合は、APIから取得する処理を追加可能
      // 現状はshopオブジェクトから渡されることを想定
      setLoading(false);
    }
  }, [menus]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'FOOD':
        return <Utensils className="w-5 h-5 text-red-500" />;
      case 'DRINK':
        return <Coffee className="w-5 h-5 text-blue-500" />;
      case 'ALCOHOL':
        return <Beer className="w-5 h-5 text-amber-500" />;
      default:
        return <MoreHorizontal className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'FOOD':
        return 'フード';
      case 'DRINK':
        return 'ドリンク';
      case 'ALCOHOL':
        return 'アルコール';
      default:
        return 'その他';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (!menuList || menuList.length === 0) {
    return (
      <div className="text-center py-12">
        <Utensils className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">メニュー情報はまだ登録されていません</p>
      </div>
    );
  }

  // カテゴリ別にグループ化
  const categorizedMenus = {
    FOOD: menuList.filter(m => m.category === 'FOOD' && m.is_available),
    DRINK: menuList.filter(m => m.category === 'DRINK' && m.is_available),
    ALCOHOL: menuList.filter(m => m.category === 'ALCOHOL' && m.is_available),
    OTHER: menuList.filter(m => m.category === 'OTHER' && m.is_available),
  };

  return (
    <div className="space-y-6">
      {Object.entries(categorizedMenus).map(([category, items]) => {
        if (items.length === 0) return null;

        return (
          <section key={category}>
            <div className="flex items-center gap-2 mb-4">
              {getCategoryIcon(category)}
              <h3 className="text-xl font-bold text-gray-900">
                {getCategoryLabel(category)}
              </h3>
              <span className="text-sm text-gray-500">
                ({items.length}品)
              </span>
            </div>

            <div className="grid gap-3">
              {items.map((menu) => (
                <div
                  key={menu.id}
                  className="flex items-start justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 min-w-0 mr-4">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {menu.item_name}
                    </h4>
                    {menu.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {menu.description}
                      </p>
                    )}
                  </div>
                  <div className="flex-shrink-0 text-right">
                    <div className="text-xl font-bold text-gray-900">
                      ¥{menu.price.toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          ※ 価格は税込表示です。メニュー内容や価格は変更される場合があります。
        </p>
      </div>
    </div>
  );
}