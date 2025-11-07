// src/app/(dashboard)/dashboard/shops/[id]/prices/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Loader2, Coins, Users, Building2, Info } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getShopFrees, updateShopFree } from "@/lib/api/frees";
import { getShopSet, updateShopSet } from "@/lib/api/sets";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface PriceData {
  three_player_free?: {
    id: number;
    price: number;
  };
  four_player_free?: {
    id: number;
    price: number;
  };
  set?: {
    id: number;
    price: number;
  };
}

export default function FreeSetPricePage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 料金データ
  const [priceData, setPriceData] = useState<PriceData>({});
  
  // 入力値
  const [threePlayerPrice, setThreePlayerPrice] = useState("");
  const [fourPlayerPrice, setFourPlayerPrice] = useState("");
  const [setPrice, setSetPrice] = useState("");

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("=== 料金データ取得開始 ===", { shopId });

        // 店舗情報取得
        const shopResponse = await getMyShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報の取得に失敗しました");
        }
        setShop(shopResponse.data);

        const newPriceData: PriceData = {};

        // フリー情報取得
        const freesResponse = await getShopFrees(Number(shopId));
        console.log("=== フリー情報取得結果 ===", freesResponse);

        if (freesResponse.success && freesResponse.data?.by_format) {
          const threePlayer = freesResponse.data.by_format.three_player;
          const fourPlayer = freesResponse.data.by_format.four_player;

          if (threePlayer) {
            newPriceData.three_player_free = {
              id: threePlayer.id,
              price: threePlayer.price,
            };
            setThreePlayerPrice(String(threePlayer.price));
          }

          if (fourPlayer) {
            newPriceData.four_player_free = {
              id: fourPlayer.id,
              price: fourPlayer.price,
            };
            setFourPlayerPrice(String(fourPlayer.price));
          }
        }

        // セット情報取得
        const setResponse = await getShopSet(Number(shopId));
        console.log("=== セット情報取得結果 ===", setResponse);

        if (setResponse.success && setResponse.data?.has_set && setResponse.data.set_data) {
          newPriceData.set = {
            id: setResponse.data.set_data.id,
            price: setResponse.data.set_data.price,
          };
          setSetPrice(String(setResponse.data.set_data.price));
        }

        setPriceData(newPriceData);
        console.log("=== 料金データ設定完了 ===", newPriceData);

      } catch (err: any) {
        console.error("=== データ取得エラー ===", err);
        setError(err.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // 保存処理
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("=== 保存処理開始 ===");

      const errors: string[] = [];
      const successes: string[] = [];

      // 三麻フリー料金更新
      if (priceData.three_player_free) {
        const newPrice = parseInt(threePlayerPrice);
        if (isNaN(newPrice) || newPrice < 0) {
          errors.push("三麻フリーの料金が正しくありません");
        } else if (newPrice !== priceData.three_player_free.price) {
          const result = await updateShopFree(
            Number(shopId),
            priceData.three_player_free.id,
            { price: newPrice }
          );
          if (result.success) {
            successes.push("三麻フリーの料金を更新しました");
          } else {
            errors.push(`三麻フリー料金の更新に失敗: ${result.message}`);
          }
        }
      }

      // 四麻フリー料金更新
      if (priceData.four_player_free) {
        const newPrice = parseInt(fourPlayerPrice);
        if (isNaN(newPrice) || newPrice < 0) {
          errors.push("四麻フリーの料金が正しくありません");
        } else if (newPrice !== priceData.four_player_free.price) {
          const result = await updateShopFree(
            Number(shopId),
            priceData.four_player_free.id,
            { price: newPrice }
          );
          if (result.success) {
            successes.push("四麻フリーの料金を更新しました");
          } else {
            errors.push(`四麻フリー料金の更新に失敗: ${result.message}`);
          }
        }
      }

      // セット料金更新
      if (priceData.set) {
        const newPrice = parseInt(setPrice);
        if (isNaN(newPrice) || newPrice < 0) {
          errors.push("セットの料金が正しくありません");
        } else if (newPrice !== priceData.set.price) {
          const result = await updateShopSet(Number(shopId), { price: newPrice });
          if (result.success) {
            successes.push("セットの料金を更新しました");
          } else {
            errors.push(`セット料金の更新に失敗: ${result.message}`);
          }
        }
      }

      console.log("=== 保存処理完了 ===", { successes, errors });

      if (errors.length > 0) {
        setError(errors.join("\n"));
      }

      if (successes.length > 0) {
        setSuccessMessage(successes.join("\n"));
        
        // 2秒後に概要ページへ遷移
        setTimeout(() => {
          router.push(`/dashboard/shops/${shopId}`);
        }, 2000);
      } else if (errors.length === 0) {
        setSuccessMessage("変更はありませんでした。");
      }

    } catch (err: any) {
      console.error("=== 保存エラー ===", err);
      setError(err.message || "料金の更新に失敗しました。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

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

  // 設定可能な営業形態がない場合
  const hasAnyBusinessType = priceData.three_player_free || priceData.four_player_free || priceData.set;

  if (!hasAnyBusinessType) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">料金設定</h1>
          <p className="text-gray-600">
            営業形態が設定されていません。
          </p>
        </div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <Info className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium mb-1">営業形態を設定してください</p>
              <p>料金を設定する前に、まず営業形態（フリー・セット）を設定する必要があります。</p>
              <button
                onClick={() => router.push(`/dashboard/shops/${shopId}/business`)}
                className="mt-2 text-yellow-800 underline hover:text-yellow-900"
              >
                営業形態設定ページへ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">料金設定</h1>
        <p className="text-gray-600">
          各営業形態の料金を設定してください
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 料金入力フォーム */}
      <div className="space-y-4">
        {/* 三麻フリー */}
        {priceData.three_player_free && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-orange-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">フリー三麻</h2>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                1ゲーム1人あたりの料金
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={threePlayerPrice}
                  onChange={(e) => setThreePlayerPrice(e.target.value)}
                  min="0"
                  max="999999"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">円</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                例: 1ゲーム500円、1ゲーム1000円など
              </p>
            </div>
          </div>
        )}

        {/* 四麻フリー */}
        {priceData.four_player_free && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Users className="w-6 h-6 text-blue-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">フリー四麻</h2>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                1ゲーム1人あたりの料金
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={fourPlayerPrice}
                  onChange={(e) => setFourPlayerPrice(e.target.value)}
                  min="0"
                  max="999999"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">円</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                例: 1ゲーム500円、1ゲーム1000円など
              </p>
            </div>
          </div>
        )}

        {/* セット */}
        {priceData.set && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Building2 className="w-6 h-6 text-purple-600 mr-3" />
              <h2 className="text-lg font-semibold text-gray-900">セット雀荘</h2>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                1時間あたりの利用料金
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Coins className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  value={setPrice}
                  onChange={(e) => setSetPrice(e.target.value)}
                  min="0"
                  max="999999"
                  className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">円/時間</span>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                例: 1時間1000円、1時間2000円など
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <h4 className="font-medium mb-1">料金について</h4>
            <ul className="space-y-1 text-xs">
              <li>• フリーの料金は1ゲーム1人あたりの金額です</li>
              <li>• セットの料金は1時間あたりの卓の利用料金です</li>
              <li>• 料金は後からでも変更できます</li>
              <li>• 0円に設定することも可能です</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              料金を設定してください
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              submitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>保存中...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                保存する
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}