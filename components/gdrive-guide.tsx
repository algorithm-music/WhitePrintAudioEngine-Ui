'use client';

import { useState } from 'react';
import { X, ExternalLink, CheckCircle2, Copy, Check } from 'lucide-react';

export default function GDriveGuide({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);

  const steps = [
    {
      num: '01',
      title: 'Google Driveにアップロード',
      desc: 'WAV / FLAC / AIFF / MP3 ファイルをGoogle Driveにアップロード',
      note: 'マスタリング品質のためWAV / FLACを推奨。最大200MB。',
    },
    {
      num: '02',
      title: '共有設定を変更',
      desc: 'ファイルを右クリック →「共有」→ 一般的なアクセス →「リンクを知っている全員」',
      note: 'ロールは「閲覧者」でOK。オーナーは「閲覧者と閲覧者(コメント可)にダウンロード…を表示する」をONのままにしてください。',
    },
    {
      num: '03',
      title: 'リンクをコピー',
      desc: '「リンクをコピー」ボタンをクリック',
      note: 'https://drive.google.com/file/d/xxxxx/view の形式',
    },
    {
      num: '04',
      title: 'WhitePrintに貼り付け',
      desc: 'コピーしたリンクをURL入力欄に貼り付けて「Master Now」',
      note: 'サーバー側が Google Drive API v3 (files.get?alt=media) で直接取得します。',
    },
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg mx-4 rounded-xl overflow-hidden"
        style={{ background: '#0a0a0c', border: '1px solid #1a1b1f' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid #1a1b1f' }}>
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 3L4 14h8l-1 7 9-11h-8l1-7z" />
            </svg>
            <span className="text-sm font-bold text-white">Google Drive Sharing Guide</span>
          </div>
          <button onClick={onClose} className="text-zinc-600 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="px-6 py-5 space-y-5">
          {steps.map((step) => (
            <div key={step.num} className="flex gap-4">
              <div className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-mono font-bold text-indigo-400" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.15)' }}>
                {step.num}
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                <p className="text-xs text-zinc-400 mt-0.5">{step.desc}</p>
                <p className="text-[10px] text-zinc-600 mt-1">{step.note}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Troubleshooting */}
        <div className="px-6 pb-5">
          <div className="rounded-lg p-4 space-y-2" style={{ background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.1)' }}>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-red-400/70">Troubleshooting</h4>
            <ul className="space-y-1.5 text-xs text-zinc-500">
              <li>• 「共有」設定が「制限付き」のままだとエラーになります</li>
              <li>• 100MB超のファイルはGoogleが表示するブラウザ用ウイルススキャン警告を回避するため、当サービスはDrive API経由で直接取得します</li>
              <li>• 所有者が「ダウンロード、印刷、コピーを無効化」している場合は取得できません (403)</li>
              <li>• ファイル名に特殊文字があっても問題ありません</li>
              <li>• リンク形式: <code className="text-zinc-400">drive.google.com/file/d/...</code></li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 flex items-center justify-between" style={{ borderTop: '1px solid #1a1b1f' }}>
          <a
            href="https://support.google.com/drive/answer/2494822"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-mono text-zinc-500 hover:text-indigo-400 transition-colors flex items-center gap-1"
          >
            Google公式ヘルプ <ExternalLink className="w-3 h-3" />
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white rounded-lg transition-colors"
            style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
