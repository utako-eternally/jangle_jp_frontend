// src/app/(dashboard)/dashboard/shops/[id]/features/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, Star, Users, Info } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getAvailableFeatures, getShopFeatures, updateShopFeatures } from "@/lib/api/features";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface Feature {
  key: string;
  name: string;
  description: string;
}

interface CategoryFeatures {
  name: string;
  features: Feature[];
}

export default function FeaturesEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 利用可能な特徴（カテゴリ別）
  const [categorizedFeatures, setCategorizedFeatures] = useState<Record<string, CategoryFeatures>>({});
  
  // 選択中の特徴
  const [selectedFeatures, setSelectedFeatures] = useState<Set<string>>(new Set());

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("=== 特徴データ取得開始 ===", { shopId });

        // 店舗情報取得
        const shopResponse = await getMyShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報の取得に失敗しました");
        }
        setShop(shopResponse.data);

        // 利用可能な特徴取得
        const availableResponse = await getAvailableFeatures();
        console.log("=== 利用可能な特徴 ===", availableResponse);
        console.log("=== categorized_features ===", availableResponse.data?.categorized_features);

        if (availableResponse.success && availableResponse.data?.categorized_features) {
          const features = availableResponse.data.categorized_features;
          console.log("=== 設定する特徴 ===", features);
          setCategorizedFeatures(features);
        } else {
          console.warn("=== 特徴データが取得できませんでした ===");
        }

        // 現在の特徴取得
        const currentResponse = await getShopFeatures(Number(shopId));
        console.log("=== 現在の特徴 ===", currentResponse);

        if (currentResponse.success && currentResponse.data?.all_features) {
          const currentFeatureKeys = currentResponse.data.all_features.map(
            (f: any) => f.feature
          );
          setSelectedFeatures(new Set(currentFeatureKeys));
          console.log("=== 選択中の特徴 ===", currentFeatureKeys);
        }

      } catch (err: any) {
        console.error("=== データ取得エラー ===", err);
        setError(err.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // 特徴の選択/解除
  const toggleFeature = (featureKey: string) => {
    const newSelected = new Set(selectedFeatures);
    if (newSelected.has(featureKey)) {
      newSelected.delete(featureKey);
    } else {
      newSelected.add(featureKey);
    }
    setSelectedFeatures(newSelected);
  };

  // 保存処理
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("=== 保存処理開始 ===", {
        selectedFeatures: Array.from(selectedFeatures),
      });

      const result = await updateShopFeatures(
        Number(shopId),
        { features: Array.from(selectedFeatures) }
      );

      if (!result.success) {
        throw new Error(result.message || "更新に失敗しました");
      }

      setSuccessMessage(result.message || "特徴を更新しました。");

      // 2秒後に概要ページへ遷移
      setTimeout(() => {
        router.push(`/dashboard/shops/${shopId}`);
      }, 2000);

    } catch (err: any) {
      console.error("=== 保存エラー ===", err);
      setError(err.message || "特徴の更新に失敗しました。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // カテゴリ別の色設定
  const getCategoryColor = (categoryKey: string) => {
    const colors: Record<string, string> = {
      game_style: "blue",
      staff: "purple",
      facility: "green",
      service: "orange",
    };
    return colors[categoryKey] || "gray";
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

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">店舗特徴の編集</h1>
        <p className="text-gray-600">
          店舗の特徴を選択してください（複数選択可能）
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 選択状況 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">選択中の特徴</h2>
          <span className="text-sm text-gray-600">
            {selectedFeatures.size}件選択中
          </span>
        </div>
        
        {selectedFeatures.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedFeatures).map((key) => {
              // 特徴名を取得
              let featureName = key;
              Object.values(categorizedFeatures).forEach((category) => {
                const feature = category.features.find((f) => f.key === key);
                if (feature) {
                  featureName = feature.name;
                }
              });

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {featureName}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">特徴が選択されていません</p>
        )}
      </div>

      {/* カテゴリ別特徴選択 */}
      {Object.keys(categorizedFeatures).length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            利用可能な特徴が読み込めていません。コンソールを確認してください。
          </p>
          <pre className="text-xs mt-2 overflow-auto">
            {JSON.stringify(categorizedFeatures, null, 2)}
          </pre>
        </div>
      )}
      
      {Object.entries(categorizedFeatures).map(([categoryKey, category]) => {
        const color = getCategoryColor(categoryKey);
        
        return (
          <div key={categoryKey} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              {categoryKey === "game_style" && <Star className="w-5 h-5 mr-2 text-blue-600" />}
              {categoryKey === "staff" && <Users className="w-5 h-5 mr-2 text-purple-600" />}
              {category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.features.map((feature) => {
                const isSelected = selectedFeatures.has(feature.key);

                return (
                  <div
                    key={feature.key}
                    onClick={() => toggleFeature(feature.key)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? `border-${color}-500 bg-${color}-50`
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`font-medium ${
                          isSelected ? `text-${color}-900` : "text-gray-900"
                        }`}
                      >
                        {feature.name}
                      </h3>
                      {isSelected && (
                        <CheckCircle className={`w-5 h-5 text-${color}-600 flex-shrink-0`} />
                      )}
                    </div>

                    <p
                      className={`text-sm ${
                        isSelected ? `text-${color}-700` : "text-gray-600"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <h4 className="font-medium mb-1">特徴について</h4>
            <ul className="space-y-1 text-xs">
              <li>• 店舗の特徴を複数選択できます</li>
              <li>• 選択した特徴は公開ページに表示されます</li>
              <li>• 特徴は後からでも変更できます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedFeatures.size > 0
                ? `${selectedFeatures.size}件の特徴が選択されています`
                : "特徴を選択してください（任意）"}
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