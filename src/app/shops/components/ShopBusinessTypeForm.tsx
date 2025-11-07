// src/app/shops/components/ShopBusinessTypeForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Building2, AlertCircle, CheckCircle } from 'lucide-react';
import { ShopBusinessTypeFormProps } from '@/types/form';

export default function ShopBusinessTypeForm({
  value,
  onChange,
  onValidationChange,
  errors = {}
}: ShopBusinessTypeFormProps) {
  const [isClient, setIsClient] = useState(false);
  const [localData, setLocalData] = useState(value);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const validateData = (data: typeof value): boolean => {
    return data.three_player_free || data.four_player_free || data.set;
  };

  const handleChange = (field: keyof typeof value, checked: boolean) => {
    setHasUserInteracted(true);
    
    const newData = {
      ...localData,
      [field]: checked
    };

    setLocalData(newData);
    const isValid = validateData(newData);
    
    onChange(newData);
    onValidationChange(isValid);
  };

  useEffect(() => {
    const isValid = validateData(localData);
    onValidationChange(isValid);
  }, []);

  useEffect(() => {
    if (isClient) {
      setLocalData(value);
    }
  }, [value, isClient]);

  if (!isClient) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">営業形態の選択</h2>
          <p className="text-sm text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  const isValid = validateData(localData);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">営業形態の選択</h2>
        <p className="text-sm text-gray-600">
          店舗で提供している麻雀の営業形態を選択してください（複数選択可能）
        </p>
      </div>

      {hasUserInteracted && !isValid && (
        <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0" />
          <div className="text-sm text-red-700">
            最低1つの営業形態を選択してください
          </div>
        </div>
      )}

      {isValid && hasUserInteracted && (
        <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
          <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0" />
          <div className="text-sm text-green-700">
            営業形態が選択されました
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* フリー三麻 */}
        <div className="relative">
          <label
            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
              localData.three_player_free
                ? 'border-orange-500 bg-orange-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={localData.three_player_free}
              onChange={(e) => handleChange('three_player_free', e.target.checked)}
              className="sr-only"
            />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Users className={`w-6 h-6 mr-2 ${
                  localData.three_player_free ? 'text-orange-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  localData.three_player_free ? 'text-orange-900' : 'text-gray-700'
                }`}>
                  フリー三麻
                </span>
              </div>
              
              {localData.three_player_free && (
                <CheckCircle className="w-5 h-5 text-orange-600" />
              )}
            </div>
            
            <p className={`text-sm ${
              localData.three_player_free ? 'text-orange-700' : 'text-gray-600'
            }`}>
              3人打ちのフリー麻雀を提供
            </p>
          </label>
        </div>

        {/* フリー四麻 */}
        <div className="relative">
          <label
            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
              localData.four_player_free
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={localData.four_player_free}
              onChange={(e) => handleChange('four_player_free', e.target.checked)}
              className="sr-only"
            />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <UserCheck className={`w-6 h-6 mr-2 ${
                  localData.four_player_free ? 'text-blue-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  localData.four_player_free ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  フリー四麻
                </span>
              </div>
              
              {localData.four_player_free && (
                <CheckCircle className="w-5 h-5 text-blue-600" />
              )}
            </div>
            
            <p className={`text-sm ${
              localData.four_player_free ? 'text-blue-700' : 'text-gray-600'
            }`}>
              4人打ちのフリー麻雀を提供
            </p>
          </label>
        </div>

        {/* セット雀荘 */}
        <div className="relative">
          <label
            className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
              localData.set
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <input
              type="checkbox"
              checked={localData.set}
              onChange={(e) => handleChange('set', e.target.checked)}
              className="sr-only"
            />
            
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <Building2 className={`w-6 h-6 mr-2 ${
                  localData.set ? 'text-purple-600' : 'text-gray-400'
                }`} />
                <span className={`font-medium ${
                  localData.set ? 'text-purple-900' : 'text-gray-700'
                }`}>
                  セット雀荘
                </span>
              </div>
              
              {localData.set && (
                <CheckCircle className="w-5 h-5 text-purple-600" />
              )}
            </div>
            
            <p className={`text-sm ${
              localData.set ? 'text-purple-700' : 'text-gray-600'
            }`}>
              貸卓サービスを提供
            </p>
          </label>
        </div>
      </div>

      {/* 選択状況 */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-sm font-medium text-gray-700 mb-2">選択状況</h3>
        <div className="flex flex-wrap gap-2">
          {localData.three_player_free && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
              フリー三麻
            </span>
          )}
          {localData.four_player_free && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              フリー四麻
            </span>
          )}
          {localData.set && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              セット雀荘
            </span>
          )}
          
          {!isValid && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
              未選択
            </span>
          )}
        </div>
      </div>

      {/* 追加情報 */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <h4 className="font-medium mb-1">営業形態について</h4>
            <ul className="space-y-1 text-xs">
              <li>• 複数の営業形態を同時に提供している場合は、すべて選択してください</li>
              <li>• フリー麻雀とセット雀荘の両方を提供している店舗も多くあります</li>
              <li>• 営業形態は後からでも変更できます</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}