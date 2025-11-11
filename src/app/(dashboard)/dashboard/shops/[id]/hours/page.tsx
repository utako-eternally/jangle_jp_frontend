"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Save } from "lucide-react";
import { getMyShop, updateMyShop } from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import ShopBusinessHoursForm, { BusinessHourFormData } from "@/app/shops/components/ShopBusinessHoursForm";

export default function ShopHoursPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveSuccess, setSaveSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [businessHours, setBusinessHours] = useState<BusinessHourFormData[]>([]);
  const [openHoursText, setOpenHoursText] = useState("");

  useEffect(() => {
    const loadShop = async () => {
      try {
        const response = await getMyShop(Number(shopId));
        
        if (response.success && response.data) {
          setShop(response.data);
          
          // 営業時間データがある場合はセット
          if (response.data.business_hours && response.data.business_hours.length > 0) {
            const initialHours: BusinessHourFormData[] = response.data.business_hours.map(h => ({
              day_of_week: h.day_of_week,
              is_closed: h.is_closed,
              is_open_flexible: h.is_open_flexible,
              is_close_flexible: h.is_close_flexible,
              open_time: h.open_time || "",  // nullの場合は空文字に変換
              close_time: h.close_time || "", // nullの場合は空文字に変換
            }));
            
            setBusinessHours(initialHours);
          }
          
          // 営業時間補足テキスト
          if (response.data.open_hours_text) {
            setOpenHoursText(response.data.open_hours_text);
          }
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  const handleSave = async () => {
    setSaveError("");
    setSaveSuccess("");
    setIsSaving(true);

    try {
      const formData = new FormData();

      // 営業時間データ
      businessHours.forEach((hour, index) => {
        formData.append(`business_hours[${index}][day_of_week]`, hour.day_of_week.toString());
        formData.append(`business_hours[${index}][is_closed]`, hour.is_closed ? "1" : "0");
        formData.append(`business_hours[${index}][is_open_flexible]`, hour.is_open_flexible ? "1" : "0");
        formData.append(`business_hours[${index}][is_close_flexible]`, hour.is_close_flexible ? "1" : "0");
        
        if (!hour.is_closed) {
          if (!hour.is_open_flexible && hour.open_time) {
            formData.append(`business_hours[${index}][open_time]`, hour.open_time);
          }
          if (!hour.is_close_flexible && hour.close_time) {
            formData.append(`business_hours[${index}][close_time]`, hour.close_time);
          }
        }
      });

      // 営業時間補足テキスト
      if (openHoursText) {
        formData.append("open_hours_text", openHoursText);
      }

      const result = await updateMyShop(Number(shopId), formData);

      if (result.success) {
        setSaveSuccess("営業時間を更新しました");
        
        // 3秒後に成功メッセージを消す
        setTimeout(() => {
          setSaveSuccess("");
        }, 3000);
      } else {
        throw new Error(result.message || "更新に失敗しました");
      }
    } catch (err: any) {
      console.error("営業時間更新エラー:", err);
      setSaveError(err.message || "営業時間の更新に失敗しました");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !shop) {
    return <ErrorMessage message={error || "店舗情報が見つかりません。"} />;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-orange-600" />
              営業時間設定
            </h1>
            <p className="text-gray-600">
              曜日ごとの営業時間を設定してください。定休日の設定や、開店・閉店時刻を「オープン」「ラスト」で設定することも可能です。
            </p>
          </div>
        </div>
      </div>

      {/* 成功・エラーメッセージ */}
      {saveSuccess && <SuccessMessage message={saveSuccess} />}
      {saveError && <ErrorMessage message={saveError} />}

      {/* 営業時間設定フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShopBusinessHoursForm
          value={businessHours}
          openHoursText={openHoursText}
          onChange={setBusinessHours}
          onOpenHoursTextChange={setOpenHoursText}
        />

        {/* 保存ボタン */}
        <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.push(`/dashboard/shops/${shopId}`)}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
              isSaving
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-orange-600 hover:bg-orange-700 text-white"
            }`}
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                保存中...
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