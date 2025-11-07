// src/components/shop/ShopInfoTab.tsx
import { Shop, GAME_FORMATS, USER_TYPES, DAY_TYPES } from '@/types/models';
import { 
  Users, DollarSign, FileText, Utensils, Sparkles,
  Clock, Calendar
} from 'lucide-react';

interface ShopInfoTabProps {
  shop: Shop;
}

export default function ShopInfoTab({ shop }: ShopInfoTabProps) {
  return (
    <div className="space-y-8">
      {/* 営業形態 */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          営業形態
        </h3>
        <div className="flex flex-wrap gap-3">
          {shop.has_three_player_free && (
            <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium">
              三麻フリー
            </div>
          )}
          {shop.has_four_player_free && (
            <div className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg font-medium">
              四麻フリー
            </div>
          )}
          {shop.has_set && (
            <div className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg font-medium">
              セット
            </div>
          )}
        </div>
      </section>

      {/* 卓数情報 */}
      <section>
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-green-500" />
          卓数
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-3xl font-bold text-gray-900 mb-1">{shop.table_count}</div>
            <div className="text-sm text-gray-600">総卓数</div>
          </div>
          {shop.score_table_count > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{shop.score_table_count}</div>
              <div className="text-sm text-gray-600">点数卓</div>
            </div>
          )}
          {shop.auto_table_count > 0 && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <div className="text-3xl font-bold text-gray-900 mb-1">{shop.auto_table_count}</div>
              <div className="text-sm text-gray-600">全自動卓</div>
            </div>
          )}
        </div>
      </section>

      {/* フリー料金 */}
      {shop.frees && shop.frees.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-yellow-500" />
            フリー料金
          </h3>
          <div className="space-y-4">
            {shop.frees.map((free) => (
              <div key={free.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    free.game_format === 'THREE_PLAYER' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {free.game_format_display}
                  </span>
                  {free.summary.min_price !== null && (
                    <span className="text-sm text-gray-600">
                      {free.summary.min_price.toLocaleString()}円〜
                    </span>
                  )}
                </div>
                
                {free.rates.filter(rate => rate.is_public).map((rate) => (
                  <div key={rate.id} className="mb-3 last:mb-0">
                    <div className="font-medium text-gray-900 mb-2">{rate.rate_label}</div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {rate.prices.map((price) => (
                        <div key={price.id} className="bg-gray-50 rounded p-3">
                          <div className="text-xs text-gray-600 mb-1">
                            {price.user_type_display}
                          </div>
                          <div className="text-lg font-bold text-gray-900">
                            {price.price.toLocaleString()}
                            <span className="text-xs text-gray-600 ml-1">円</span>
                          </div>
                          {price.details && (
                            <div className="text-xs text-gray-500 mt-1">{price.details}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* セット料金 */}
      {shop.set && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-orange-500" />
            セット料金
          </h3>
          <div className="space-y-4">
            {/* 基本料金 */}
            {shop.set.base_prices.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">基本料金</h4>
                <div className="grid gap-3">
                  {shop.set.base_prices.map((price) => (
                    <div key={price.id} className="flex items-center justify-between bg-gray-50 rounded p-3">
                      <div>
                        <span className="font-medium text-gray-900">
                          {price.user_type === 'GENERAL' ? '一般' : 
                           price.user_type === 'STUDENT' ? '学生' :
                           price.user_type === 'SENIOR' ? 'シニア' : '女性'}
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          ({price.day_type === 'WEEKDAY' ? '平日' :
                            price.day_type === 'WEEKEND' ? '土日' : '祝日'})
                        </span>
                        <span className="text-sm text-gray-600 ml-2">
                          {price.duration}分
                        </span>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {price.price.toLocaleString()}
                        <span className="text-sm text-gray-600 ml-1">円</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* パッケージ料金 */}
            {shop.set.packages.length > 0 && (
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">パッケージ料金</h4>
                <div className="space-y-3">
                  {shop.set.packages.map((pkg) => (
                    <div key={pkg.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <span className="font-medium text-gray-900">{pkg.name}</span>
                          <span className="text-sm text-gray-600 ml-2">
                            ({pkg.day_type_display})
                          </span>
                          {pkg.duration && (
                            <span className="text-sm text-gray-600 ml-2">
                              {pkg.duration}分
                            </span>
                          )}
                        </div>
                      </div>
                      {pkg.details && (
                        <div className="text-sm text-gray-600 mb-2">{pkg.details}</div>
                      )}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {pkg.prices.map((price) => (
                          <div key={price.id} className="bg-white rounded p-2 text-center">
                            <div className="text-xs text-gray-600">{price.user_type_display}</div>
                            <div className="text-base font-bold text-gray-900">
                              {price.price.toLocaleString()}円
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* メニュー */}
      {shop.menus && shop.menus.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-red-500" />
            メニュー
          </h3>
          <div className="space-y-4">
            {['FOOD', 'DRINK', 'ALCOHOL', 'OTHER'].map((category) => {
              const categoryMenus = shop.menus?.filter(
                (menu) => menu.category === category && menu.is_available
              );
              if (!categoryMenus || categoryMenus.length === 0) return null;

              return (
                <div key={category} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">
                    {category === 'FOOD' ? 'フード' :
                     category === 'DRINK' ? 'ドリンク' :
                     category === 'ALCOHOL' ? 'アルコール' : 'その他'}
                  </h4>
                  <div className="grid gap-2">
                    {categoryMenus.map((menu) => (
                      <div key={menu.id} className="flex items-start justify-between bg-gray-50 rounded p-3">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">{menu.item_name}</div>
                          {menu.description && (
                            <div className="text-sm text-gray-600 mt-1">{menu.description}</div>
                          )}
                        </div>
                        <div className="text-lg font-bold text-gray-900 ml-4">
                          {menu.price.toLocaleString()}
                          <span className="text-sm text-gray-600 ml-1">円</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 特徴 */}
      {shop.features && shop.features.length > 0 && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            店舗の特徴
          </h3>
          <div className="flex flex-wrap gap-2">
            {shop.features.map((feature) => (
              <div
                key={feature.id}
                className="px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-200"
              >
                {feature.feature}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 説明 */}
      {shop.description && (
        <section>
          <h3 className="text-xl font-bold text-gray-900 mb-4">店舗について</h3>
          <div className="bg-gray-50 rounded-lg p-6">
            <p className="text-gray-700 whitespace-pre-line">{shop.description}</p>
          </div>
        </section>
      )}
    </div>
  );
}