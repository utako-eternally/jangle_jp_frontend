// src/app/shops/components/ShopAddressForm.tsx
"use client";

import React, { useState, useEffect } from "react";
import {
  MapPin,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle,
  Navigation,
  Globe,
  Edit3,
} from "lucide-react";
import { ShopAddressFormProps } from "@/types/form";
import {
  getAddressByPostalCode,
  normalizeAddress,
  processFullAddress,
  geocodeAddress,
} from "@/lib/api/address";
import { ErrorMessage } from "@/components/ui/error-message";

// 全角数字を半角数字に変換
const convertFullWidthToHalfWidth = (text: string): string => {
  return text.replace(/[０-９]/g, (match) => {
    return String.fromCharCode(match.charCodeAt(0) - 0xfee0);
  });
};

const normalizeAddressText = (address: string): string => {
  return convertFullWidthToHalfWidth(address);
};

// Google Map表示コンポーネント
const GoogleMapDisplay = ({
  lat,
  lng,
  address,
}: {
  lat: number;
  lng: number;
  address: string;
}) => {
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!googleMapsApiKey) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
          <MapPin className="w-5 h-5 mr-2" />
          店舗位置情報
        </h4>
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            地図を表示するにはGOOGLE_MAPS_API_KEYの設定が必要です
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            緯度: {lat}, 経度: {lng}
          </p>
        </div>
        <p className="text-xs text-gray-600 mt-2">{address}</p>
      </div>
    );
  }

  const mapUrl = `https://www.google.com/maps/embed/v1/place?key=${googleMapsApiKey}&q=${lat},${lng}&zoom=16&language=ja`;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <h4 className="text-sm font-medium text-gray-800 mb-3 flex items-center">
        <MapPin className="w-5 h-5 mr-2" />
        店舗位置の確認
      </h4>
      <div className="aspect-video w-full rounded-lg overflow-hidden border border-gray-300">
        <iframe
          src={mapUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="店舗位置"
        />
      </div>
      <p className="text-xs text-gray-600 mt-2">{address}</p>
      <p className="text-xs text-gray-500">
        緯度: {lat}, 経度: {lng}
      </p>
    </div>
  );
};

