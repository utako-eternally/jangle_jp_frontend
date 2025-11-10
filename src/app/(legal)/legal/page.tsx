// src/app/(legal)/legal/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "特定商取引法に基づく表記 | Jangle",
  description: "Jangleの特定商取引法に基づく表記",
};

export default function LegalNoticePage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        特定商取引法に基づく表記
      </h1>

      <div className="space-y-6">
        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            販売事業者名
          </h2>
          <p className="text-gray-700">
            Config
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            運営統括責任者
          </h2>
          <p className="text-gray-700">
            [代表者名を記載]
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            所在地
          </h2>
          <p className="text-gray-700">
            [所在地を記載]<br />
            （お問い合わせは下記メールアドレスまでお願いいたします）
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            お問い合わせ先
          </h2>
          <p className="text-gray-700">
            メールアドレス：[メールアドレスを記載]<br />
            ※お電話でのお問い合わせは受け付けておりません
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            販売価格
          </h2>
          <div className="text-gray-700 space-y-3">
            <div>
              <p className="font-medium">フリープラン</p>
              <p className="ml-4">無料</p>
            </div>
            <div>
              <p className="font-medium">有料プラン</p>
              <p className="ml-4">月額 6,800円（税込）</p>
            </div>
            <p className="text-sm text-gray-600 mt-2">
              ※表示価格は全て税込価格です
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            商品代金以外の必要料金
          </h2>
          <p className="text-gray-700">
            インターネット接続料金、通信料金等はお客様のご負担となります。
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            支払方法
          </h2>
          <p className="text-gray-700">
            クレジットカード決済<br />
            （対応カード：VISA、Mastercard、JCB、American Express、Diners Club）
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            支払時期
          </h2>
          <div className="text-gray-700 space-y-2">
            <p>
              ・初回：有料プラン申込時に即時決済
            </p>
            <p>
              ・2回目以降：毎月の契約更新日に自動決済
            </p>
            <p className="text-sm text-gray-600 mt-2">
              ※月の途中で契約した場合、翌月の同日が更新日となります
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            サービス提供時期
          </h2>
          <p className="text-gray-700">
            決済完了後、即時サービスをご利用いただけます。
          </p>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            返品・キャンセル・中途解約
          </h2>
          <div className="text-gray-700 space-y-3">
            <div>
              <p className="font-medium">返品について</p>
              <p className="ml-4">
                本サービスはデジタルコンテンツのため、商品の性質上、決済完了後の返品・返金には応じかねます。
              </p>
            </div>
            <div>
              <p className="font-medium">解約について</p>
              <p className="ml-4 space-y-1">
                有料プランはいつでも解約可能です。ただし、以下の点にご注意ください。<br />
                ・月の途中で解約した場合でも、日割り計算による返金は行いません<br />
                ・解約後も当該月末まで有料プラン機能をご利用いただけます<br />
                ・次回更新日の前日までに解約手続きを完了すると、翌月以降の課金が停止されます
              </p>
            </div>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            動作環境
          </h2>
          <div className="text-gray-700 space-y-2">
            <p className="font-medium">推奨ブラウザ</p>
            <ul className="ml-4 space-y-1 list-disc list-inside">
              <li>Google Chrome（最新版）</li>
              <li>Safari（最新版）</li>
              <li>Microsoft Edge（最新版）</li>
              <li>Firefox（最新版）</li>
            </ul>
            <p className="text-sm text-gray-600 mt-2">
              ※上記以外のブラウザでは正常に動作しない場合があります
            </p>
          </div>
        </div>

        <div className="border-b border-gray-200 pb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            継続課金について
          </h2>
          <div className="text-gray-700 space-y-2">
            <p>
              有料プランは月単位の自動更新サービスです。解約手続きを行わない限り、毎月自動的に契約が更新され、クレジットカードに課金されます。
            </p>
            <p className="font-medium mt-3">
              自動更新を停止する方法
            </p>
            <p className="ml-4">
              マイページの「プラン管理」から「解約する」ボタンをクリックし、画面の指示に従って解約手続きを完了してください。
            </p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            免責事項
          </h2>
          <p className="text-gray-700">
            本サービスの利用により生じた損害について、当事業者は一切の責任を負いません。詳細は利用規約をご確認ください。
          </p>
        </div>

        <div className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            制定日：2025年1月1日<br />
            最終改定日：2025年1月1日
          </p>
        </div>
      </div>
    </div>
  );
}