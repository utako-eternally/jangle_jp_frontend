// src/app/(dashboard)/dashboard/shops/[id]/menus/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus, Edit2, Trash2, X, Save, Loader2, UtensilsCrossed } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getShopMenus, createShopMenu, updateShopMenu, deleteShopMenu, getMenuCategories } from "@/lib/api/menus";
import { Shop, ShopMenu } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

type MenuCategory = "FOOD" | "DRINK" | "ALCOHOL" | "OTHER";

interface MenuFormData {
  category: MenuCategory;
  item_name: string;
  description: string;
  price: number;
  is_available: boolean;
}

export default function MenusPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [menus, setMenus] = useState<ShopMenu[]>([]);
  const [categories, setCategories] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // モーダル管理
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<ShopMenu | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // フォームデータ
  const [formData, setFormData] = useState<MenuFormData>({
    category: "FOOD",
    name: "",
    description: "",
    price: 0,
    is_available: true,
  });

  // データ取得
  useEffect(() => {
    loadData();
  }, [shopId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);

      // カテゴリ一覧取得
      const categoriesResponse = await getMenuCategories();
      if (categoriesResponse.success && categoriesResponse.data?.categories) {
        setCategories(categoriesResponse.data.categories);
      }

      // メニュー一覧取得
      const menusResponse = await getShopMenus(Number(shopId));
      if (menusResponse.success && menusResponse.data?.menus) {
        setMenus(menusResponse.data.menus);
      }

    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 新規追加モーダルを開く
  const handleOpenAddModal = () => {
    setEditingMenu(null);
    setFormData({
      category: "FOOD",
      item_name: "",
      description: "",
      price: 0,
      is_available: true,
    });
    setIsModalOpen(true);
  };

  // 編集モーダルを開く
  const handleOpenEditModal = (menu: ShopMenu) => {
    setEditingMenu(menu);
    setFormData({
      category: menu.category as MenuCategory,
      item_name: menu.item_name,
      description: menu.description || "",
      price: menu.price,
      is_available: menu.is_available,
    });
    setIsModalOpen(true);
  };

  // モーダルを閉じる
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMenu(null);
    setFormData({
      category: "FOOD",
      item_name: "",
      description: "",
      price: 0,
      is_available: true,
    });
  };

  // 保存処理
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      if (editingMenu) {
        // 更新
        const result = await updateShopMenu(Number(shopId), editingMenu.id, formData);
        if (!result.success) {
          throw new Error(result.message || "メニューの更新に失敗しました");
        }
        setSuccessMessage("メニューを更新しました。");
      } else {
        // 新規作成
        const result = await createShopMenu(Number(shopId), formData);
        if (!result.success) {
          throw new Error(result.message || "メニューの作成に失敗しました");
        }
        setSuccessMessage("メニューを追加しました。");
      }

      handleCloseModal();
      await loadData();

    } catch (err: any) {
      console.error("保存エラー:", err);
      setError(err.message || "メニューの保存に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  // 削除処理
  const handleDelete = async (menuId: number) => {
    if (!confirm("このメニューを削除してもよろしいですか？")) {
      return;
    }

    try {
      const result = await deleteShopMenu(Number(shopId), menuId);
      if (!result.success) {
        throw new Error(result.message || "メニューの削除に失敗しました");
      }

      setSuccessMessage("メニューを削除しました。");
      await loadData();

    } catch (err: any) {
      console.error("削除エラー:", err);
      setError(err.message || "メニューの削除に失敗しました。");
    }
  };

  // 販売状況の切り替え
  const handleToggleAvailability = async (menu: ShopMenu) => {
    try {
      const result = await updateShopMenu(Number(shopId), menu.id, {
        is_available: !menu.is_available,
      });

      if (!result.success) {
        throw new Error(result.message || "販売状況の更新に失敗しました");
      }

      setSuccessMessage(`「${menu.item_name}」を${!menu.is_available ? "販売中" : "販売停止"}にしました。`);
      await loadData();

    } catch (err: any) {
      console.error("販売状況更新エラー:", err);
      setError(err.message || "販売状況の更新に失敗しました。");
    }
  };

  // カテゴリ別にメニューをグループ化
  const groupMenusByCategory = () => {
    const grouped: { [key: string]: ShopMenu[] } = {};

    menus.forEach(menu => {
      if (!grouped[menu.category]) {
        grouped[menu.category] = [];
      }
      grouped[menu.category].push(menu);
    });

    return grouped;
  };

  const groupedMenus = groupMenusByCategory();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shop) {
    return <ErrorMessage message="店舗情報が見つかりません。" />;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">メニュー管理</h1>
            <p className="text-gray-600">
              店舗で提供するメニューを管理できます
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            新規追加
          </button>
        </div>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* メニュー一覧 */}
      {Object.keys(groupedMenus).length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <UtensilsCrossed className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-500 mb-4">まだメニューが登録されていません</p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            最初のメニューを追加
          </button>
        </div>
      ) : (
        Object.entries(groupedMenus).map(([category, categoryMenus]) => (
          <div key={category} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                {categories[category] || category}
              </h2>
              <span className="text-sm text-gray-500">
                {categoryMenus.length}件
              </span>
            </div>

            <div className="space-y-3">
              {categoryMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    {/* メニュー情報 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900 mb-1">
                            {menu.item_name}
                          </h3>
                          {menu.description && (
                            <p className="text-sm text-gray-600 mb-2">
                              {menu.description}
                            </p>
                          )}
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-semibold text-gray-900">
                            ¥{menu.price.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* アクションボタン */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleAvailability(menu)}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            menu.is_available
                              ? "bg-green-100 text-green-800 hover:bg-green-200"
                              : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                          }`}
                        >
                          {menu.is_available ? "販売中" : "販売停止中"}
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(menu)}
                          className="flex items-center px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Edit2 className="w-3 h-3 mr-1" />
                          編集
                        </button>

                        <button
                          onClick={() => handleDelete(menu.id)}
                          className="flex items-center px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          削除
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* 編集モーダル */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingMenu ? "メニューを編集" : "新規メニュー追加"}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* カテゴリ */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    カテゴリ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as MenuCategory })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    {Object.entries(categories).map(([key, label]) => (
                      <option key={key} value={key}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 商品名 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    商品名 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="例：唐揚げ"
                    required
                  />
                </div>

                {/* 価格 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    価格（円） <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="500"
                    min="0"
                    required
                  />
                </div>

                {/* 説明 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    説明（任意）
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="商品の説明を入力してください"
                  />
                </div>

                {/* 販売状況 */}
                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      販売中として公開する
                    </span>
                  </label>
                </div>

                {/* ボタン */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    キャンセル
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                      submitting
                        ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}