// src/components/shop/RulesTab.tsx
import { useEffect, useState } from 'react';
import { ShopRule, ShopRuleText, RULE_TEXT_CATEGORIES } from '@/types/models';
import { Shield, FileText, AlertTriangle, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface RulesTabProps {
  shopId: number;
  rules?: ShopRule[];
  ruleTexts?: ShopRuleText[];
}

export default function RulesTab({ shopId, rules, ruleTexts }: RulesTabProps) {
  const [loading, setLoading] = useState(!rules && !ruleTexts);
  const [ruleList, setRuleList] = useState<ShopRule[]>(rules || []);
  const [ruleTextList, setRuleTextList] = useState<ShopRuleText[]>(ruleTexts || []);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!rules && !ruleTexts) {
      // rulesが渡されていない場合は、APIから取得する処理を追加可能
      // 現状はshopオブジェクトから渡されることを想定
      setLoading(false);
    }
  }, [rules, ruleTexts]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'MAIN_RULES':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'PENALTY_RULES':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'MANNER_RULES':
        return <Users className="w-5 h-5 text-purple-500" />;
      default:
        return <Shield className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  const hasRules = ruleList && ruleList.length > 0;
  const hasRuleTexts = ruleTextList && ruleTextList.length > 0;

  if (!hasRules && !hasRuleTexts) {
    return (
      <div className="text-center py-12">
        <Shield className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-600">ルール情報はまだ登録されていません</p>
      </div>
    );
  }

  // カテゴリ別にルールをグループ化
  const categorizedRules: Record<string, ShopRule[]> = {};
  if (hasRules) {
    ruleList.forEach(rule => {
      const category = rule.category || 'その他';
      if (!categorizedRules[category]) {
        categorizedRules[category] = [];
      }
      categorizedRules[category].push(rule);
    });
  }

  // アクティブなルールテキストのみをカテゴリ別に分類
  const activeRuleTexts = ruleTextList
    ? ruleTextList
        .filter(rt => rt.is_active)
        .sort((a, b) => a.display_order - b.display_order)
    : [];

  const categorizedRuleTexts = {
    MAIN_RULES: activeRuleTexts.filter(rt => rt.category === 'MAIN_RULES'),
    PENALTY_RULES: activeRuleTexts.filter(rt => rt.category === 'PENALTY_RULES'),
    MANNER_RULES: activeRuleTexts.filter(rt => rt.category === 'MANNER_RULES'),
  };

  return (
    <div className="space-y-8">
      {/* ルールアイコン表示 */}
      {hasRules && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-500" />
            採用ルール
          </h3>
          
          {Object.entries(categorizedRules).map(([category, rules]) => (
            <div key={category} className="mb-6 last:mb-0">
              {category !== 'その他' && (
                <h4 className="font-semibold text-gray-700 mb-3">
                  {category}
                </h4>
              )}
              <div className="flex flex-wrap gap-2">
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium border border-blue-200"
                  >
                    {rule.display_name || rule.rule}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      )}

      {/* ルールテキスト詳細表示 */}
      {hasRuleTexts && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            ルール詳細
          </h3>

          <div className="space-y-6">
            {Object.entries(RULE_TEXT_CATEGORIES).map(([key, config]) => {
              const texts = categorizedRuleTexts[key as keyof typeof categorizedRuleTexts];
              if (!texts || texts.length === 0) return null;

              return (
                <div key={key} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-center gap-2 mb-4">
                    {getCategoryIcon(key)}
                    <h4 className="text-lg font-semibold text-gray-900">
                      {config.label}
                    </h4>
                  </div>
                  
                  <div className="space-y-4">
                    {texts.map((text) => (
                      <div
                        key={text.id}
                        className="bg-gray-50 rounded-lg p-4"
                      >
                        <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                          {text.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm text-yellow-800">
          ※ 詳細なルールや不明な点は、ご来店時にスタッフにお尋ねください。
        </p>
      </div>
    </div>
  );
}