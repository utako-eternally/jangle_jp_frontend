// src/app/shops/components/ShopBusinessHoursForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import { Clock, Info, AlertCircle } from "lucide-react";
import { DayOfWeek, DAY_OF_WEEK_LABELS } from "@/types/models";

export interface BusinessHourFormData {
  day_of_week: DayOfWeek;
  is_closed: boolean;
  is_24h: boolean;
  open_time: string;
  close_time: string;
}

interface ShopBusinessHoursFormProps {
  value: BusinessHourFormData[];
  openHoursText?: string;
  onChange: (data: BusinessHourFormData[]) => void;
  onOpenHoursTextChange?: (text: string) => void;
  onValidationChange?: (isValid: boolean) => void;
  errors?: Record<string, string>;
}

const defaultHours: BusinessHourFormData[] = [
  { day_of_week: 0, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 1, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 2, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 3, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 4, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 5, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 6, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  { day_of_week: 7, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
];

export default function ShopBusinessHoursForm({
  value,
  openHoursText = "",
  onChange,
  onOpenHoursTextChange,
  onValidationChange,
  errors = {},
}: ShopBusinessHoursFormProps) {
  const [businessHours, setBusinessHours] = useState<BusinessHourFormData[]>(
    value.length > 0 ? value : defaultHours
  );
  const [hoursText, setHoursText] = useState(openHoursText);
  const [showAllDays, setShowAllDays] = useState(false);
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    onChange(businessHours);
    
    // バリデーション: 少なくとも1日は営業している必要がある
    const hasOpenDay = businessHours.some(h => !h.is_closed);
    if (onValidationChange) {
      onValidationChange(hasOpenDay);
    }
  }, [businessHours]);

  useEffect(() => {
    if (onOpenHoursTextChange) {
      onOpenHoursTextChange(hoursText);
    }
  }, [hoursText]);

  const updateHour = (dayOfWeek: DayOfWeek, field: keyof BusinessHourFormData, value: any) => {
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

  const renderDayRow = (hour: BusinessHourFormData) => {
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">営業時間</h2>
        <p className="text-sm text-gray-600">
          曜日ごとの営業時間を設定してください。定休日や24時間営業の設定も可能です。
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3 text-sm text-blue-800">
            <p className="font-medium mb-1">営業時間設定のヒント</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>「全曜日にコピー」で同じ設定を一括適用できます</li>
              <li>24時間営業の場合は「24時間」にチェックを入れてください</li>
              <li>定休日の場合は「定休日」にチェックを入れてください</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 24時間営業の表示に関する注意書き */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3 text-sm text-yellow-800">
            <p className="font-medium">24時間営業の表示について</p>
            <p className="mt-1 text-yellow-700">
              24時間営業にチェックを入れた場合、フロントサイトでは風営法の観点から「オープン～ラスト」と表示されます。
            </p>
          </div>
        </div>
      </div>

      {/* 営業時間設定テーブル */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
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

      {/* 営業時間補足テキスト */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Clock className="w-4 h-4 inline mr-1" />
          営業時間補足
        </label>
        <textarea
          rows={3}
          value={hoursText}
          onChange={(e) => setHoursText(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder="例: 年末年始休業、不定休あり、ラストオーダー23時など"
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            errors.open_hours_text && touched ? 'border-red-300' : 'border-gray-300'
          } focus:ring-orange-500 focus:border-orange-500 resize-none`}
          maxLength={1000}
        />
        {errors.open_hours_text && touched && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors.open_hours_text}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {hoursText.length}/1000文字 - 営業時間に関する補足説明（任意）
        </p>
      </div>

      {errors.general && (
        <div className="text-sm text-red-600 flex items-center">
          <Info className="w-4 h-4 mr-1" />
          {errors.general}
        </div>
      )}
    </div>
  );
}