export default function ShopAddressForm({
  mode = "create",
  value,
  onChange,
  onValidationChange,
  errors: externalErrors,
}: ShopAddressFormProps) {
  const [inputMode, setInputMode] = useState<"postal" | "manual">("postal");
  const [postalCode, setPostalCode] = useState("");
  const [postalCodeSuggestions, setPostalCodeSuggestions] = useState<any[]>([]);
  const [isLoadingPostalCode, setIsLoadingPostalCode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [postalCodeNotFound, setPostalCodeNotFound] = useState(false);
  const [selectedBaseAddress, setSelectedBaseAddress] = useState<any>(null);
  const [addressDetail, setAddressDetail] = useState("");
  const [building, setBuilding] = useState("");
  const [showDetailForm, setShowDetailForm] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [manualBuilding, setManualBuilding] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedAddress, setProcessedAddress] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [finalAddress, setFinalAddress] = useState("");

  const allErrors = { ...(error ? { general: error } : {}), ...externalErrors };

  useEffect(() => {
    if (value?.node_address_result) {
      const addressResult = value.node_address_result;

      if (
        addressResult.lat &&
        addressResult.lng &&
        addressResult.formatted_address
      ) {
        const restoredProcessedData = {
          final_coordinates: {
            lat: addressResult.lat,
            lng: addressResult.lng,
          },
          google_enhanced: true,
          normalized: true,
        };

        setProcessedAddress(restoredProcessedData);
        setFinalAddress(
          addressResult.formatted_address || addressResult.final_address || ""
        );
        setIsValid(true);

        if (onValidationChange) {
          setTimeout(() => {
            onValidationChange(true);
          }, 0);
        }

        if (addressResult.address_details) {
          const details = addressResult.address_details;
          if (details.postal_code) setPostalCode(details.postal_code);
          if (details.building) setBuilding(details.building);

          if (details.prefecture && details.city && details.town) {
            setSelectedBaseAddress({
              postcode: details.postal_code || "",
              location: {
                latitude: addressResult.lat,
                longitude: addressResult.lng,
              },
              pref: details.prefecture,
              city: details.city,
              town: details.town,
              allAddress: `${details.prefecture}${details.city}${details.town}`,
            });

            if (details.street) setAddressDetail(details.street);
            setShowDetailForm(true);
          }
        }
      }
    }
  }, [mode, value]);

  const normalizePostalCode = (code: string): string =>
    code.replace(/[^\d]/g, "");

  const fetchPostalCodeSuggestions = async (code: string) => {
    const cleanCode = normalizePostalCode(code);

    if (cleanCode.length !== 7) {
      setPostalCodeSuggestions([]);
      setShowSuggestions(false);
      setPostalCodeNotFound(false);
      return;
    }

    setIsLoadingPostalCode(true);
    setPostalCodeNotFound(false);

    try {
      const result = await getAddressByPostalCode({ postal_code: cleanCode });

      if (result.success && result.data?.length) {
        const validAddresses = result.data.filter(
          (item) => item.allAddress && item.allAddress.trim() !== ""
        );

        if (validAddresses.length > 0) {
          const normalizedAddresses = validAddresses.map((addr) => ({
            ...addr,
            allAddress: normalizeAddressText(addr.allAddress),
            pref: normalizeAddressText(addr.pref),
            city: normalizeAddressText(addr.city),
            town: normalizeAddressText(addr.town),
          }));

          setPostalCodeSuggestions(normalizedAddresses);
          setShowSuggestions(true);
          setPostalCodeNotFound(false);
        } else {
          setPostalCodeSuggestions([]);
          setShowSuggestions(false);
          setPostalCodeNotFound(true);
        }
      } else {
        setPostalCodeSuggestions([]);
        setShowSuggestions(false);
        setPostalCodeNotFound(true);
      }
    } catch (err: any) {
      console.error("郵便番号取得エラー:", err);
      setPostalCodeSuggestions([]);
      setShowSuggestions(false);
      setPostalCodeNotFound(true);
    } finally {
      setIsLoadingPostalCode(false);
    }
  };

  useEffect(() => {
    const clean = normalizePostalCode(postalCode);
    if (clean.length === 7) {
      const timer = setTimeout(
        () => fetchPostalCodeSuggestions(postalCode),
        600
      );
      return () => clearTimeout(timer);
    }
    setPostalCodeSuggestions([]);
    setShowSuggestions(false);
    setPostalCodeNotFound(false);
  }, [postalCode]);

  const handleSelectBaseAddress = (suggestion: any) => {
    setSelectedBaseAddress(suggestion);
    setShowSuggestions(false);
    setShowDetailForm(true);
    setAddressDetail("");
    setBuilding("");
    setError(null);
  };

  const handleResetBaseAddress = () => {
    setSelectedBaseAddress(null);
    setShowDetailForm(false);
    setAddressDetail("");
    setBuilding("");
    setError(null);
  };

  const switchToManualInput = () => {
    setInputMode("manual");
    setManualAddress("");
    setManualBuilding("");
    setError(null);
  };

  const switchToPostalInput = () => {
    setInputMode("postal");
    setPostalCode("");
    setPostalCodeNotFound(false);
    setError(null);
  };

  const enhanceWithGoogleMaps = async (
    address: string
  ): Promise<any | null> => {
    try {
      const result = await geocodeAddress({
        address: normalizeAddressText(address),
      });
      return result.success
        ? {
            ...result.data,
            formatted_address: normalizeAddressText(
              result.data.formatted_address
            ),
          }
        : null;
    } catch (err) {
      console.warn("Google Maps API 呼び出し失敗:", err);
      return null;
    }
  };

const processAddressWithPostal = async () => {
  const cleanCode = normalizePostalCode(postalCode);
  if (cleanCode.length !== 7 || !selectedBaseAddress) {
    setError('郵便番号と住所を正しく選択してください');
    return;
  }

  setIsProcessing(true);
  setError(null);

  try {
    // 1. フロントエンドで住所を結合
    const fullAddr = `${selectedBaseAddress.allAddress}${normalizeAddressText(addressDetail.trim())}${building.trim()}`;
    
    // 2. 正規化
    const norm = await normalizeAddress({ address: fullAddr });
    
    if (!norm.success || !norm.data) {
      throw new Error('住所の正規化に失敗しました');
    }
    
    const normalizedFullAddress = normalizeAddressText(norm.data.fullAddress);
    
    // 3. 座標取得
    let lat: number;
    let lng: number;
    
    if (norm.data.coordinates?.lat && norm.data.coordinates?.lng) {
      lat = norm.data.coordinates.lat;
      lng = norm.data.coordinates.lng;
    } else {
      const geo = await enhanceWithGoogleMaps(normalizedFullAddress);
      if (geo?.lat && geo?.lng) {
        lat = geo.lat;
        lng = geo.lng;
      } else {
        lat = selectedBaseAddress.location.latitude;
        lng = selectedBaseAddress.location.longitude;
      }
    }
    
    // 4. データ構築
    const nodeResult = {
      lat,
      lng,
      formatted_address: normalizedFullAddress,
      final_address: normalizedFullAddress,
      coordinates: { lat, lng },
      address_details: {
        prefecture: norm.data.pref || selectedBaseAddress.pref || '',
        city: norm.data.city || selectedBaseAddress.city || '',
        town: norm.data.town || selectedBaseAddress.town || '',
        street: norm.data.addr || '',  // 13-10 相鉄南幸第15ビル2階
        building: building.trim() || '',
        postal_code: cleanCode,
      }
    };

    const addressData: ShopAddressForm = { 
      node_address_result: nodeResult,
      final_address: normalizedFullAddress,
      final_lat: lat,
      final_lng: lng,
    };

    console.log('===== 送信する住所データ =====\n\n' + JSON.stringify(addressData, null, 2));

    onChange(addressData);
    setProcessedAddress({ 
      google_enhanced: false,
      final_coordinates: { lat, lng }
    });
    setFinalAddress(normalizedFullAddress);
    setIsValid(true);
    if (onValidationChange) {
      onValidationChange(true);
    }

  } catch (err: any) {
    console.error('住所処理エラー:', err);
    setError(err.message || '住所処理に失敗しました');
    setIsValid(false);
    if (onValidationChange) {
      onValidationChange(false);
    }
  } finally {
    setIsProcessing(false);
  }
};

  const processManualAddress = async () => {
    if (!manualAddress.trim()) {
      setError("住所を入力してください");
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const normalizedAddress = normalizeAddressText(manualAddress.trim());
      const fullManualAddress = `${normalizedAddress}${
        manualBuilding.trim() ? " " + manualBuilding.trim() : ""
      }`;

      const norm = await normalizeAddress({ address: fullManualAddress });

      if (!norm.success || !norm.data) {
        throw new Error(norm.message || "住所正規化に失敗しました");
      }

      // normalize()の結果から住所を取得
      const normalizedFullAddress = normalizeAddressText(norm.data.fullAddress);

      // 🔧 座標取得の優先順位: normalize() → Google API → エラー
      let lat: number;
      let lng: number;

      if (norm.data.coordinates?.lat && norm.data.coordinates?.lng) {
        // 1. normalize()から座標取得
        lat = norm.data.coordinates.lat;
        lng = norm.data.coordinates.lng;
      } else {
        // 2. Google APIで座標を取得（住所はそのまま）
        const geo = await enhanceWithGoogleMaps(fullManualAddress);
        if (geo?.lat && geo?.lng) {
          lat = geo.lat;
          lng = geo.lng;
        } else {
          // 座標が取得できない場合はエラー
          throw new Error(
            "位置情報を取得できませんでした。住所を確認してください。"
          );
        }
      }

      // データ構築
      const nodeResult = {
        lat,
        lng,
        formatted_address: normalizedFullAddress, // normalize()の結果を使用
        final_address: normalizedFullAddress,
        coordinates: { lat, lng },
        address_details: {
          prefecture: norm.data.pref || "",
          city: norm.data.city || "",
          town: norm.data.town || "",
          street: norm.data.addr || "",
          building: manualBuilding.trim() || "",
          postal_code: "",
        },
      };

      const addressData: ShopAddressForm = {
        node_address_result: nodeResult,
        final_address: normalizedFullAddress,
        final_lat: lat,
        final_lng: lng,
      };

      onChange(addressData);
      setProcessedAddress({
        original: fullManualAddress,
        normalized: {
          ...norm.data,
          fullAddress: normalizedFullAddress,
          pref: normalizeAddressText(norm.data.pref),
          city: normalizeAddressText(norm.data.city),
          town: normalizeAddressText(norm.data.town),
          addr: normalizeAddressText(norm.data.addr),
        },
        google_enhanced: false,
        final_coordinates: { lat, lng },
      });
      setFinalAddress(normalizedFullAddress);
      setIsValid(true);
      if (onValidationChange) {
        onValidationChange(true);
      }
    } catch (err: any) {
      console.error("手動住所処理エラー:", err);
      setError(err.message || "住所処理に失敗しました");
      setIsValid(false);
      if (onValidationChange) {
        onValidationChange(false);
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const resetAddress = () => {
    setProcessedAddress(null);
    setError(null);
    setIsValid(false);
    setFinalAddress("");
    if (onValidationChange) {
      onValidationChange(false);
    }

    if (mode === "edit") {
      setPostalCode("");
      setBuilding("");
      setSelectedBaseAddress(null);
      setShowDetailForm(false);
      setManualAddress("");
      setManualBuilding("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          住所・位置情報
        </h2>
        <p className="text-sm text-gray-600">
          店舗の住所を入力してください。位置情報は自動的に取得されます。
        </p>
      </div>

      {mode === "edit" && processedAddress && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-blue-800 mb-1">
                📍 現在の住所
              </h4>
              {/* 郵便番号を追加 ← ここを追加 */}
              {value?.node_address_result?.address_details?.postal_code && (
                <p className="text-xs text-blue-600 mb-1">
                  〒{value.node_address_result.address_details.postal_code.slice(0, 3)}-
                  {value.node_address_result.address_details.postal_code.slice(3)}
                </p>
              )}
              <p className="text-sm text-blue-700">{finalAddress}</p>
              {processedAddress.final_coordinates && (
                <p className="text-xs text-blue-600 mt-1">
                  緯度: {processedAddress.final_coordinates.lat}, 経度:{" "}
                  {processedAddress.final_coordinates.lng}
                </p>
              )}
            </div>
            <button
              onClick={resetAddress}
              className="text-xs text-blue-700 hover:text-blue-800 underline"
            >
              住所を変更
            </button>
          </div>
        </div>
      )}

      {(!processedAddress || mode === "create") && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            📮 住所入力について
          </h3>
          <p className="text-xs text-blue-700">
            郵便番号を入力すると住所が自動補完されます。郵便番号が見つからない場合は手動入力に切り替わります。
            数字は自動的に半角に変換されます。
          </p>
        </div>
      )}

      {!processedAddress && (
        <>
          {inputMode === "postal" && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  郵便番号 <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="例: 150-0043"
                    value={postalCode}
                    onChange={(e) => {
                      const sanitized = e.target.value.replace(/[^0-9\-]/g, "");
                      setPostalCode(sanitized);
                    }}
                    className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                      allErrors.postal_code
                        ? "border-red-300"
                        : "border-gray-300"
                    }`}
                    maxLength={8}
                  />
                  {isLoadingPostalCode && (
                    <div className="absolute right-3 top-2">
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    </div>
                  )}
                  {showSuggestions && postalCodeSuggestions.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
                      <div className="py-2">
                        <div className="px-3 py-1 text-xs text-gray-500 bg-gray-50">
                          📮 該当する住所
                        </div>
                        {postalCodeSuggestions.map((s, idx) => (
                          <div
                            key={idx}
                            className="px-3 py-2 hover:bg-orange-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                            onClick={() => handleSelectBaseAddress(s)}
                          >
                            <div className="text-sm text-gray-900 font-medium">
                              {s.allAddress}
                            </div>
                            <div className="text-xs text-gray-500">
                              〒{s.postcode}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {allErrors.postal_code && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {allErrors.postal_code}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  数字7桁とハイフン(-)で入力してください（例: 150-0043）
                </p>
              </div>

              {postalCodeNotFound && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center mb-2">
                        <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                        <h4 className="text-sm font-medium text-yellow-800">
                          郵便番号が見つかりませんでした
                        </h4>
                      </div>
                      <p className="text-sm text-yellow-700">
                        入力された郵便番号に該当する住所が見つかりません。手動で住所を入力してください。
                      </p>
                    </div>
                    <button
                      onClick={switchToManualInput}
                      className="flex items-center px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700"
                    >
                      <Edit3 className="w-4 h-4 mr-1" />
                      手動入力
                    </button>
                  </div>
                </div>
              )}

              {selectedBaseAddress && (
                <>
                  <div className="mt-3 text-center">
                    <button
                      onClick={switchToManualInput}
                      className="text-xs text-blue-600 hover:text-blue-800 underline"
                    >
                      特殊な住所の場合は手動入力に切り替え
                    </button>
                  </div>

                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center mb-2">
                          <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                          <h4 className="text-sm font-medium text-green-800">
                            基本住所が選択されました
                          </h4>
                        </div>
                        <p className="text-sm text-green-700 font-medium">
                          {selectedBaseAddress.allAddress}
                        </p>
                        <p className="text-xs text-green-600">
                          〒{selectedBaseAddress.postcode}
                        </p>
                      </div>
                      <button
                        onClick={handleResetBaseAddress}
                        className="text-xs text-green-700 hover:text-green-800 underline"
                      >
                        変更
                      </button>
                    </div>
                  </div>
                </>
              )}

              {showDetailForm && selectedBaseAddress && (
                <div className="space-y-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center mb-3">
                    <MapPin className="w-5 h-5 text-blue-600 mr-2" />
                    <h4 className="text-sm font-medium text-blue-800">
                      詳細住所を入力してください
                    </h4>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      番地・丁目 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="例: 1-2-3"
                      value={addressDetail}
                      onChange={(e) => {
                        const sanitized = e.target.value.replace(
                          /[^0-9\-\s]/g,
                          ""
                        );
                        setAddressDetail(sanitized);
                      }}
                      onBlur={(e) => {
                        const trimmed = e.target.value.trim();
                        setAddressDetail(trimmed);
                      }}
                      className={`w-full px-3 py-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                        allErrors.address_detail
                          ? "border-red-300"
                          : "border-blue-300"
                      }`}
                      maxLength={20}
                    />
                    {allErrors.address_detail && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {allErrors.address_detail}
                      </p>
                    )}
                    <p className="mt-1 text-xs text-blue-600">
                      数字とハイフン(-)のみ入力可能です（例: 1-2-4, 1-2-4-101）
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      特殊な住所の場合は、下の「手動入力に切り替え」をご利用ください
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-blue-700 mb-2">
                      建物名・階数（任意）
                    </label>
                    <input
                      type="text"
                      placeholder="例: 渋谷ビル4F"
                      value={building}
                      onChange={(e) => setBuilding(e.target.value)}
                      className="w-full px-3 py-2 border border-blue-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              )}

              {selectedBaseAddress && (
                <button
                  onClick={processAddressWithPostal}
                  disabled={isProcessing || !addressDetail.trim()}
                  className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                      住所を処理中...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" /> 住所を取得
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {inputMode === "manual" && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-blue-800 mb-1">
                      手動入力モード
                    </h4>
                    <p className="text-xs text-blue-700">
                      住所を手動で入力してください。可能な限り詳細に入力することをお勧めします。
                    </p>
                  </div>
                  <button
                    onClick={switchToPostalInput}
                    className="text-xs text-blue-700 hover:text-blue-800 underline"
                  >
                    郵便番号入力に戻る
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  住所（建物名除く） <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="例: 東京都渋谷区道玄坂1-2-3"
                  value={manualAddress}
                  onChange={(e) => setManualAddress(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:ring-orange-500 focus:border-orange-500 ${
                    allErrors.manual_address
                      ? "border-red-300"
                      : "border-gray-300"
                  }`}
                  maxLength={400}
                />
                {allErrors.manual_address && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {allErrors.manual_address}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  都道府県から番地まで入力してください（建物名は下の欄に入力）
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  建物名・階数（任意）
                </label>
                <input
                  type="text"
                  placeholder="例: 渋谷ビル4F"
                  value={manualBuilding}
                  onChange={(e) => setManualBuilding(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-500">
                  建物名や階数などを入力してください
                </p>
              </div>

              <button
                onClick={processManualAddress}
                disabled={isProcessing || !manualAddress.trim()}
                className="w-full flex items-center justify-center px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />{" "}
                    住所を処理中...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" /> 住所を正規化
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {error && <ErrorMessage message={error} />}

      {processedAddress && (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <h3 className="text-sm font-medium text-green-800">
                位置情報を取得しました
              </h3>
            </div>
            <div className="space-y-2">
              {processedAddress.final_coordinates && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-green-700">緯度</label>
                    <p className="text-sm text-green-800 font-mono">
                      {processedAddress.final_coordinates.lat}
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs text-green-700">経度</label>
                    <p className="text-sm text-green-800 font-mono">
                      {processedAddress.final_coordinates.lng}
                    </p>
                  </div>
                </div>
              )}
              {finalAddress && (
                <div>
                  <label className="block text-xs text-green-700">
                    最終住所
                  </label>
                  <p className="text-sm text-green-800">{finalAddress}</p>
                </div>
              )}
              <div className="text-xs text-green-600 space-y-1">
                {processedAddress.google_enhanced && (
                  <div className="flex items-center">
                    <Globe className="w-3 h-3 mr-1" /> Google Maps
                    APIで位置情報を取得済み
                  </div>
                )}
                {processedAddress.normalized && (
                  <div className="flex items-center">
                    <Navigation className="w-3 h-3 mr-1" />{" "}
                    住所の正規化が完了しました
                  </div>
                )}
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-green-200">
              <button
                onClick={resetAddress}
                className="text-sm text-green-700 hover:text-green-800"
              >
                やり直す
              </button>
            </div>
          </div>

          {processedAddress.final_coordinates &&
            processedAddress.final_coordinates.lat !== 0 &&
            processedAddress.final_coordinates.lng !== 0 && (
              <GoogleMapDisplay
                lat={processedAddress.final_coordinates.lat}
                lng={processedAddress.final_coordinates.lng}
                address={finalAddress}
              />
            )}
        </div>
      )}

      {!processedAddress && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-orange-800 mb-2">
            💡 住所入力のポイント
          </h4>
          <ul className="text-xs text-orange-700 space-y-1">
            <li>• 郵便番号を入力すると住所が自動補完されます</li>
            <li>• 郵便番号が見つからない場合は手動入力に切り替わります</li>
            <li>• 全角数字（１２３）は自動的に半角数字（123）に変換されます</li>
            <li>• 位置情報が取得できた場合、地図で確認できます</li>
          </ul>
        </div>
      )}
    </div>
  );
}
