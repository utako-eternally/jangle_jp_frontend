// app/shops/components/ShopBasicInfoForm.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { AlertCircle, Store, Phone, Globe, FileText } from 'lucide-react';
import { ShopBasicInfoFormProps } from '@/types/form';

export default function ShopBasicInfoForm({ 
  value,
  onChange, 
  onValidationChange,
  errors: externalErrors
}: ShopBasicInfoFormProps) {
  const [formData, setFormData] = useState(value);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const allErrors = { ...errors, ...externalErrors };

  // バリデーション関数
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = '店舗名は必須です';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = '店舗名は2文字以上で入力してください';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = '店舗名は100文字以内で入力してください';
    }
    
    if (!formData.phone || !formData.phone.trim()) {
      newErrors.phone = '電話番号は必須です';
    } else {
      const phoneRegex = /^[\d\-\(\)\s\+]+$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = '数字とハイフン(-)のみ入力してください';
      } else {
        const digitsOnly = formData.phone.replace(/[^\d]/g, '');
        if (digitsOnly.length < 10) {
          newErrors.phone = '電話番号は数字10桁以上で入力してください';
        } else if (digitsOnly.length > 11) {
          newErrors.phone = '電話番号は数字11桁以内で入力してください';
        }
      }
    }
    
    if (formData.website_url && formData.website_url.trim()) {
      try {
        new URL(formData.website_url.trim());
      } catch {
        newErrors.website_url = '有効なURLを入力してください（例: https://example.com）';
      }
    }
    
    if (formData.description && formData.description.trim().length > 1000) {
      newErrors.description = '店舗説明は1000文字以内で入力してください';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0 && 
                   formData.name.trim().length >= 2 && 
                   formData.phone && formData.phone.trim().length > 0;
    
    if (onValidationChange) {
      onValidationChange(isValid);
    }
    
    return isValid;
  };

  const updateFormData = (field: keyof typeof formData, val: string) => {
    const newFormData = { ...formData, [field]: val };
    setFormData(newFormData);
    onChange(newFormData);
  };

  const handleBlur = (field: keyof typeof formData) => {
    setTouched({ ...touched, [field]: true });
  };

  useEffect(() => {
    if (value) {
      setFormData(value);
    }
  }, [value]);

  useEffect(() => {
    validateForm();
  }, [formData]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">基本情報</h2>
        <p className="text-sm text-gray-600">
          店舗の基本的な情報を入力してください
        </p>
      </div>

      {/* 店舗名 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Store className="w-4 h-4 inline mr-1" />
          店舗名 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => updateFormData('name', e.target.value)}
          onBlur={() => handleBlur('name')}
          placeholder="例: 雀荘 天和"
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            allErrors.name && touched.name ? 'border-red-300' : 'border-gray-300'
          } focus:ring-orange-500 focus:border-orange-500`}
          maxLength={100}
        />
        {allErrors.name && touched.name && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.name}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.name.length}/100文字
        </p>
      </div>

      {/* 電話番号 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Phone className="w-4 h-4 inline mr-1" />
          電話番号 <span className="text-red-500">*</span>
        </label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => {
            const sanitized = e.target.value.replace(/[^0-9\-\(\)\s\+]/g, '');
            updateFormData('phone', sanitized);
          }}
          onBlur={(e) => {
            const trimmed = e.target.value.trim();
            updateFormData('phone', trimmed);
            handleBlur('phone');
          }}
          placeholder="例: 03-1234-5678"
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            allErrors.phone && touched.phone ? 'border-red-300' : 'border-gray-300'
          } focus:ring-orange-500 focus:border-orange-500`}
          maxLength={20}
        />
        {allErrors.phone && touched.phone && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.phone}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          数字10-11桁とハイフン(-)で入力してください（例: 03-1234-5678, 090-1234-5678）
        </p>
      </div>

      {/* ウェブサイトURL */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Globe className="w-4 h-4 inline mr-1" />
          ウェブサイト
        </label>
        <input
          type="url"
          value={formData.website_url}
          onChange={(e) => updateFormData('website_url', e.target.value)}
          onBlur={() => handleBlur('website_url')}
          placeholder="例: https://example.com"
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            allErrors.website_url && touched.website_url ? 'border-red-300' : 'border-gray-300'
          } focus:ring-orange-500 focus:border-orange-500`}
        />
        {allErrors.website_url && touched.website_url && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.website_url}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          店舗の公式サイト、SNSなど（任意）
        </p>
      </div>

      {/* 店舗説明 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          店舗説明
        </label>
        <textarea
          rows={4}
          value={formData.description}
          onChange={(e) => updateFormData('description', e.target.value)}
          onBlur={() => handleBlur('description')}
          placeholder="例: 渋谷駅徒歩3分の雀荘です。初心者の方も歓迎しています。"
          className={`w-full px-3 py-2 border rounded-md shadow-sm ${
            allErrors.description && touched.description ? 'border-red-300' : 'border-gray-300'
          } focus:ring-orange-500 focus:border-orange-500 resize-none`}
          maxLength={1000}
        />
        {allErrors.description && touched.description && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {allErrors.description}
          </p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          {formData.description?.length || 0}/1000文字 - 店舗の特徴、雰囲気など（任意）
        </p>
      </div>

      {/* 入力状況 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center mb-2">
          <Store className="w-5 h-5 text-blue-600 mr-2" />
          <h3 className="text-sm font-medium text-blue-800">入力状況</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              formData.name.trim() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={formData.name.trim() ? 'text-green-700' : 'text-gray-600'}>
              店舗名 {formData.name.trim() ? '✓' : '(必須)'}
            </span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              formData.phone?.trim() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={formData.phone?.trim() ? 'text-green-700' : 'text-gray-600'}>
              電話番号 {formData.phone?.trim() ? '✓' : '(必須)'}
            </span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              formData.website_url?.trim() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={formData.website_url?.trim() ? 'text-green-700' : 'text-gray-600'}>
              ウェブサイト {formData.website_url?.trim() ? '✓' : '(任意)'}
            </span>
          </div>
          
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-2 ${
              formData.description?.trim() ? 'bg-green-500' : 'bg-gray-300'
            }`} />
            <span className={formData.description?.trim() ? 'text-green-700' : 'text-gray-600'}>
              店舗説明 {formData.description?.trim() ? '✓' : '(任意)'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}