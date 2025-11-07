// src/app/(dashboard)/dashboard/shops/[id]/stations/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { getMyShop, getShopStations, updateShopStations } from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import ShopStationForm from "@/app/shops/components/ShopStationForm";

// ヒュベニの公式で2点間の距離を計算（km）
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  
  const R = 6371; // 地球の半径（km）
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function StationsEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // フォームデータ
  const [stationData, setStationData] = useState<any>(null);
  const [addressCoordinates, setAddressCoordinates] = useState<{ lat: number; lng: number } | null>(null);

  // バリデーション状態
  const [stationValid, setStationValid] = useState(false);

  // 店舗情報と駅情報を取得
  useEffect(() => {
    const loadData = async () => {
      try {
        // 店舗情報を取得
        const shopResponse = await getMyShop(Number(shopId));
        
        let shopCoordinates: { lat: number; lng: number } | null = null;
        
        if (shopResponse.success && shopResponse.data) {
          const shopData = shopResponse.data;
          setShop(shopData);

          // 住所座標を設定
          if (shopData.lat && shopData.lng) {
            shopCoordinates = {
              lat: shopData.lat,
              lng: shopData.lng,
            };
            setAddressCoordinates(shopCoordinates);
          }
        }

        // 駅情報を取得
        const stationsResponse = await getShopStations(Number(shopId));
        
        if (stationsResponse.success && stationsResponse.data) {
          const stations = stationsResponse.data;
          
          console.log('=== 駅情報APIレスポンス ===', stations);
          
          // APIは main_station を返す
          let nearestStation = stations.main_station;
          let subStations = stations.sub_stations || [];

          console.log('=== main_station ===', nearestStation);
          console.log('=== sub_stations ===', subStations);

          // メイン駅の処理
          if (nearestStation) {
            if (nearestStation.distance_km) {
              const distance = parseFloat(nearestStation.distance_km);
              const walkingTime = nearestStation.walking_minutes || Math.ceil(distance * 1000 / 80);
              
              console.log('=== メイン駅の距離 ===', { distance, walkingTime });
              
              nearestStation = {
                ...nearestStation,
                distance,
                walking_time: walkingTime,
              };
            }
          }

          // サブ駅の処理
          subStations = subStations.map((station: any, index: number) => {
            console.log(`=== サブ駅${index + 1} ===`, station);
            
            if (station.distance_km) {
              const distance = parseFloat(station.distance_km);
              const walkingTime = station.walking_time;
              
              console.log(`=== サブ駅${index + 1}の距離 ===`, { distance, walkingTime });
              
              return {
                ...station,
                distance,
                walking_time: walkingTime,
              };
            }
            
            console.log(`=== サブ駅${index + 1}の距離情報なし ===`);
            return station;
          });
          
          console.log('=== 処理後のサブ駅 ===', subStations);
          
          // フォーム用のデータ形式に変換
          const formData = {
            nearest_station_id: nearestStation?.id || null,
            sub_station_ids: subStations.map((s: any) => s.id),
            stations: {
              main: nearestStation || undefined,
              sub: subStations,
            },
          };
          
          console.log('=== 最終的なformData ===', formData);

          setStationData(formData);
          setStationValid(!!nearestStation);
        }
      } catch (err: any) {
        console.error("データ取得エラー:", err);
        setError(err.response?.data?.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // 保存処理
  const handleSubmit = async () => {
    if (!stationValid) {
      setError("メイン駅を選択してください。");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const submitData = {
        nearest_station_id: stationData.nearest_station_id,
        sub_station_ids: stationData.sub_station_ids || [],
      };

      console.log("=== 送信データ ===", submitData);

      const result = await updateShopStations(Number(shopId), submitData);

      if (!result.success) {
        throw new Error(result.message || "更新に失敗しました");
      }

      setSuccessMessage("駅情報を更新しました。");

      // 2秒後に概要ページへリダイレクト
      setTimeout(() => {
        router.push(`/dashboard/shops/${shopId}`);
      }, 2000);

    } catch (err: any) {
      console.error("更新エラー:", err);
      setError(err.message || "駅情報の更新に失敗しました。");
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

  const canSubmit = stationValid && !submitting;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">駅情報の編集</h1>
        <p className="text-gray-600">
          店舗の最寄り駅を設定します。メイン駅は必須、サブ駅は最大3つまで選択できます。
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 住所情報がない場合の警告 */}
      {!addressCoordinates && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-medium text-yellow-800">
                住所情報が設定されていません
              </p>
              <p className="text-sm text-yellow-700 mt-1">
                近隣駅の自動検索を利用するには、先に基本情報ページで住所を設定してください。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 駅選択フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShopStationForm
          mode="edit"
          value={stationData}
          addressCoordinates={addressCoordinates}
          onChange={setStationData}
          onValidationChange={setStationValid}
        />
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {canSubmit ? "保存する準備ができました" : "メイン駅を選択してください"}
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
                <LoadingSpinner />
                <span className="ml-2">保存中...</span>
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