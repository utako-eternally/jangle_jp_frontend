"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Store,
  Calculator,
  MapPin,
  Train,
  Building2,
  Camera,
  FileCheck,
  Clock,
} from "lucide-react";
import { ShopFormData } from "@/types/form";
import { createMyShop, updateMyShop } from "@/lib/api/shops";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { WarningMessage } from "@/components/ui/warning-message";

// フォームコンポーネントをインポート
import ShopBasicInfoForm from "./ShopBasicInfoForm";
import ShopBusinessHoursForm from "./ShopBusinessHoursForm";
import ShopBusinessTypeForm from "./ShopBusinessTypeForm";
import ShopTableCountForm from "./ShopTableCountForm";
import ShopAddressForm from "./ShopAddressForm";
import ShopStationForm from "./ShopStationForm";
import ShopImageForm from "./ShopImageForm";

interface ShopFormProps {
  mode?: "create" | "edit";
  initialData?: Partial<ShopFormData>;
  shopId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function ShopForm({
  mode = "create",
  initialData = {},
  shopId,
  onSuccess,
  onCancel,
}: ShopFormProps) {
  const router = useRouter();

  const STEPS = [
    {
      id: 0,
      title: "基本情報",
      description: "店舗名・連絡先など",
      icon: Store,
    },
    {
      id: 1,
      title: "営業時間",
      description: "曜日別の営業時間",
      icon: Clock,
    },
    {
      id: 2,
      title: "営業形態",
      description: "フリー・セットの選択",
      icon: Building2,
    },
    {
      id: 3,
      title: "卓数設定",
      description: "雀卓の構成",
      icon: Calculator,
    },
    {
      id: 4,
      title: "住所・位置",
      description: "住所と位置情報",
      icon: MapPin,
    },
    {
      id: 5,
      title: "最寄り駅",
      description: "最寄り駅の選択",
      icon: Train,
    },
    {
      id: 6,
      title: "店舗画像",
      description: "ロゴ・カバー画像",
      icon: Camera,
    },
    {
      id: 7,
      title: "確認・登録",
      description: "内容確認と登録",
      icon: FileCheck,
    },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [stepValidation, setStepValidation] = useState<boolean[]>([
    false, // 基本情報
    true,  // 営業時間（任意なので常にtrue）
    false, // 営業形態
    false, // 卓数
    false, // 住所
    false, // 駅
    true,  // 画像（任意なので常にtrue）
    false, // 確認
  ]);

  const [formErrors, setFormErrors] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  const defaultBusinessHours = [
    { day_of_week: 0, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 1, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 2, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 3, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 4, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 5, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 6, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
    { day_of_week: 7, is_closed: false, is_24h: false, open_time: "12:00", close_time: "23:00" },
  ];

  const [formData, setFormData] = useState<ShopFormData>(() => ({
    basicInfo: {
      name: initialData.basicInfo?.name || "",
      phone: initialData.basicInfo?.phone || "",
      website_url: initialData.basicInfo?.website_url || "",
      description: initialData.basicInfo?.description || "",
    },
    businessHours: initialData.businessHours || defaultBusinessHours,
    openHoursText: initialData.basicInfo?.open_hours_text || "",
    businessTypeData: initialData.businessTypeData || {
      three_player_free: false,
      four_player_free: false,
      set: false,
    },
    tableCount: {
      table_count: initialData.tableCount?.table_count || 0,
      score_table_count: initialData.tableCount?.score_table_count || 0,
      auto_table_count: initialData.tableCount?.auto_table_count || 0,
    },
    addressData: initialData.addressData || {
      node_address_result: {
        lat: 0,
        lng: 0,
        formatted_address: "",
      },
    },
    stationData: initialData.stationData || {
      nearest_station_id: null,
      sub_station_ids: [],
      stations: {
        main: undefined,
        sub: [],
      },
    },
    imageData: {
      logo_image: initialData.imageData?.logo_image || null,
      cover_image: initialData.imageData?.cover_image || null,
    },
  }));

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const updateStepValidation = (step: number, isValid: boolean) => {
    const newValidation = [...stepValidation];
    newValidation[step] = isValid;
    setStepValidation(newValidation);
  };

  const updateFormData = (step: number, data: any) => {
    setFormData((prevData) => {
      switch (step) {
        case 0:
          return { ...prevData, basicInfo: data };
        case 1:
          // 営業時間データのみ更新
          if (Array.isArray(data)) {
            return { ...prevData, businessHours: data };
          }
          return prevData;
        case 2:
          return { ...prevData, businessTypeData: data };
        case 3:
          return { ...prevData, tableCount: data };
        case 4:
          return { ...prevData, addressData: data };
        case 5:
          return { ...prevData, stationData: data };
        case 6:
          return { ...prevData, imageData: data };
        default:
          return prevData;
      }
    });
  };

  const updateOpenHoursText = (text: string) => {
    setFormData((prevData) => ({
      ...prevData,
      openHoursText: text,
    }));
  };

  const goToNextStep = () => {
    if (currentStep < STEPS.length - 1 && stepValidation[currentStep]) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      scrollToTop();
    }
  };

  const goToPrevStep = () => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      scrollToTop();
    }
  };

