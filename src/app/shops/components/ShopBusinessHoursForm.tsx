"use client";

import React, { useState, useEffect } from "react";
import { Clock, Info, AlertCircle } from "lucide-react";
import { DayOfWeek, DAY_OF_WEEK_LABELS } from "@/types/models";

export interface BusinessHourFormData {
  day_of_week: DayOfWeek;
  is_closed: boolean;
  is_open_flexible: boolean;
  is_close_flexible: boolean;
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
  { day_of_week: 0, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 1, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 2, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 3, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 4, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 5, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 6, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
  { day_of_week: 7, is_closed: false, is_open_flexible: false, is_close_flexible: false, open_time: "", close_time: "" },
];

// 時間選択肢を生成（空、オープン、00:00～23:30、ラスト）
const generateTimeOptions = (type: 'open' | 'close') => {
  const options: Array<{ value: string; label: string }> = [];
  
  // 空のオプション
  options.push({ value: '', label: '選択してください' });
  
  if (type === 'open') {
    options.push({ value: 'OPEN', label: 'オープン' });
  }
  
  // 00:00 から 23:30 まで30分刻み
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      options.push({ value: timeStr, label: timeStr });
    }
  }
  
  if (type === 'close') {
    options.push({ value: 'LAST', label: 'ラスト' });
  }
  
  return options;
};

const openTimeOptions = generateTimeOptions('open');
const closeTimeOptions = generateTimeOptions('close');

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

  const handleClosedChange = (dayOfWeek: DayOfWeek, isClosed: boolean) => {
    setBusinessHours(prev =>
      prev.map(h =>
        h.day_of_week === dayOfWeek
          ? { 
              ...h, 
              is_closed: isClosed, 
              is_open_flexible: false,
              is_close_flexible: false 
            }
          : h
      )
    );
  };

  const handleOpenTimeChange = (dayOfWeek: DayOfWeek, value: string) => {
    setBusinessHours(prev =>
      prev.map(h => {
        if (h.day_of_week === dayOfWeek) {
          if (value === 'OPEN') {
            return { ...h, is_open_flexible: true, open_time: '' };
          } else {
            return { ...h, is_open_flexible: false, open_time: value };
          }
        }
        return h;
      })
    );
  };

  const handleCloseTimeChange = (dayOfWeek: DayOfWeek, value: string) => {
    setBusinessHours(prev =>
      prev.map(h => {
        if (h.day_of_week === dayOfWeek) {
          if (value === 'LAST') {
            return { ...h, is_close_flexible: true, close_time: '' };
          } else {
            return { ...h, is_close_flexible: false, close_time: value };
          }
        }
        return h;
      })
    );
  };

  const getOpenSelectValue = (hour: BusinessHourFormData): string => {
    if (hour.is_open_flexible) return 'OPEN';
    // open_timeがnullまたは空文字の場合は空文字を返す
    if (!hour.open_time) return '';
    // HH:MM:SS形式の場合はHH:MM形式に変換
    return hour.open_time.substring(0, 5);
  };

  const getCloseSelectValue = (hour: BusinessHourFormData): string => {
    if (hour.is_close_flexible) return 'LAST';
    // close_timeがnullまたは空文字の場合は空文字を返す
    if (!hour.close_time) return '';
    // HH:MM:SS形式の場合はHH:MM形式に変換
    return hour.close_time.substring(0, 5);
  };

  const copyToAllDays = (sourceDay: DayOfWeek) => {
    const sourceHour = businessHours.find(h => h.day_of_week === sourceDay);
    if (!sourceHour) return;

    if (confirm(`${DAY_OF_WEEK_LABELS[sourceDay]}の設定を全曜日にコピーしますか？`)) {
      setBusinessHours(prev =>
        prev.map(h => ({
          ...h,
          is_closed: sourceHour.is_closed,
          is_open_flexible: sourceHour.is_open_flexible,
          is_close_flexible: sourceHour.is_close_flexible,
          open_time: sourceHour.open_time,
          close_time: sourceHour.close_time,
        }))
      );
    }
  };

  const renderDayRow = (hour: BusinessHourFormData) => {
    const { day_of_week, is_closed } = hour;

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

        {/* 営業時間 */}
        <div className="col-span-6">
          {!is_closed ? (
            <div className="flex items-center space-x-2">
              <select
                value={getOpenSelectValue(hour)}
                onChange={(e) => handleOpenTimeChange(day_of_week, e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {openTimeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              
              <span className="text-gray-500">〜</span>
              
              <select
                value={getCloseSelectValue(hour)}
                onChange={(e) => handleCloseTimeChange(day_of_week, e.target.value)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {closeTimeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <span className="text-sm text-gray-400">定休日</span>
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
          曜日ごとの営業時間を設定してください。定休日の設定や、開店・閉店時刻を「オープン」「ラスト」で設定することも可能です。
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="ml-3 text-sm text-blue-800">
            <p className="font-medium mb-1">営業時間設定のヒント</p>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li>「全曜日にコピー」で同じ設定を一括適用できます</li>
              <li>開店時刻が不定の場合は「オープン」を選択してください</li>
              <li>閉店時刻が不定の場合は「ラスト」を選択してください</li>
              <li>定休日の場合は「定休日」にチェックを入れてください</li>
            </ul>
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