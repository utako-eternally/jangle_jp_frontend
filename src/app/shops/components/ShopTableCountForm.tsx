// src/app/shops/components/ShopTableCountForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Info, Calculator } from 'lucide-react';
import { ShopTableCountFormProps } from '@/types/form';

export default function ShopTableCountForm({ 
  mode,
  value,
  onChange, 
  onValidationChange,
  errors: externalErrors
}: ShopTableCountFormProps) {
  const [tableCount, setTableCount] = useState(value.table_count || 0);
  const [scoreTableCount, setScoreTableCount] = useState(value.score_table_count || 0);
  const [autoTableCount, setAutoTableCount] = useState(value.auto_table_count || 0);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const allErrors = { ...errors, ...externalErrors };

  const otherTableCount = Math.max(0, tableCount - scoreTableCount - autoTableCount);
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!tableCount || tableCount < 1) {
      newErrors.table_count = '総卓数は1以上で入力してください';
    }
    
    if (scoreTableCount < 0) {
      newErrors.score_table_count = '自動配牌機能付き卓数は0以上で入力してください';
    }
    
    if (autoTableCount < 0) {
      newErrors.auto_table_count = '全自動卓数は0以上で入力してください';
    }
    
    if (scoreTableCount + autoTableCount > tableCount) {
      newErrors.total = '自動配牌機能付き卓数と全自動卓数の合計が総卓数を超えています';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && tableCount > 0;
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  useEffect(() => {
    if (value) {
      setTableCount(value.table_count || 0);
      setScoreTableCount(value.score_table_count || 0);
      setAutoTableCount(value.auto_table_count || 0);
    }
  }, [value]);

  useEffect(() => {
    if (validateForm()) {
      onChange({
        table_count: tableCount,
        score_table_count: scoreTableCount,
        auto_table_count: autoTableCount
      });
    }
  }, [tableCount, scoreTableCount, autoTableCount]);

  const handleTableCountChange = (val: string) => {
    const sanitized = val.replace(/[^\d]/g, '');
    const num = parseInt(sanitized) || 0;
    setTableCount(num);
  };

  const handleScoreTableCountChange = (val: string) => {
    const sanitized = val.replace(/[^\d]/g, '');
    const num = parseInt(sanitized) || 0;
    setScoreTableCount(num);
  };

  const handleAutoTableCountChange = (val: string) => {
    const sanitized = val.replace(/[^\d]/g, '');
    const num = parseInt(sanitized) || 0;
    setAutoTableCount(num);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">卓数設定</h2>
        <p className="text-sm text-gray-600">
          店舗の雀卓の構成を入力してください。
        </p>
      </div>

      {/* 総卓数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          総卓数 <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <input
            type="number"
            min="1"
            max="100"
            value={tableCount || ''}
            onChange={(e) => handleTableCountChange(e.target.value)}
            placeholder="例: 8"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              allErrors.table_count ? 'border-red-300' : 'border-gray-300'
            } focus:ring-orange-500 focus:border-orange-500`}
          />
          <span className="absolute right-3 top-2 text-gray-500 text-sm">卓</span>
        </div>
        {allErrors.table_count && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.table_count}
          </p>
        )}
      </div>

      {/* 自動配牌機能付き卓数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          自動配牌機能付き卓数
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max={tableCount}
            value={scoreTableCount || ''}
            onChange={(e) => handleScoreTableCountChange(e.target.value)}
            placeholder="例: 4"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              allErrors.score_table_count ? 'border-red-300' : 'border-gray-300'
            } focus:ring-orange-500 focus:border-orange-500`}
          />
          <span className="absolute right-3 top-2 text-gray-500 text-sm">卓</span>
        </div>
        {allErrors.score_table_count && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.score_table_count}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          点数計算機能・自動配牌機能がある雀卓の数
        </p>
      </div>

      {/* 普通の全自動卓数 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          普通の全自動卓数
        </label>
        <div className="relative">
          <input
            type="number"
            min="0"
            max={tableCount - scoreTableCount}
            value={autoTableCount || ''}
            onChange={(e) => handleAutoTableCountChange(e.target.value)}
            placeholder="例: 3"
            className={`w-full px-3 py-2 border rounded-md shadow-sm ${
              allErrors.auto_table_count ? 'border-red-300' : 'border-gray-300'
            } focus:ring-orange-500 focus:border-orange-500`}
          />
          <span className="absolute right-3 top-2 text-gray-500 text-sm">卓</span>
        </div>
        {allErrors.auto_table_count && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.auto_table_count}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          自動配牌機能なしの全自動雀卓の数
        </p>
      </div>

      {/* 計算結果表示 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <Calculator className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-blue-800">卓構成の計算結果</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">総卓数:</span>
              <span className="font-medium text-blue-900">{tableCount}卓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">自動配牌機能付き:</span>
              <span className="font-medium text-blue-900">{scoreTableCount}卓</span>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-blue-700">普通の全自動:</span>
              <span className="font-medium text-blue-900">{autoTableCount}卓</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">その他:</span>
              <span className="font-medium text-blue-900">{otherTableCount}卓</span>
            </div>
          </div>
        </div>
        
        {otherTableCount > 0 && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <div className="flex items-center text-xs text-blue-600">
              <Info className="w-3 h-3 mr-1" />
              その他の卓には手積み卓、半自動卓などが含まれます
            </div>
          </div>
        )}
      </div>

      {allErrors.total && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <p className="text-sm text-red-700">{allErrors.total}</p>
          </div>
        </div>
      )}

      {/* 参考情報 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-2">雀卓の種類について</h4>
        <div className="text-xs text-gray-600 space-y-1">
          <div><strong>自動配牌機能付き:</strong> 点数計算・自動配牌機能がある最新の雀卓</div>
          <div><strong>普通の全自動:</strong> 牌の混合・配牌は自動だが点数計算は手動</div>
          <div><strong>その他:</strong> 手積み卓、半自動卓など上記以外の雀卓</div>
        </div>
      </div>
    </div>
  );
}