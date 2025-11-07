// src/app/(dashboard)/dashboard/shops/[id]/rules/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Save, Loader2, CheckCircle, Info, AlertCircle, FileText } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { getRuleGroups, getShopRules, updateShopRules } from '@/lib/api/rules';
import type { RuleGroup, RuleOption } from '@/lib/api/rules';
import { getShopRuleTexts, updateShopRuleText } from "@/lib/api/rule-texts";
import { Shop } from "@/types/models";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorMessage } from "@/components/ui/error-message";
import { SuccessMessage } from "@/components/ui/success-message";

interface RuleTextData {
  category: string;
  category_label: string;
  content: string;
}

export default function RulesEditPage() {
  const params = useParams();
  const router = useRouter();
  const shopId = params.id as string;

  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ルール選択関連
  const [ruleGroups, setRuleGroups] = useState<RuleGroup[]>([]);
  const [selectedRules, setSelectedRules] = useState<Set<string>>(new Set());

  // ルールテキスト関連
  const [ruleTexts, setRuleTexts] = useState<RuleTextData[]>([]);
  const [ruleTextCategories, setRuleTextCategories] = useState<{[key: string]: string}>({});

  // データ取得
  useEffect(() => {
    const loadData = async () => {
      try {
        // 店舗情報取得
        const shopResponse = await getMyShop(Number(shopId));
        if (!shopResponse.success || !shopResponse.data) {
          throw new Error("店舗情報の取得に失敗しました");
        }
        setShop(shopResponse.data);

        // 利用可能なルールグループ取得
        const groups = await getRuleGroups();
        setRuleGroups(groups);

        // 現在のルール取得
        const currentResponse = await getShopRules(Number(shopId));
        
        if (currentResponse.success && currentResponse.data?.all_rules) {
          const currentRuleKeys = currentResponse.data.all_rules.map(
            (r: any) => r.rule
          );
          setSelectedRules(new Set(currentRuleKeys));
        }

        // ルールテキスト取得
        const ruleTextsResponse = await getShopRuleTexts(Number(shopId));
        
        if (ruleTextsResponse.success && ruleTextsResponse.data) {
          setRuleTexts(ruleTextsResponse.data.rule_texts || []);
          setRuleTextCategories(ruleTextsResponse.data.categories || {});
        }

      } catch (err: any) {
        console.error("データ取得エラー:", err);
        setError(err.message || "データの取得に失敗しました。");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [shopId]);

  // ルールの選択/解除
  const toggleRule = (ruleValue: string, group: RuleGroup) => {
    const newSelected = new Set(selectedRules);
    const isCurrentlySelected = newSelected.has(ruleValue);

    if (isCurrentlySelected) {
      // 選択解除
      newSelected.delete(ruleValue);
    } else {
      // トグルグループの場合、同じグループ内の他のルールを解除
      if (group.type === 'toggle') {
        group.options.forEach(option => {
          if (option.value !== ruleValue) {
            newSelected.delete(option.value);
          }
        });
      }
      
      // 新しいルールを追加
      newSelected.add(ruleValue);
    }

    setSelectedRules(newSelected);
  };

  // ルールテキストの内容を更新
  const handleRuleTextChange = (category: string, content: string) => {
    setRuleTexts(prev => {
      const existing = prev.find(rt => rt.category === category);
      if (existing) {
        return prev.map(rt => 
          rt.category === category ? { ...rt, content } : rt
        );
      } else {
        return [...prev, {
          category,
          category_label: ruleTextCategories[category] || category,
          content,
        }];
      }
    });
  };

  // 保存処理
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");
    setSuccessMessage("");

    try {
      // ルール選択を保存
      const rulesResult = await updateShopRules(
        Number(shopId),
        { rules: Array.from(selectedRules) }
      );

      if (!rulesResult.success) {
        throw new Error(rulesResult.message || "ルールの更新に失敗しました");
      }

      // ルールテキストを保存
      const textPromises = ruleTexts.map(ruleText => 
        updateShopRuleText(Number(shopId), ruleText.category, {
          content: ruleText.content,
        })
      );

      await Promise.all(textPromises);

      setSuccessMessage("ルールとルールテキストを更新しました。");

      // 2秒後に概要ページへ遷移
      setTimeout(() => {
        router.push(`/dashboard/shops/${shopId}`);
      }, 2000);

    } catch (err: any) {
      console.error("保存エラー:", err);
      setError(err.message || "ルールの更新に失敗しました。");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSubmitting(false);
    }
  };

  // ルール名の取得
  const getRuleName = (ruleValue: string): string => {
    for (const group of ruleGroups) {
      const option = group.options.find(opt => opt.value === ruleValue);
      if (option) return option.label;
    }
    return ruleValue;
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (!shop) {
    return <ErrorMessage message="店舗情報が見つかりません。" />;
  }

  return (
    <div className="space-y-6">
      {/* ページヘッダー */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">店舗ルールの編集</h1>
        <p className="text-gray-600">
          店舗のルールを選択し、詳細なルール説明を入力してください
        </p>
      </div>

      {/* エラー・成功メッセージ */}
      {error && <ErrorMessage message={error} />}
      {successMessage && <SuccessMessage message={successMessage} />}

      {/* 選択状況 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">選択中のルール</h2>
          <span className="text-sm text-gray-600">
            {selectedRules.size}件選択中
          </span>
        </div>
        
        {selectedRules.size > 0 ? (
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedRules).map((ruleValue) => {
              const ruleName = getRuleName(ruleValue);

              return (
                <span
                  key={ruleValue}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  {ruleName}
                </span>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-gray-500">ルールが選択されていません</p>
        )}
      </div>

      {/* グループ別ルール選択 */}
      {ruleGroups.map((group) => (
        <div key={group.id} className="bg-white rounded-lg shadow p-6">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-1">
              {group.label}
            </h2>
            {group.type === "toggle" && (
              <p className="text-sm text-gray-500">
                <AlertCircle className="w-4 h-4 inline mr-1" />
                いずれか1つを選択してください（選択解除も可能）
              </p>
            )}
            {group.type === "checkbox" && (
              <p className="text-sm text-gray-500">
                <Info className="w-4 h-4 inline mr-1" />
                複数選択可能です
              </p>
            )}
          </div>

          <div className="space-y-4">
            {group.type === 'toggle' ? (
              // トグルボタングループ（横並び）
              <div className="flex flex-wrap gap-3">
                {group.options.map((option) => {
                  const isSelected = selectedRules.has(option.value);

                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleRule(option.value, group)}
                      className={`flex-1 min-w-[200px] p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <h3
                          className={`font-medium ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {option.label}
                        </h3>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              // チェックボックスグループ（グリッド）
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.options.map((option) => {
                  const isSelected = selectedRules.has(option.value);

                  return (
                    <div
                      key={option.value}
                      onClick={() => toggleRule(option.value, group)}
                      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h3
                          className={`font-medium ${
                            isSelected ? "text-blue-900" : "text-gray-900"
                          }`}
                        >
                          {option.label}
                        </h3>
                        {isSelected && (
                          <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 ml-2" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ルールテキスト入力 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            ルール詳細説明
          </h2>
          <p className="text-sm text-gray-600">
            店舗独自のルールや注意事項を自由に記述できます
          </p>
        </div>

        <div className="space-y-6">
          {Object.entries(ruleTextCategories).map(([categoryKey, categoryLabel]) => {
            const existingText = ruleTexts.find(rt => rt.category === categoryKey);
            const content = existingText?.content || "";

            return (
              <div key={categoryKey}>
                <label className="block mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    {categoryLabel}
                  </span>
                </label>
                <textarea
                  value={content}
                  onChange={(e) => handleRuleTextChange(categoryKey, e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
                  placeholder={`${categoryLabel}を入力してください。`}
                />
                <p className="mt-1 text-xs text-gray-500">
                  改行も反映されます
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 説明 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <Info className="w-5 h-5 text-blue-400 mr-3 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <h4 className="font-medium mb-1">ルールについて</h4>
            <ul className="space-y-1 text-xs">
              <li>• トグル項目は1つのみ選択可能です（選択解除も可能）</li>
              <li>• チェックボックス項目は複数選択可能です</li>
              <li>• ルールテキストは任意ですが、店舗独自のルールがある場合は記載をおすすめします</li>
              <li>• 選択したルールとテキストは公開ページに表示されます</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 保存ボタン */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">
              {selectedRules.size > 0
                ? `${selectedRules.size}件のルールが選択されています`
                : "ルールを選択してください（任意）"}
            </p>
          </div>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              submitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>保存中...</span>
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