  const goToStep = (step: number) => {
    setCurrentStep(step);
    scrollToTop();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const submitFormData = new FormData();

      // 基本情報
      submitFormData.append("name", formData.basicInfo.name);
      if (formData.basicInfo.phone)
        submitFormData.append("phone", formData.basicInfo.phone);
      if (formData.basicInfo.website_url)
        submitFormData.append("website_url", formData.basicInfo.website_url);
      if (formData.openHoursText)
        submitFormData.append("open_hours_text", formData.openHoursText);
      if (formData.basicInfo.description)
        submitFormData.append("description", formData.basicInfo.description);

      // 営業時間
      if (formData.businessHours && formData.businessHours.length > 0) {
        formData.businessHours.forEach((hour, index) => {
          submitFormData.append(`business_hours[${index}][day_of_week]`, hour.day_of_week.toString());
          submitFormData.append(`business_hours[${index}][is_closed]`, hour.is_closed ? "1" : "0");
          submitFormData.append(`business_hours[${index}][is_24h]`, hour.is_24h ? "1" : "0");
          
          if (!hour.is_closed && !hour.is_24h) {
            if (hour.open_time) submitFormData.append(`business_hours[${index}][open_time]`, hour.open_time);
            if (hour.close_time) submitFormData.append(`business_hours[${index}][close_time]`, hour.close_time);
          }
        });
      }

      // 営業形態
      submitFormData.append(
        "three_player_free",
        formData.businessTypeData.three_player_free ? "1" : "0"
      );
      submitFormData.append(
        "four_player_free",
        formData.businessTypeData.four_player_free ? "1" : "0"
      );
      submitFormData.append("set", formData.businessTypeData.set ? "1" : "0");

      // 卓数情報
      submitFormData.append(
        "table_count",
        formData.tableCount.table_count.toString()
      );
      submitFormData.append(
        "score_table_count",
        formData.tableCount.score_table_count.toString()
      );
      submitFormData.append(
        "auto_table_count",
        formData.tableCount.auto_table_count.toString()
      );

      // 住所情報
      const nr = formData.addressData.node_address_result;
      submitFormData.append("lat", String(nr.lat));
      submitFormData.append("lng", String(nr.lng));

      if (nr.address_details) {
        const details = nr.address_details;
        submitFormData.append("address_pref", details.prefecture || "");
        submitFormData.append("address_city", details.city || "");
        submitFormData.append("address_town", details.town || "");
        if (details.street) {
          submitFormData.append("address_street", details.street);
        }
        if (details.building) {
          submitFormData.append("address_building", details.building);
        }
      } else {
        submitFormData.append("address_pref", "");
        submitFormData.append("address_city", "");
        submitFormData.append("address_town", "");
      }

      // 駅情報
      if (formData.stationData.nearest_station_id) {
        submitFormData.append(
          "nearest_station_id",
          formData.stationData.nearest_station_id.toString()
        );
      }
      if (
        formData.stationData.sub_station_ids &&
        formData.stationData.sub_station_ids.length > 0
      ) {
        formData.stationData.sub_station_ids.forEach((stationId, index) => {
          submitFormData.append(
            `sub_station_ids[${index}]`,
            stationId.toString()
          );
        });
      }

      // 画像ファイル
      if (formData.imageData.logo_image) {
        submitFormData.append("logo_image", formData.imageData.logo_image);
      }
      if (formData.imageData.cover_image) {
        submitFormData.append("cover_image", formData.imageData.cover_image);
      }

      console.log("=== FormData送信内容 ===");
      for (const [key, value] of submitFormData.entries()) {
        console.log(
          `${key}:`,
          value instanceof File
            ? `File(${value.name}, ${value.size}bytes)`
            : value
        );
      }

      // API呼び出し
      let result;
      if (mode === "edit" && shopId) {
        console.log("編集モード: PUT /shops/" + shopId);
        result = await updateMyShop(shopId, submitFormData);
      } else {
        console.log("新規作成モード: POST /shops");
        result = await createMyShop(submitFormData);
      }

      if (!result.success) {
        throw new Error(result.message || "店舗の処理に失敗しました");
      }

      console.log("店舗処理成功:", result);

      const message =
        mode === "edit" ? "店舗情報を更新しました" : "店舗を登録しました";
      setSubmitSuccess(message);

      setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/shops");
        }
      }, 1500);
    } catch (error: any) {
      console.error("店舗処理エラー:", error);
      const message =
        mode === "edit"
          ? "店舗情報の更新に失敗しました"
          : "店舗の作成に失敗しました";
      setSubmitError(error.message || message);

      setCurrentStep(STEPS.length - 1);
      scrollToTop();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    const message =
      mode === "edit"
        ? "変更内容が失われますが、よろしいですか？"
        : "入力中の内容が失われますが、よろしいですか？";

    if (confirm(message)) {
      if (onCancel) {
        onCancel();
      } else {
        router.push("/dashboard/shops");
      }
    }
  };

  const getCurrentStepComponent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ShopBasicInfoForm
            value={formData.basicInfo}
            onChange={(data) => updateFormData(0, data)}
            onValidationChange={(isValid) => updateStepValidation(0, isValid)}
            errors={formErrors.basicInfo}
          />
        );
      case 1:
        return (
          <ShopBusinessHoursForm
            value={formData.businessHours}
            openHoursText={formData.openHoursText}
            onChange={(data) => updateFormData(1, data)}
            onOpenHoursTextChange={updateOpenHoursText}
            onValidationChange={(isValid) => updateStepValidation(1, isValid)}
            errors={formErrors.businessHours}
          />
        );
      case 2:
        return (
          <ShopBusinessTypeForm
            value={formData.businessTypeData}
            onChange={(data) => updateFormData(2, data)}
            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
            errors={formErrors.businessTypeData}
          />
        );
      case 3:
        return (
          <ShopTableCountForm
            mode={mode}
            value={formData.tableCount}
            onChange={(data) => updateFormData(3, data)}
            onValidationChange={(isValid) => updateStepValidation(3, isValid)}
            errors={formErrors.tableCount}
          />
        );
      case 4:
        return (
          <ShopAddressForm
            mode={mode}
            value={formData.addressData}
            onChange={(data) => updateFormData(4, data)}
            onValidationChange={(isValid) => updateStepValidation(4, isValid)}
            errors={formErrors.addressData}
          />
        );
      case 5:
        return (
          <ShopStationForm
            mode={mode}
            value={formData.stationData}
            addressCoordinates={
              formData.addressData?.node_address_result?.coordinates ||
              (formData.addressData?.node_address_result?.lat &&
              formData.addressData?.node_address_result?.lng
                ? {
                    lat: formData.addressData.node_address_result.lat,
                    lng: formData.addressData.node_address_result.lng,
                  }
                : null)
            }
            onChange={(data) => updateFormData(5, data)}
            onValidationChange={(isValid) => updateStepValidation(5, isValid)}
            errors={formErrors.stationData}
          />
        );
      case 6:
        return (
          <ShopImageForm
            value={formData.imageData}
            onChange={(data) => updateFormData(6, data)}
            onValidationChange={(isValid) => updateStepValidation(6, isValid)}
            maxImages={2}
            allowedTypes={["image/jpeg", "image/png", "image/gif"]}
          />
        );
      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                確認・登録
              </h2>
              <p className="text-sm text-gray-600">
                入力内容を確認して、店舗を登録してください。
              </p>
            </div>

            {submitError && <ErrorMessage message={submitError} />}
            {submitSuccess && <SuccessMessage message={submitSuccess} />}

            {/* 基本情報プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Store className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    基本情報
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(0)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">
                    店舗名
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {formData.basicInfo.name}
                  </p>
                </div>

                {formData.basicInfo.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      電話番号
                    </label>
                    <p className="text-gray-900">{formData.basicInfo.phone}</p>
                  </div>
                )}

                {formData.basicInfo.website_url && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      ウェブサイト
                    </label>
                    <p className="text-gray-900 truncate">
                      {formData.basicInfo.website_url}
                    </p>
                  </div>
                )}
              </div>

              {formData.basicInfo.description && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    店舗説明
                  </label>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {formData.basicInfo.description}
                  </p>
                </div>
              )}
            </div>

            {/* 営業時間プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    営業時間
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(1)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="space-y-2">
                {formData.businessHours.filter(h => h.day_of_week <= 6).map(hour => {
                  const dayNames = ['日', '月', '火', '水', '木', '金', '土'];
                  const dayName = dayNames[hour.day_of_week];
                  
                  let timeText = "";
                  if (hour.is_closed) {
                    timeText = "定休日";
                  } else if (hour.is_24h) {
                    timeText = "24時間営業";
                  } else {
                    timeText = `${hour.open_time} - ${hour.close_time}`;
                  }

                  return (
                    <div key={hour.day_of_week} className="flex justify-between py-1 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700">{dayName}曜日</span>
                      <span className="text-gray-900">{timeText}</span>
                    </div>
                  );
                })}
              </div>

              {formData.openHoursText && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    営業時間補足
                  </label>
                  <p className="text-gray-700 text-sm leading-relaxed">
                    {formData.openHoursText}
                  </p>
                </div>
              )}
            </div>

            {/* 営業形態プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Building2 className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    営業形態
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(2)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                {formData.businessTypeData.three_player_free && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    フリー三麻
                  </span>
                )}
                {formData.businessTypeData.four_player_free && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    フリー四麻
                  </span>
                )}
                {formData.businessTypeData.set && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    セット雀荘
                  </span>
                )}
              </div>
            </div>

            {/* 卓数プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Calculator className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    卓数設定
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(3)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">
                    {formData.tableCount.table_count}
                  </p>
                  <p className="text-sm text-blue-700">総卓数</p>
                </div>

                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {formData.tableCount.score_table_count}
                  </p>
                  <p className="text-sm text-green-700">自動配牌</p>
                </div>

                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-2xl font-bold text-purple-600">
                    {formData.tableCount.auto_table_count}
                  </p>
                  <p className="text-sm text-purple-700">全自動</p>
                </div>

                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-gray-600">
                    {Math.max(
                      0,
                      formData.tableCount.table_count -
                        formData.tableCount.score_table_count -
                        formData.tableCount.auto_table_count
                    )}
                  </p>
                  <p className="text-sm text-gray-700">その他</p>
                </div>
              </div>
            </div>

            {/* 住所プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <MapPin className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    住所・位置情報
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(4)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    住所
                  </label>
                  <p className="text-gray-900">
                    {formData.addressData.node_address_result
                      .formatted_address ||
                      formData.addressData.node_address_result.final_address ||
                      "住所情報なし"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      緯度
                    </label>
                    <p className="text-gray-700 font-mono text-sm">
                      {formData.addressData.node_address_result.lat}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">
                      経度
                    </label>
                    <p className="text-gray-700 font-mono text-sm">
                      {formData.addressData.node_address_result.lng}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 駅情報プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Train className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    最寄り駅情報
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(5)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              {formData.stationData.stations?.main ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      メイン駅
                    </label>
                    <div className="p-3 rounded border border-orange-200 bg-orange-50">
                      <p className="text-sm font-medium text-gray-900">
                        {formData.stationData.stations.main.name}
                      </p>
                      {formData.stationData.stations.main.lines && (
                        <p className="text-xs text-gray-600">
                          {formData.stationData.stations.main.lines}
                        </p>
                      )}
                    </div>
                  </div>

                  {formData.stationData.stations.sub &&
                    formData.stationData.stations.sub.length > 0 && (
                      <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">
                          サブ駅（{formData.stationData.stations.sub.length}駅）
                        </label>
                        <div className="space-y-2">
                          {formData.stationData.stations.sub.map(
                            (station, index) => (
                              <div
                                key={`sub-${station.id}-${index}`}
                                className="p-2 rounded border border-blue-200 bg-blue-50"
                              >
                                <p className="text-sm font-medium text-gray-900">
                                  {station.name}
                                </p>
                                {station.lines && (
                                  <p className="text-xs text-gray-600">
                                    {station.lines}
                                  </p>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}
                </div>
              ) : (
                <WarningMessage message="最寄り駅が選択されていません" />
              )}
            </div>

            {/* 画像プレビュー */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Camera className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-medium text-gray-900">
                    店舗画像
                  </h3>
                </div>
                <button
                  onClick={() => goToStep(6)}
                  className="text-sm text-orange-600 hover:text-orange-700"
                >
                  編集
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    ロゴ画像
                  </label>
                  {formData.imageData.logo_image ? (
                    <div className="flex justify-center">
                      <img
                        src={URL.createObjectURL(formData.imageData.logo_image)}
                        alt="ロゴプレビュー"
                        className="w-20 h-20 object-cover rounded-full border-2 border-gray-200"
                      />
                    </div>
                  ) : (
                    <div className="flex justify-center">
                      <div className="flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full border-2 border-dashed border-gray-300">
                        <Camera className="w-8 h-8 text-gray-400" />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    カバー画像
                  </label>
                  {formData.imageData.cover_image ? (
                    <div className="w-full" style={{ aspectRatio: "16/9" }}>
                      <img
                        src={URL.createObjectURL(
                          formData.imageData.cover_image
                        )}
                        alt="カバー画像プレビュー"
                        className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex items-center justify-center w-full bg-gray-100 rounded-lg border-2 border-dashed border-gray-300"
                      style={{ aspectRatio: "16/9" }}
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 登録ボタン */}
            <div className="flex justify-center pt-4">
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`flex items-center px-8 py-3 rounded-lg font-medium transition-colors ${
                  isSubmitting
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-orange-600 hover:bg-orange-700 text-white"
                }`}
              >
                {isSubmitting
                  ? "処理中..."
                  : mode === "edit"
                  ? "更新する"
                  : "登録する"}
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const pageTitle = mode === "edit" ? "店舗情報編集" : "新規店舗登録";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={handleCancel}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                戻る
              </button>
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-xl font-semibold text-gray-900">
                  {pageTitle}
                </h1>
              </div>
            </div>

            <div className="text-sm text-gray-500">
              ステップ {currentStep + 1} / {STEPS.length}
            </div>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const isCompleted = index < currentStep || stepValidation[index];
              const isCurrent = index === currentStep;
              const IconComponent = step.icon;

              return (
                <div key={step.id} className="flex items-center flex-1">
                  <div className="flex items-center">
                    <div
                      className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                        isCompleted
                          ? "bg-green-600 border-green-600 text-white"
                          : isCurrent
                          ? "bg-orange-600 border-orange-600 text-white"
                          : "bg-white border-gray-300 text-gray-400"
                      }`}
                    >
                      {isCompleted && index !== currentStep ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <IconComponent className="w-5 h-5" />
                      )}
                    </div>

                    <div className="ml-3 hidden sm:block">
                      <p
                        className={`text-sm font-medium ${
                          isCurrent
                            ? "text-orange-600"
                            : isCompleted
                            ? "text-green-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </p>
                      <p className="text-xs text-gray-500">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {index < STEPS.length - 1 && (
                    <div className="flex-1 mx-4">
                      <div
                        className={`h-1 rounded transition-colors ${
                          index < currentStep ? "bg-green-600" : "bg-gray-200"
                        }`}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 lg:p-8">
          {getCurrentStepComponent()}
        </div>
      </div>

      {/* フッター（ナビゲーションボタン） */}
      {currentStep < STEPS.length - 1 && (
        <div className="bg-white border-t border-gray-200 sticky bottom-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between">
              <button
                onClick={goToPrevStep}
                disabled={currentStep === 0}
                className={`flex items-center px-4 py-2 rounded-md font-medium transition-colors ${
                  currentStep === 0
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                前へ
              </button>

              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-500">
                  {stepValidation[currentStep] ? "入力完了" : "入力中..."}
                </span>

                <button
                  onClick={goToNextStep}
                  disabled={!stepValidation[currentStep]}
                  className={`flex items-center px-6 py-2 rounded-md font-medium transition-colors ${
                    stepValidation[currentStep]
                      ? "bg-orange-600 text-white hover:bg-orange-700"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  次へ
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}