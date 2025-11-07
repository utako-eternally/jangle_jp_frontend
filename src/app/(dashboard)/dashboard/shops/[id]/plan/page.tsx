// src/app/(dashboard)/dashboard/shops/[id]/plan/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { CreditCard, Check, X, Calendar, AlertCircle, Crown, Loader2 } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getCurrentPlan, startPaidPlan, cancelPlan } from "@/lib/api/plans";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface PlanInfo {
  has_plan: boolean;
  plan?: {
    id: number;
    plan_type: 'free' | 'paid';
    status: 'active' | 'expired' | 'cancelled';
    started_at: string;
    expires_at: string;
    remaining_days: number | null;
    expires_in_human: string | null;
    auto_renew: boolean;
    is_valid: boolean;
  };
  is_paid_plan: boolean;
  can_use_line: boolean;
  can_use_gallery: boolean;
  can_use_blog: boolean;
}

export default function PlanPage() {
  const params = useParams();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  // データ取得
  useEffect(() => {
    loadData();
  }, [shopId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 店舗情報取得
      const shopResponse = await getMyShop(Number(shopId));
      if (!shopResponse.success || !shopResponse.data) {
        throw new Error("店舗情報の取得に失敗しました");
      }
      setShop(shopResponse.data);

      // プラン情報取得
      const planResponse = await getCurrentPlan(Number(shopId));
      if (planResponse.success && planResponse.data) {
        setPlanInfo(planResponse.data);
      }

    } catch (err: any) {
      console.error("データ取得エラー:", err);
      setError(err.message || "データの取得に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  // 有料プランに切り替え
  const handleUpgradeToPaid = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await startPaidPlan(Number(shopId), {
        duration_months: 1,
      });

      if (!result.success) {
        throw new Error(result.message || "有料プランへの切り替えに失敗しました");
      }

      setSuccessMessage("有料プランに切り替えました。");
      setShowUpgradeModal(false);
      
      // データ再取得
      setTimeout(() => {
        loadData();
      }, 1000);

    } catch (err: any) {
      console.error("プラン切り替えエラー:", err);
      setError(err.message || "有料プランへの切り替えに失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  // 無料プランに切り替え（プランキャンセル）
  const handleDowngradeToFree = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      const result = await cancelPlan(Number(shopId));

      if (!result.success) {
        throw new Error(result.message || "プランのキャンセルに失敗しました");
      }

      setSuccessMessage(result.data?.message || "プランをキャンセルしました。");
      setShowCancelModal(false);
      
      // データ再取得
      setTimeout(() => {
        loadData();
      }, 1000);

    } catch (err: any) {
      console.error("プランキャンセルエラー:", err);
      setError(err.message || "プランのキャンセルに失敗しました。");
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

  if (!shop || !planInfo) {
    return <ErrorMessage message="店舗情報またはプラン情報が見つかりません。" />;
  }

  const isPaidPlan = planInfo.is_paid_plan;
  const isActive = planInfo.plan?.status === 'active';

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">プラン管理</h1>
        <p className="text-gray-600">
          現在のプラン状況と利用可能な機能を確認できます
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 開発段階の注意 */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <AlertCircle className="w-5 h-5 text-yellow-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-yellow-700">
            <h4 className="font-medium mb-1">開発段階モード</h4>
            <p className="text-xs">
              現在は開発段階のため、決済処理は行われません。有料プランへの切り替えは即座に反映されます。
            </p>
          </div>
        </div>
      </div>

      {/* 現在のプラン */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">現在のプラン</h2>
          
          <div className={`border-2 rounded-lg p-6 ${
            isPaidPlan ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'
          }`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                {isPaidPlan ? (
                  <Crown className="w-8 h-8 text-blue-600 mr-3" />
                ) : (
                  <CreditCard className="w-8 h-8 text-gray-600 mr-3" />
                )}
                <div>
                  <h3 className={`text-2xl font-bold ${
                    isPaidPlan ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {isPaidPlan ? '有料プラン' : '無料プラン'}
                  </h3>
                  {planInfo.plan && (
                    <p className="text-sm text-gray-600 mt-1">
                      ステータス: {
                        planInfo.plan.status === 'active' ? '有効' :
                        planInfo.plan.status === 'cancelled' ? 'キャンセル済み' :
                        '期限切れ'
                      }
                    </p>
                  )}
                </div>
              </div>

              {isPaidPlan && isActive && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  <Check className="w-4 h-4 mr-1" />
                  アクティブ
                </span>
              )}
            </div>

            {/* 有効期限 */}
            {planInfo.plan && isPaidPlan && (
              <div className="mt-4 pt-4 border-t border-blue-200">
                <div className="flex items-center text-sm text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 mr-2" />
                  <span className="font-medium">有効期限:</span>
                  <span className="ml-2">
                    {new Date(planInfo.plan.expires_at).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                {planInfo.plan.remaining_days !== null && (
                  <p className="text-sm text-gray-600 ml-6">
                    残り {planInfo.plan.remaining_days} 日
                  </p>
                )}
              </div>
            )}

            {/* 利用可能機能 */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h4 className="text-sm font-medium text-gray-700 mb-3">利用可能な機能</h4>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  {planInfo.can_use_line ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={planInfo.can_use_line ? 'text-gray-900' : 'text-gray-500'}>
                    LINE連携機能
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {planInfo.can_use_gallery ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={planInfo.can_use_gallery ? 'text-gray-900' : 'text-gray-500'}>
                    ギャラリー機能（複数画像投稿）
                  </span>
                </div>
                <div className="flex items-center text-sm">
                  {planInfo.can_use_blog ? (
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400 mr-2" />
                  )}
                  <span className={planInfo.can_use_blog ? 'text-gray-900' : 'text-gray-500'}>
                    ブログ機能
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          {!isPaidPlan ? (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              <Crown className="w-5 h-5 mr-2" />
              有料プランにアップグレード
            </button>
          ) : (
            <button
              onClick={() => setShowCancelModal(true)}
              disabled={!isActive}
              className={`w-full flex items-center justify-center px-6 py-3 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              プランをキャンセル
            </button>
          )}
        </div>
      </div>

      {/* プラン比較 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">プラン比較</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  機能
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  無料プラン
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
                  有料プラン
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  基本情報登録
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  LINE連携
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ギャラリー機能
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  ブログ機能
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <X className="w-5 h-5 text-gray-400 mx-auto" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center bg-blue-50">
                  <Check className="w-5 h-5 text-green-600 mx-auto" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* アップグレード確認モーダル */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                有料プランにアップグレード
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  以下の機能が利用可能になります：
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    LINE連携機能
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    ギャラリー機能（複数画像）
                  </li>
                  <li className="flex items-center">
                    <Check className="w-4 h-4 text-green-600 mr-2" />
                    ブログ機能
                  </li>
                </ul>

                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    期間: 1ヶ月
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    ※開発段階のため決済は不要です
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  キャンセル
                </button>
                <button
                  onClick={handleUpgradeToPaid}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    'アップグレード'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* キャンセル確認モーダル */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                プランをキャンセル
              </h3>
              
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-4">
                  プランをキャンセルすると、有効期限まで利用可能ですが、期限後は無料プランに戻ります。
                </p>
                
                {planInfo.plan && (
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="text-sm text-yellow-700">
                      {new Date(planInfo.plan.expires_at).toLocaleDateString('ja-JP')} まで利用可能
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowCancelModal(false)}
                  disabled={submitting}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  戻る
                </button>
                <button
                  onClick={handleDowngradeToFree}
                  disabled={submitting}
                  className={`flex-1 flex items-center justify-center px-4 py-2 rounded-lg font-medium transition-colors ${
                    submitting
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      処理中...
                    </>
                  ) : (
                    'キャンセル'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}