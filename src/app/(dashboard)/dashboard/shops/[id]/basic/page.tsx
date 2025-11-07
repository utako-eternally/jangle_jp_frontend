// src/app/(dashboard)/dashboard/shops/[id]/basic/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { getMyShop, updateMyShop } from "@/lib/api/shops";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";
import { WarningMessage } from "@/components/ui/warning-message";
import ShopBasicInfoForm from "@/app/shops/components/ShopBasicInfoForm";
import ShopAddressForm from "@/app/shops/components/ShopAddressForm";

export default function BasicInfoEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // フォームデータ
  const [basicInfo, setBasicInfo] = useState({
    name: "",
    phone: "",
    website_url: "",
    open_hours: "",
    description: "",
  });

  const [addressData, setAddressData] = useState<any>(null);

  // バリデーション状態
  const [basicInfoValid, setBasicInfoValid] = useState(false);
  const [addressValid, setAddressValid] = useState(false);

  // 店舗情報を取得
  useEffect(() => {
    const loadShop = async () => {
      try {
        const response = await getMyShop(Number(shopId));
        
        if (response.success && response.data) {
          const shopData = response.data;
          setShop(shopData);

          // 基本情報を初期化
          setBasicInfo({
            name: shopData.name || "",
            phone: shopData.phone || "",
            website_url: shopData.website_url || "",
            open_hours: shopData.open_hours || "",
            description: shopData.description || "",
          });

          // 住所情報を初期化
          if (shopData.lat && shopData.lng) {
            setAddressData({
              node_address_result: {
                lat: shopData.lat,
                lng: shopData.lng,
                formatted_address: `${shopData.address_pref || ''}${shopData.address_city || ''}${shopData.address_town || ''}${shopData.address_street || ''}${shopData.address_building || ''}`,
                final_address: `${shopData.address_pref || ''}${shopData.address_city || ''}${shopData.address_town || ''}${shopData.address_street || ''}${shopData.address_building || ''}`,
                coordinates: {
                  lat: shopData.lat,
                  lng: shopData.lng,
                },
                address_details: {
                  prefecture: shopData.address_pref || "",
                  city: shopData.address_city || "",
                  town: shopData.address_town || "",
                  street: shopData.address_street || "",
                  building: shopData.address_building || "",
                  postal_code: "",
                },
              },
            });
            setAddressValid(true);
          }
        } else {
          setError("店舗情報の取得に失敗しました");
        }
      } catch (err: any) {
        setError(err.response?.data?.message || "データの取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  // 保存処理
  const handleSubmit = async () => {
    if (!basicInfoValid || !addressValid) {
      setError("入力内容に不備があります");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const submitData: any = {
        // 基本情報
        name: basicInfo.name,
        phone: basicInfo.phone,
        website_url: basicInfo.website_url || "",
        open_hours: basicInfo.open_hours || "",
        description: basicInfo.description || "",
      };

      // 住所情報
      if (addressData?.node_address_result) {
        const nr = addressData.node_address_result;
        submitData.lat = nr.lat;
        submitData.lng = nr.lng;

        if (nr.address_details) {
          const details = nr.address_details;
          submitData.address_pref = details.prefecture || "";
          submitData.address_city = details.city || "";
          submitData.address_town = details.town || "";
          submitData.address_street = details.street || "";
          submitData.address_building = details.building || "";
        }
      }

      console.log("=== 送信データ ===", submitData);

      const result = await updateMyShop(Number(shopId), submitData);

      if (!result.success) {
        throw new Error(result.message || "更新に失敗しました");
      }

      // バックエンドからのメッセージを表示
      setSuccessMessage(result.message || "基本情報を更新しました");

      // 更新された店舗情報を再取得
      setTimeout(() => {
        router.push(`/dashboard/shops/${shopId}`);
      }, 2000);

    } catch (err: any) {
      console.error("更新エラー:", err);
      setError(err.message || "基本情報の更新に失敗しました");
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
    return <ErrorMessage message="店舗情報が見つかりません" />;
  }

  const canSubmit = basicInfoValid && addressValid && !submitting;

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">基本情報の編集</h1>
        <p className="text-gray-600">
          店舗の基本情報を編集します
        </p>
      </div>

      {/* 注意メッセージ */}
      <WarningMessage
        title="重要な情報を変更する場合の注意"
        message="店舗名、電話番号、営業時間、住所を変更すると、管理事務局の再確認が必要となり、確認完了まで公開ページに表示されなくなります"
      />

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 基本情報フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShopBasicInfoForm
          value={basicInfo}
          onChange={setBasicInfo}
          onValidationChange={setBasicInfoValid}
        />
      </div>

      {/* 住所情報フォーム */}
      <div className="bg-white rounded-lg shadow p-6">
        <ShopAddressForm
          mode="edit"
          value={addressData}
          onChange={setAddressData}
          onValidationChange={setAddressValid}
        />
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {canSubmit ? "保存する準備ができました" : "入力内容を確認してください"}
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