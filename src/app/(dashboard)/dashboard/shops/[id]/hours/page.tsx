"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Clock, Save, AlertCircle, CheckCircle } from "lucide-react";
import { getMyShop, updateMyShop } from "@/lib/api/shops";
import { Shop, DayOfWeek, DAY_OF_WEEK_LABELS } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface BusinessHourData {
  day_of_week: DayOfWeek;
  is_closed: boolean;
  is_24h: boolean;
  open_time: string;
  close_time: string;
}

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
  const [showAllDays, setShowAllDays] = useState(false);

  // 初期営業時間データ（全曜日分）
  const defaultHours: BusinessHourData[] = [
    { day_of_week: 0, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 1, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 2, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 3, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 4, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 5, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 6, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 7, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  ];

  const [businessHours, setBusinessHours] = useState<BusinessHourData[]>(defaultHours);
  const [openHoursText, setOpenHoursText] = useState("");

  useEffect(() => {
    const loadShop = async () => {
      try {
        const response = await getMyShop(Number(shopId));
        
        if (response.success && response.data) {
          setShop(response.data);
          
          // 営業時間データがある場合はセット
          if (response.data.business_hours && response.data.business_hours.length > 0) {
            const hoursMap = new Map(
              response.data.business_hours.map(h => [h.day_of_week, h])
            );
            
            const initialHours = defaultHours.map(defaultHour => {
              const existingHour = hoursMap.get(defaultHour.day_of_week);
              if (existingHour) {
                return {
                  day_of_week: existingHour.day_of_week,
                  is_closed: existingHour.is_closed,
                  is_24h: existingHour.is_24h,
                  open_time: existingHour.open_time || "",
                  close_time: existingHour.close_time || "",
                };
              }
              return defaultHour;
            });
            
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

  const updateHour = (dayOfWeek: DayOfWeek, field: keyof BusinessHourData, value: any) => {
    setBusinessHours(prev =>
      prev.map(h =>
        h.day_of_week === dayOfWeek ? { ...h, [field]: value } : h
      )
    );
  };

  const handleClosedChange = (dayOfWeek: DayOfWeek, isClosed: boolean) => {
    setBusinessHours(prev =>
      prev.map(h =>
        h.day_of_week === dayOfWeek
          ? { ...h, is_closed: isClosed, is_24h: false }
          : h
      )
    );
  };

  const handle24hChange = (dayOfWeek: DayOfWeek, is24h: boolean) => {
    setBusinessHours(prev =>
      prev.map(h =>
        h.day_of_week === dayOfWeek
          ? { ...h, is_24h: is24h, is_closed: false, open_time: "", close_time: "" }
          : h
      )
    );
  };

  const copyToAllDays = (sourceDay: DayOfWeek) => {
    const sourceHour = businessHours.find(h => h.day_of_week === sourceDay);
    if (!sourceHour) return;

    if (confirm(`${DAY_OF_WEEK_LABELS[sourceDay]}の設定を全曜日にコピーしますか？`)) {
      setBusinessHours(prev =>
        prev.map(h => ({
          ...h,
          is_closed: sourceHour.is_closed,
          is_24h: sourceHour.is_24h,
          open_time: sourceHour.open_time,
          close_time: sourceHour.close_time,
        }))
      );
    }
  };

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
        formData.append(`business_hours[${index}][is_24h]`, hour.is_24h ? "1" : "0");
        
        if (!hour.is_closed && !hour.is_24h) {
          if (hour.open_time) formData.append(`business_hours[${index}][open_time]`, hour.open_time);
          if (hour.close_time) formData.append(`business_hours[${index}][close_time]`, hour.close_time);
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

  const renderDayRow = (hour: BusinessHourData) => {
    const { day_of_week, is_closed, is_24h, open_time, close_time } = hour;

    return (
      <div
        key={day_of_week}
        className="grid grid-cols-12 gap-3 items-center py-3 border-b border-gray-100 last:border-0"
      >
        {/* 曜日 */}
        <div className="col-span-2">
          <span className="font-medium text-gray-900">
            {DAY_OF_WEEK_LABELS[day_of_week]}
          </span>
        </div>

        {/* 定休日チェックボックス */}
        <div className="col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={is_closed}
              onChange={(e) => handleClosedChange(day_of_week, e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
            />
            <span className="ml-2 text-sm text-gray-700">定休日</span>
          </label>
        </div>

        {/* 24時間営業チェックボックス */}
        <div className="col-span-2">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={is_24h}
              disabled={is_closed}
              onChange={(e) => handle24hChange(day_of_week, e.target.checked)}
              className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500 disabled:opacity-50"
            />
            <span className="ml-2 text-sm text-gray-700">24時間</span>
          </label>
        </div>

        {/* 営業時間 */}
        <div className="col-span-4">
          {!is_closed && !is_24h ? (
            <div className="flex items-center space-x-2">
              <input
                type="time"
                value={open_time}
                onChange={(e) => updateHour(day_of_week, "open_time", e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
              <span className="text-gray-500">〜</span>
              <input
                type="time"
                value={close_time}
                onChange={(e) => updateHour(day_of_week, "close_time", e.target.value)}
                className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          ) : (
            <span className="text-sm text-gray-400">
              {is_closed ? "定休日" : "24時間営業"}
            </span>
          )}
        </div>

        {/* コピーボタン */}
        <div className="col-span-2 flex justify-end">
          <button
            type="button"
            onClick={() => copyToAllDays(day_of_week)}
            className="text-xs text-orange-600 hover:text-orange-700 px-2 py-1 rounded hover:bg-orange-50"
          >
            全曜日にコピー
          </button>
        </div>
      </div>
    );
  };

  const visibleDays = showAllDays
    ? businessHours
    : businessHours.filter(h => h.day_of_week <= 6); // 祝日以外

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
              曜日ごとの営業時間を設定してください。定休日や24時間営業の設定も可能です。
            </p>
          </div>
        </div>
      </div>

      {/* 成功・エラーメッセージ */}
      {saveSuccess && <SuccessMessage message={saveSuccess} />}
      {saveError && <ErrorMessage message={saveError} />}

      {/* 営業時間設定フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="space-y-6">
          {/* 営業時間テーブル */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">曜日別営業時間</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-1">
                {visibleDays.map(hour => renderDayRow(hour))}
              </div>

              {/* 祝日設定の表示切替 */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowAllDays(!showAllDays)}
                  className="text-sm text-orange-600 hover:text-orange-700 flex items-center"
                >
                  {showAllDays ? "祝日設定を隠す" : "祝日設定を表示"}
                </button>
              </div>
            </div>
          </div>

          {/* 営業時間補足テキスト */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              営業時間補足
            </label>
            <textarea
              rows={3}
              value={openHoursText}
              onChange={(e) => setOpenHoursText(e.target.value)}
              placeholder="例: 年末年始休業、不定休あり、ラストオーダー23時など"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 resize-none"
              maxLength={1000}
            />
            <p className="mt-1 text-xs text-gray-500">
              {openHoursText.length}/1000文字 - 営業時間に関する補足説明（任意）
            </p>
          </div>

          {/* ヒント */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="ml-3 text-sm text-blue-800">
                <p className="font-medium mb-1">営業時間設定のヒント</p>
                <ul className="list-disc list-inside space-y-1 text-blue-700">
                  <li>「全曜日にコピー」で同じ設定を一括適用できます</li>
                  <li>24時間営業の場合は「24時間」にチェックを入れてください</li>
                  <li>定休日の場合は「定休日」にチェックを入れてください</li>
                  <li>営業時間補足には年末年始休業や不定休などの情報を記載できます</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 保存ボタン */}
          <div className="flex justify-end space-x-3">
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
    </div>
  );
}