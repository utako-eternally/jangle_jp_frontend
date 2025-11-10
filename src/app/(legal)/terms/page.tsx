// src/app/(legal)/terms/page.tsx
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "利用規約 | Jangle",
  description: "Jangleの利用規約",
};

export default function TermsPage() {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        利用規約
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
            この利用規約（以下「本規約」といいます）は、Config（以下「当事業者」といいます）が運営する麻雀店舗情報掲載サービス「Jangle」（以下「本サービス」といいます）の利用条件を定めるものです。本サービスを利用される方（以下「ユーザー」といいます）は、本規約に同意したものとみなされます。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第1条（適用）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>本規約は、本サービスの利用に関する当事業者とユーザーとの間の権利義務関係を定めることを目的とし、ユーザーと当事業者との間の本サービスの利用に関わる一切の関係に適用されます。</li>
            <li>当事業者が本サービス上で掲載する本サービス利用に関するルール等は、本規約の一部を構成するものとします。</li>
            <li>本規約の内容と、前項のルール等の内容が異なる場合は、前項のルール等が優先して適用されるものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第2条（定義）
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            本規約において使用する用語の定義は、以下のとおりとします。
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>「店舗オーナー」とは、本サービスに店舗情報を掲載する麻雀店舗の運営者をいいます。</li>
            <li>「一般ユーザー」とは、本サービスを閲覧・利用する方をいいます。</li>
            <li>「登録情報」とは、店舗オーナーが本サービスに登録した店舗情報、画像、その他一切の情報をいいます。</li>
            <li>「知的財産権」とは、著作権、特許権、実用新案権、商標権、意匠権その他の知的財産権（それらの権利を取得し、またはそれらの権利につき登録等を出願する権利を含みます）をいいます。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第3条（アカウント登録）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>店舗オーナーは、本規約に同意の上、当事業者所定の方法により登録を申請するものとします。</li>
            <li>当事業者は、登録申請者が以下の各号のいずれかに該当すると判断した場合、登録を承認しないことがあります。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本規約に違反したことがある者からの申請である場合</li>
                <li>登録情報に虚偽、誤記または記載漏れがあった場合</li>
                <li>反社会的勢力等（暴力団、暴力団員、暴力団準構成員、総会屋、その他これらに準ずる者を含みます）である、または資金提供その他を通じて反社会的勢力等の維持、運営もしくは経営に協力もしくは関与する等、反社会的勢力等との何らかの交流もしくは関与を行っている場合</li>
                <li>過去に本サービスの利用を停止または削除されたことがある場合</li>
                <li>その他、当事業者が登録を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>店舗オーナーは、登録情報に変更があった場合、速やかに変更手続きを行うものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第4条（アカウント管理）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>店舗オーナーは、自己の責任において、アカウントのID・パスワードを適切に管理するものとします。</li>
            <li>店舗オーナーは、いかなる場合にも、ID・パスワードを第三者に譲渡または貸与することはできません。</li>
            <li>ID・パスワードの管理不十分、使用上の過誤、第三者の使用等によって生じた損害に関する責任は、店舗オーナーが負うものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第5条（店舗情報の掲載）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>店舗オーナーは、本サービスに登録した店舗情報が、本サービスの公開ページに掲載されることに同意するものとします。</li>
            <li>当事業者は、登録された店舗情報について審査を行い、掲載の可否を判断します。審査には通常1〜3営業日を要します。</li>
            <li>当事業者は、以下の各号に該当する店舗情報については、掲載を承認しない、または掲載後に非公開とすることがあります。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>虚偽の情報が含まれている場合</li>
                <li>公序良俗に反する内容が含まれている場合</li>
                <li>第三者の権利を侵害する内容が含まれている場合</li>
                <li>法令に違反する内容が含まれている場合</li>
                <li>店舗の実態と著しく異なる情報が含まれている場合</li>
                <li>その他、当事業者が不適切と判断した場合</li>
              </ul>
            </li>
            <li>店舗オーナーは、店舗情報に変更が生じた場合、速やかに更新手続きを行うものとします。</li>
            <li>店舗名、電話番号、住所等の重要な情報を変更した場合、当事業者による再審査が行われ、審査完了まで一時的に非公開となることがあります。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第6条（有料プラン）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>本サービスには、無料で利用できるフリープランと、月額6,800円（税込）の有料プランがあります。</li>
            <li>有料プランの内容、料金、決済方法等の詳細は、本サービス内の料金ページに記載するものとします。</li>
            <li>有料プランは月単位の自動更新となり、店舗オーナーが解約手続きを行わない限り、自動的に継続されます。</li>
            <li>月の途中で有料プランを解約した場合でも、日割り計算による返金は行いません。解約後も当該月末まで有料プラン機能を利用できます。</li>
            <li>当事業者は、有料プランの料金を変更することがあります。料金変更の1ヶ月前までに本サービス上で告知するものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第7条（禁止事項）
          </h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            ユーザーは、本サービスの利用にあたり、以下の各号に該当する行為または該当すると当事業者が判断する行為をしてはなりません。
          </p>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>法令または公序良俗に違反する行為</li>
            <li>犯罪行為に関連する行為</li>
            <li>当事業者、本サービスの他のユーザー、または第三者の知的財産権、肖像権、プライバシー、名誉その他の権利または利益を侵害する行為</li>
            <li>虚偽の情報を登録する行為</li>
            <li>他の店舗オーナーまたは店舗を誹謗中傷する行為</li>
            <li>同一店舗について複数のアカウントを作成する行為</li>
            <li>他のユーザーのID・パスワードを不正に使用する行為</li>
            <li>本サービスの運営を妨害するおそれのある行為</li>
            <li>本サービスのネットワークまたはシステム等に過度な負荷をかける行為</li>
            <li>本サービスの不具合を意図的に利用する行為</li>
            <li>本サービスに接続されたサーバー等に不正にアクセスする行為</li>
            <li>リバースエンジニアリング、逆アセンブル等の方法により本サービスのソースコードを解析する行為</li>
            <li>本サービスの運営を妨害する目的でクローリング、スクレイピングを行う行為</li>
            <li>反社会的勢力等への利益供与行為</li>
            <li>その他、当事業者が不適切と判断する行為</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第8条（本サービスの停止等）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>当事業者は、以下のいずれかに該当する場合には、ユーザーに事前に通知することなく、本サービスの全部または一部の提供を停止または中断することができるものとします。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本サービスに係るコンピューター・システムの点検または保守作業を緊急に行う場合</li>
                <li>コンピューター、通信回線等の障害、誤操作、過度なアクセスの集中、不正アクセス、ハッキング等により本サービスの運営ができなくなった場合</li>
                <li>地震、落雷、火災、風水害、停電、天災地変などの不可抗力により本サービスの運営ができなくなった場合</li>
                <li>その他、当事業者が停止または中断を必要と判断した場合</li>
              </ul>
            </li>
            <li>当事業者は、本条に基づき当事業者が行った措置によってユーザーに生じた損害について一切の責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第9条（権利帰属）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>本サービスに関する知的財産権は、全て当事業者または当事業者にライセンスを許諾している者に帰属しており、本規約に基づく本サービスの利用許諾は、本サービスに関する知的財産権の使用許諾を意味するものではありません。</li>
            <li>店舗オーナーは、登録情報について、当事業者に対し、世界的、非独占的、無償、サブライセンス可能かつ譲渡可能な使用権を許諾するものとします。</li>
            <li>店舗オーナーは、当事業者および当事業者から権利を承継しまたは許諾された者に対して著作者人格権を行使しないことに同意するものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第10条（登録抹消等）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>当事業者は、ユーザーが以下の各号のいずれかの事由に該当する場合は、事前に通知または催告することなく、登録情報の削除、アカウントの利用停止または登録の抹消をすることができます。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本規約のいずれかの条項に違反した場合</li>
                <li>登録情報に虚偽の事実があることが判明した場合</li>
                <li>支払停止もしくは支払不能となり、または破産手続開始、民事再生手続開始等の申立があった場合</li>
                <li>6ヶ月以上本サービスの利用がない場合</li>
                <li>当事業者からの問い合わせその他の回答を求める連絡に対して30日間以上応答がない場合</li>
                <li>その他、当事業者が本サービスの利用を適当でないと判断した場合</li>
              </ul>
            </li>
            <li>前項各号のいずれかの事由に該当した場合、ユーザーは、当事業者に対して負っている債務の一切について当然に期限の利益を失い、直ちに当事業者に対して全ての債務の支払を行わなければなりません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第11条（退会）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>店舗オーナーは、当事業者所定の方法により、いつでも本サービスから退会することができます。</li>
            <li>退会後も、支払済みの利用料金の返金は行いません。</li>
            <li>退会後も、本規約の規定のうち、その性質上退会後も効力を有するものは、引き続き有効に存続するものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第12条（保証の否認および免責）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>当事業者は、本サービスが完全かつ正確であること、エラーやバグが存在しないこと、セキュリティ上の欠陥が存在しないこと等について、いかなる保証も行いません。</li>
            <li>当事業者は、本サービスに起因してユーザーに生じたあらゆる損害について一切の責任を負いません。ただし、本サービスに関する当事業者とユーザーとの間の契約が消費者契約法に定める消費者契約となる場合、この免責規定は適用されません。</li>
            <li>前項ただし書に定める場合であっても、当事業者は、当事業者の過失による債務不履行または不法行為によりユーザーに生じた損害のうち特別な事情から生じた損害（当事業者またはユーザーが損害発生につき予見し、または予見し得た場合を含みます）について一切の責任を負いません。</li>
            <li>当事業者は、本サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第13条（サービス内容の変更等）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            当事業者は、ユーザーに通知することなく、本サービスの内容を変更し、または本サービスの提供を中止、終了することができるものとします。これによってユーザーに生じた損害について、当事業者は一切の責任を負いません。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第14条（利用規約の変更）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>当事業者は、以下の場合には、ユーザーの個別の同意を要せず、本規約を変更することができるものとします。
              <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                <li>本規約の変更がユーザーの一般の利益に適合するとき</li>
                <li>本規約の変更が契約をした目的に反せず、かつ、変更の必要性、変更後の内容の相当性その他の変更に係る事情に照らして合理的なものであるとき</li>
              </ul>
            </li>
            <li>当事業者は本規約を変更する場合、変更後の本規約の効力発生日の1ヶ月前までに、本規約を変更する旨および変更後の本規約の内容とその効力発生日を本サービス上に表示するものとします。</li>
            <li>変更後の本規約の効力発生日以降に、ユーザーが本サービスを利用した場合には、本規約の変更に同意したものとみなします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第15条（連絡・通知）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>本サービスに関する問い合わせその他ユーザーから当事業者に対する連絡または通知は、当事業者の定める方法で行うものとします。</li>
            <li>当事業者がユーザーに対して行う連絡または通知は、登録されたメールアドレスへの送信、または本サービス上での表示により行うものとします。</li>
          </ol>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第16条（分離可能性）
          </h2>
          <p className="text-gray-700 leading-relaxed">
            本規約のいずれかの条項またはその一部が無効または執行不能と判断された場合であっても、本規約の残りの規定は、継続して完全に効力を有するものとします。
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
            第17条（準拠法・裁判管轄）
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
            <li>本規約の解釈にあたっては、日本法を準拠法とします。</li>
            <li>本サービスに関して紛争が生じた場合には、当事業者の所在地を管轄する裁判所を専属的合意管轄裁判所とします。</li>
          </ol>
        </section>

        <section className="mt-12 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            以上
          </p>
        </section>
      </div>
    </div>
  );
}