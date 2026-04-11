import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Specified Commercial Transactions Act',
  description:
    'Disclosure required under the Japanese Specified Commercial Transactions Act (特定商取引法に基づく表記) for WhitePrint AudioEngine.',
  alternates: { canonical: '/legal/tokushoho' },
};

export default function TokushohoPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-24">
        <h1 className="text-3xl font-bold text-white">特定商取引法に基づく表記</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Disclosure under the Specified Commercial Transactions Act
        </p>
        <p className="mt-1 text-xs text-zinc-600">Last updated: April 11, 2026</p>

        <div className="mt-12 overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <tbody>
              {[
                {
                  label: '販売事業者',
                  labelEn: 'Seller',
                  value: 'WhitePrint（個人事業主）',
                  note: '※法人化予定。登記完了後更新。',
                },
                {
                  label: '代表者',
                  labelEn: 'Representative',
                  value: '石井（請求があった場合に遅滞なく開示）',
                  note: null,
                },
                {
                  label: '所在地',
                  labelEn: 'Address',
                  value: '請求があった場合に遅滞なく開示いたします。',
                  note: null,
                },
                {
                  label: '電話番号',
                  labelEn: 'Phone',
                  value: '請求があった場合に遅滞なく開示いたします。',
                  note: null,
                },
                {
                  label: 'メールアドレス',
                  labelEn: 'Email',
                  value: 'support@whiteprint.audio',
                  note: null,
                },
                {
                  label: 'URL',
                  labelEn: 'URL',
                  value: 'https://whiteprint.audio',
                  note: null,
                },
                {
                  label: '販売価格',
                  labelEn: 'Pricing',
                  value: (
                    <>
                      Free: $0/month (3 WAV masters)
                      <br />
                      Standard: $67/month ($54/mo annual)
                      <br />
                      Pro: $1,365/month ($1,092/mo annual)
                      <br />
                      API: $2,745/month ($2,196/mo annual)
                      <br />
                      White Label: $6,883/month ($5,506/mo annual)
                      <br />
                      <span className="text-zinc-500">※ 表示価格は全て税込です。</span>
                    </>
                  ),
                  note: null,
                },
                {
                  label: '販売価格以外の必要料金',
                  labelEn: 'Additional fees',
                  value: 'インターネット接続料金、通信料金等はお客様のご負担となります。API プランの超過分は 1コールあたり $0.07 の従量課金が発生します。',
                  note: null,
                },
                {
                  label: '支払方法',
                  labelEn: 'Payment methods',
                  value: 'クレジットカード（Visa, Mastercard, American Express, JCB）、デビットカード ※ Stripe を通じた決済',
                  note: null,
                },
                {
                  label: '支払時期',
                  labelEn: 'Payment timing',
                  value: '月額プラン：毎月の契約更新日に自動課金。年額プラン：契約開始時に一括前払い。',
                  note: null,
                },
                {
                  label: '商品の引渡し時期',
                  labelEn: 'Service delivery',
                  value: 'お申込み完了後、直ちにサービスをご利用いただけます。マスタリング結果は処理完了後（通常1〜5分）即時ダウンロード可能です。',
                  note: null,
                },
                {
                  label: '返品・キャンセル',
                  labelEn: 'Cancellation / Refund',
                  value: (
                    <>
                      サブスクリプションはいつでもキャンセル可能です。キャンセル後も契約期間終了まではサービスをご利用いただけます。
                      <br />
                      年額プランの途中解約の場合、残り期間分を日割りで返金いたします。
                      <br />
                      デジタルコンテンツの性質上、マスタリング済みの音声ファイルのダウンロード後の返金はいたしかねます。
                      <br />
                      14日間の無料トライアル期間中のキャンセルは、一切の費用が発生しません。
                    </>
                  ),
                  note: null,
                },
                {
                  label: '動作環境',
                  labelEn: 'System requirements',
                  value: 'モダンブラウザ（Chrome, Firefox, Safari, Edge の最新版）。インターネット接続が必要です。API 利用には HTTPS 対応の環境が必要です。',
                  note: null,
                },
                {
                  label: '特別条件',
                  labelEn: 'Special conditions',
                  value: '無料プランは月3回のマスタリングに制限されます。有料プランは 14日間の無料トライアルが付帯します（クレジットカード登録不要）。利用規約に違反した場合、事前通知なくサービスを停止する場合があります。',
                  note: null,
                },
              ].map((row) => (
                <tr key={row.label} className="border-b border-zinc-800/50">
                  <td className="py-4 pr-6 align-top w-48 flex-shrink-0">
                    <div className="font-semibold text-zinc-200">{row.label}</div>
                    <div className="text-xs text-zinc-600">{row.labelEn}</div>
                  </td>
                  <td className="py-4 text-zinc-400 leading-relaxed">
                    {row.value}
                    {row.note && (
                      <div className="mt-1 text-xs text-zinc-600">{row.note}</div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-12 p-6 rounded-xl border border-zinc-800 bg-zinc-950">
          <h2 className="text-sm font-bold text-zinc-300 mb-3">お問い合わせ</h2>
          <p className="text-sm text-zinc-400">
            本表記に関するお問い合わせは、下記までご連絡ください。
          </p>
          <p className="mt-2 text-sm text-indigo-400">support@whiteprint.audio</p>
        </div>
      </div>
    </div>
  );
}
