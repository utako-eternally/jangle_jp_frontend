// src/app/(legal)/privacy/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "プライバシーポリシー | Jangle",
  description: "Jangleのプライバシーポリシー",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        プライバシーポリシー
      </h1>

      <div className="prose prose-gray max-w-none space-y-8">
        <section>
          <p className="text-sm text-gray-600">
            制定日：2025年1月1日<br />
            最終改定日：2025年1月1日
          </p>
        </section>

        <section>
          <p className="text-gray-700 leading-relaxed">
            Config（以下「当事業者」といいます）は、当事業者が運営する麻雀店舗情報掲載サービス「Jangle」（以下「本サービス」といいます）における個人情報の取り扱いについて、以下のとおりプライバシーポリシー（以下「本ポリシー」といいます）を定めます。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            1. 個人情報の定義
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本ポリシーにおいて「個人情報」とは、個人情報保護法第2条第1項に定義される、生存する個人に関する情報であって、当該情報に含まれる氏名、メールアドレス、電話番号その他の記述等により特定の個人を識別できるもの（他の情報と容易に照合することができ、それにより特定の個人を識別することができることとなるものを含む）をいいます。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            2. 取得する情報
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当事業者は、本サービスの提供にあたり、以下の情報を取得します。
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            2.1 店舗オーナー様から取得する情報
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>メールアドレス</li>
            <li>氏名（任意）</li>
            <li>電話番号</li>
            <li>店舗情報（店舗名、住所、営業時間、店舗説明等）</li>
            <li>店舗画像</li>
            <li>料金情報</li>
            <li>その他、本サービスの利用にあたり登録いただく情報</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">
            2.2 自動的に取得する情報
          </h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>IPアドレス</li>
            <li>アクセス日時</li>
            <li>閲覧ページ</li>
            <li>利用環境（ブラウザ、OS等）</li>
            <li>Cookie情報</li>
            <li>リファラ情報</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            3. 利用目的
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当事業者は、取得した個人情報を以下の目的で利用します。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>本サービスの提供・運営のため</li>
            <li>ユーザー認証のため</li>
            <li>店舗情報の掲載・管理のため</li>
            <li>お問い合わせ対応のため</li>
            <li>利用料金の請求・決済処理のため</li>
            <li>本サービスの改善・新機能開発のため</li>
            <li>利用規約違反への対応のため</li>
            <li>重要なお知らせ・メンテナンス情報の通知のため</li>
            <li>統計データの作成のため（個人を識別できない形式に加工します）</li>
            <li>その他、上記利用目的に付随する目的のため</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            4. 第三者提供
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            当事業者は、以下の場合を除き、ユーザーの同意なく個人情報を第三者に提供することはありません。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>法令に基づく場合</li>
            <li>人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難である場合</li>
            <li>国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがある場合</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            5. 外部サービスの利用
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本サービスでは、以下の外部サービスを利用しています。これらのサービスにおける個人情報の取り扱いについては、各社のプライバシーポリシーをご確認ください。
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>Google Maps API（地図表示・位置情報取得）</li>
            <li>Amazon Web Services（データ保存・サーバー運用）</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            6. Cookieの使用
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本サービスでは、ユーザーの利便性向上およびサービス改善のため、Cookieを使用しています。Cookieとは、Webサイトがユーザーのコンピュータに保存する小さなテキストファイルです。
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            Cookieの使用目的：
          </p>
          <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
            <li>ログイン状態の維持</li>
            <li>ユーザー設定の保存</li>
            <li>アクセス解析</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            ブラウザの設定でCookieを無効にすることも可能ですが、その場合、本サービスの一部機能が利用できなくなる可能性があります。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            7. 個人情報の管理
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当事業者は、個人情報の紛失、破壊、改ざん、不正アクセス、漏洩等を防止するため、適切なセキュリティ対策を講じています。個人情報は、アクセス権限を持つ者のみが取り扱い、適切に管理しています。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            8. 個人情報の開示・訂正・削除
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ユーザーは、当事業者が保有する自己の個人情報について、開示、訂正、削除を求めることができます。お問い合わせ窓口までご連絡ください。ただし、法令により開示等が制限される場合があります。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            9. プライバシーポリシーの変更
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当事業者は、法令の変更や本サービスの機能追加等に伴い、本ポリシーを変更することがあります。変更後のプライバシーポリシーは、本ページに掲載した時点で効力を生じるものとします。重要な変更がある場合は、本サービス上で通知します。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            10. お問い合わせ窓口
          </h2>
          <p className="text-gray-700 leading-relaxed mb-2">
            本ポリシーに関するお問い合わせは、以下までご連絡ください。
          </p>
          <div className="bg-gray-50 rounded-lg p-4 mt-4">
            <p className="text-gray-700">
              事業者名：Config<br />
              メールアドレス：[メールアドレスを記載]
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}