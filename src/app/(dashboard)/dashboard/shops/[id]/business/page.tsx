"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Loader2 } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getShopFrees, createShopFree, deleteShopFree } from "@/lib/api/frees";
import { getShopSet, createShopSet, deleteShopSet } from "@/lib/api/sets";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import ShopBusinessTypeForm from "@/app/shops/components/ShopBusinessTypeForm";

interface BusinessTypeData {
  three_player_free: boolean;
  four_player_free: boolean;
  set: boolean;
}

interface BusinessTypeIds {
  three_player_free_id: number | null;
  four_player_free_id: number | null;
  set_id: number | null;
}

export default function BusinessTypeEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // フォームデータ
  const [businessTypes, setBusinessTypes] = useState<BusinessTypeData>({
    three_player_free: false,
    four_player_free: false,
    set: false,
  });

  // 初期状態（変更検出用）
  const [initialBusinessTypes, setInitialBusinessTypes] = useState<BusinessTypeData>({
    three_player_free: false,
    four_player_free: false,
    set: false,
  });

  // ID管理（削除時に必要）
  const [businessTypeIds, setBusinessTypeIds] = useState<BusinessTypeIds>({
    three_player_free_id: null,
    four_player_free_id: null,
    set_id: null,
  });

  // バリデーション状態
  const [isValid, setIsValid] = useState(false);

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("=== 営業形態データ取得開始 ===", { shopId });

        // 店舗情報取得
        const shopResponse = await getMyShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報の取得に失敗しました");
        }
        setShop(shopResponse.data);

        // フリー情報取得
        const freesResponse = await getShopFrees(Number(shopId));
        console.log("=== フリー情報取得結果 ===", freesResponse);

        let threePlayerFreeId = null;
        let fourPlayerFreeId = null;

        if (freesResponse.success && freesResponse.data?.by_format) {
          const threePlayer = freesResponse.data.by_format.three_player;
          const fourPlayer = freesResponse.data.by_format.four_player;

          if (threePlayer) {
            threePlayerFreeId = threePlayer.id;
          }
          if (fourPlayer) {
            fourPlayerFreeId = fourPlayer.id;
          }
        }

        // セット情報取得
        const setResponse = await getShopSet(Number(shopId));
        console.log("=== セット情報取得結果 ===", setResponse);

        let setId = null;
        if (setResponse.success && setResponse.data?.has_set && setResponse.data.set_data) {
          setId = setResponse.data.set_data.id;
        }

        // 状態を設定
        const currentState = {
          three_player_free: threePlayerFreeId !== null,
          four_player_free: fourPlayerFreeId !== null,
          set: setId !== null,
        };

        setBusinessTypes(currentState);
        setInitialBusinessTypes(currentState);
        setBusinessTypeIds({
          three_player_free_id: threePlayerFreeId,
          four_player_free_id: fourPlayerFreeId,
          set_id: setId,
        });

        console.log("=== 初期状態設定完了 ===", {
          currentState,
          ids: {
            three_player_free_id: threePlayerFreeId,
            four_player_free_id: fourPlayerFreeId,
            set_id: setId,
          },
        });

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
    if (!isValid) {
      setError("最低1つの営業形態を選択してください。");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("=== 保存処理開始 ===", {
        current: businessTypes,
        initial: initialBusinessTypes,
        ids: businessTypeIds,
      });

      const errors: string[] = [];
      const successes: string[] = [];

      // 三麻フリーの処理
      if (businessTypes.three_player_free !== initialBusinessTypes.three_player_free) {
        if (businessTypes.three_player_free) {
          // 作成
          const result = await createShopFree(Number(shopId), { game_format: "THREE_PLAYER" });
          if (result.success) {
            successes.push("三麻フリーを追加しました");
          } else {
            errors.push(`三麻フリーの追加に失敗: ${result.message}`);
          }
        } else {
          // 削除
          if (businessTypeIds.three_player_free_id) {
            const result = await deleteShopFree(Number(shopId), businessTypeIds.three_player_free_id);
            if (result.success) {
              successes.push("三麻フリーを削除しました");
            } else {
              errors.push(`三麻フリーの削除に失敗: ${result.message}`);
            }
          }
        }
      }

      // 四麻フリーの処理
      if (businessTypes.four_player_free !== initialBusinessTypes.four_player_free) {
        if (businessTypes.four_player_free) {
          // 作成
          const result = await createShopFree(Number(shopId), { game_format: "FOUR_PLAYER" });
          if (result.success) {
            successes.push("四麻フリーを追加しました");
          } else {
            errors.push(`四麻フリーの追加に失敗: ${result.message}`);
          }
        } else {
          // 削除
          if (businessTypeIds.four_player_free_id) {
            const result = await deleteShopFree(Number(shopId), businessTypeIds.four_player_free_id);
            if (result.success) {
              successes.push("四麻フリーを削除しました");
            } else {
              errors.push(`四麻フリーの削除に失敗: ${result.message}`);
            }
          }
        }
      }

      // セットの処理
      if (businessTypes.set !== initialBusinessTypes.set) {
        if (businessTypes.set) {
          // 作成
          const result = await createShopSet(Number(shopId));
          if (result.success) {
            successes.push("セットを追加しました");
          } else {
            errors.push(`セットの追加に失敗: ${result.message}`);
          }
        } else {
          // 削除
          if (businessTypeIds.set_id) {
            const result = await deleteShopSet(Number(shopId));
            if (result.success) {
              successes.push("セットを削除しました");
            } else {
              errors.push(`セットの削除に失敗: ${result.message}`);
            }
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
      } else {
        setSuccessMessage("変更はありませんでした。");
      }

    } catch (err: any) {
      console.error("=== 保存エラー ===", err);
      setError(err.message || "営業形態の更新に失敗しました。");
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

  const canSubmit = isValid && !submitting;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">営業形態の編集</h1>
        <p className="text-gray-600">
          店舗で提供している営業形態を編集します。
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 営業形態フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShopBusinessTypeForm
          value={businessTypes}
          onChange={setBusinessTypes}
          onValidationChange={setIsValid}
        />
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {canSubmit ? "保存する準備ができました" : "入力内容を確認してください"}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
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