// src/app/(dashboard)/dashboard/shops/[id]/services/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, Info, Sparkles } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getAvailableServices, getShopServices, updateShopServices } from "@/lib/api/services";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface Service {
  key?: string;
  value?: string;
  name?: string;
  label?: string;
}

interface CategoryServices {
  name: string;
  services: Service[];
}

export default function ServicesEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // 利用可能なサービス（カテゴリ別）
  const [categorizedServices, setCategorizedServices] = useState<Record<string, CategoryServices>>({});
  
  // 選択中のサービス
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("=== サービスデータ取得開始 ===", { shopId });

        // 店舗情報取得
        const shopResponse = await getMyShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報の取得に失敗しました");
        }
        setShop(shopResponse.data);

        // 利用可能なサービス取得
        const availableResponse = await getAvailableServices();
        console.log("=== 利用可能なサービス ===", availableResponse);

        // レスポンス構造を判定
        if (availableResponse.data?.categorized_services) {
          // 新しい構造
          const services = availableResponse.data.categorized_services;
          console.log("=== カテゴリー別サービス（新構造） ===", services);
          setCategorizedServices(services);
        } else if (Array.isArray(availableResponse.data)) {
          // 古い構造（フラットな配列）- カテゴリー別に変換
          console.log("=== フラット構造を検出 - カテゴリー別に変換します ===");
          const flatServices = availableResponse.data as Service[];
          const categorized = convertToCategorized(flatServices);
          setCategorizedServices(categorized);
        } else {
          console.warn("=== サービスデータが取得できませんでした ===");
        }

        // 現在のサービス取得
        const currentResponse = await getShopServices(Number(shopId));
        console.log("=== 現在のサービス ===", currentResponse);

        if (currentResponse.data) {
          let currentServiceKeys: string[] = [];
          
          if (Array.isArray(currentResponse.data)) {
            // 配列の場合
            currentServiceKeys = currentResponse.data.map((s: any) => s.service_type || s.value || s.key);
          } else if (currentResponse.data.all_services) {
            // オブジェクトの場合
            currentServiceKeys = currentResponse.data.all_services.map(
              (s: any) => s.service_type || s.value || s.key
            );
          }
          
          setSelectedServices(new Set(currentServiceKeys));
          console.log("=== 選択中のサービス ===", currentServiceKeys);
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

  // フラット構造をカテゴリー別に変換
  const convertToCategorized = (flatServices: Service[]): Record<string, CategoryServices> => {
    const categoryMap: Record<string, string> = {
      FREE_DRINK: "DRINK",
      FREE_DRINK_SET: "DRINK",
      STUDENT_DISCOUNT: "DISCOUNT",
      FEMALE_DISCOUNT: "DISCOUNT",
      SENIOR_DISCOUNT: "DISCOUNT",
      PARKING_AVAILABLE: "PARKING",
      PARKING_SUBSIDY: "PARKING",
      NON_SMOKING: "SMOKING",
      HEATED_TOBACCO_ALLOWED: "SMOKING",
      SMOKING_ALLOWED: "SMOKING",
      FOOD_AVAILABLE: "FOOD",
      ALCOHOL_AVAILABLE: "FOOD",
      DELIVERY_MENU: "FOOD",
      OUTSIDE_FOOD_ALLOWED: "FOOD",
      PRIVATE_ROOM: "FACILITY",
      FEMALE_TOILET: "FACILITY",
      AUTO_TABLE: "FACILITY",
      SCORE_MANAGEMENT: "FACILITY",
      FREE_WIFI: "FACILITY",
    };

    const categoryNames: Record<string, string> = {
      DRINK: "ドリンク・割引",
      DISCOUNT: "割引",
      PARKING: "駐車場",
      SMOKING: "喫煙",
      FOOD: "飲食",
      FACILITY: "設備",
    };

    const categorized: Record<string, CategoryServices> = {};

    flatServices.forEach((service) => {
      const serviceKey = service.value || service.key || "";
      const serviceName = service.label || service.name || serviceKey;
      const category = categoryMap[serviceKey] || "OTHER";

      if (!categorized[category]) {
        categorized[category] = {
          name: categoryNames[category] || "その他",
          services: [],
        };
      }

      categorized[category].services.push({
        key: serviceKey,
        name: serviceName,
      });
    });

    return categorized;
  };

  // サービスの選択/解除
  const toggleService = (serviceKey: string) => {
    const newSelected = new Set(selectedServices);
    if (newSelected.has(serviceKey)) {
      newSelected.delete(serviceKey);
    } else {
      newSelected.add(serviceKey);
    }
    setSelectedServices(newSelected);
  };

  // 保存処理
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      console.log("=== 保存処理開始 ===", {
        selectedServices: Array.from(selectedServices),
      });

      const result = await updateShopServices(
        Number(shopId),
        { service_types: Array.from(selectedServices) }
      );

      if (!result.success) {
        throw new Error(result.message || "更新に失敗しました");
      }

      setSuccessMessage(result.message || "サービスを更新しました。");

      // 2秒後に概要ページへ遷移
      setTimeout(() => {
        router.push(`/dashboard/shops/${shopId}`);
      }, 2000);

    } catch (err: any) {
      console.error("=== 保存エラー ===", err);
      setError(err.message || "サービスの更新に失敗しました。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // すべてブルーで統一

  // サービス名を取得するヘルパー関数
  const getServiceName = (key: string): string => {
    let serviceName = key;
    Object.values(categorizedServices).forEach((category) => {
      const service = category.services.find((s) => (s.key || s.value) === key);
      if (service) {
        serviceName = service.name || service.label || key;
      }
    });
    return serviceName;
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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">店舗サービスの編集</h1>
        <p className="text-gray-600">
          店舗で提供しているサービスを選択してください（複数選択可能）
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 選択状況 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">選択中のサービス</h2>
          <span className="text-sm text-gray-600">
            {selectedServices.size}件選択中
          </span>
        </div>
        
        {selectedServices.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedServices).map((key) => {
              const serviceName = getServiceName(key);

              return (
                <span
                  key={key}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {serviceName}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">サービスが選択されていません</p>
        )}
      </div>

      {/* カテゴリ別サービス選択 */}
      {Object.keys(categorizedServices).length === 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            利用可能なサービスが読み込めていません。コンソールを確認してください。
          </p>
        </div>
      )}
      
      {Object.entries(categorizedServices).map(([categoryKey, category]) => {
        return (
          <div key={categoryKey} className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
              {category.name}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.services.map((service) => {
                const serviceKey = service.key || service.value || "";
                const serviceName = service.name || service.label || serviceKey;
                const isSelected = selectedServices.has(serviceKey);

                return (
                  <div
                    key={serviceKey}
                    onClick={() => toggleService(serviceKey)}
                    className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      isSelected
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-medium ${
                          isSelected ? "text-blue-900" : "text-gray-900"
                        }`}
                      >
                        {serviceName}
                      </h3>
                      {isSelected && (
                        <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                      )}
                    </div>
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
            <h4 className="font-medium mb-1">サービスについて</h4>
            <ul className="space-y-1 text-xs">
              <li>• 店舗で提供しているサービスを複数選択できます</li>
              <li>• 選択したサービスは公開ページに表示されます</li>
              <li>• サービスは後からでも変更できます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedServices.size > 0
                ? `${selectedServices.size}件のサービスが選択されています`
                : "サービスを選択してください（任意）"}
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