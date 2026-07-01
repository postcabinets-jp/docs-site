import Link from 'next/link'
import { BookOpen, GitBranch, Globe, Search, Users, BarChart2, Lock, Zap } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'ブロックエディタ',
    desc: 'GitBook 同様のスラッシュコマンド式エディタ。コードブロック・コールアウト・テーブルを直感的に挿入。',
  },
  {
    icon: GitBranch,
    title: 'GitHub 双方向同期',
    desc: 'リポジトリの Markdown を自動取り込み。エディタの変更は PR として送信。',
  },
  {
    icon: Search,
    title: 'セマンティック検索',
    desc: '自分の OpenAI キーを持ち込んで（BYOK）ベクトル検索を有効化。キー未設定時は全文検索へ自動フォールバック。',
  },
  {
    icon: Globe,
    title: 'カスタムドメイン無料',
    desc: 'セルフホストなので追加コストゼロ。GitBook の $65/月 課金は不要。',
  },
  {
    icon: Users,
    title: 'チーム協調編集',
    desc: 'Yjs ベースの CRDT でリアルタイム共同編集。「sync issues」は過去のものへ。',
  },
  {
    icon: BarChart2,
    title: 'プライバシーファースト分析',
    desc: 'クッキーなし・IP 非保存の分析。GDPR 準拠で同意バナー不要。',
  },
  {
    icon: Lock,
    title: 'Row Level Security',
    desc: 'Supabase RLS でデータアクセスをテーブル単位で制御。クロスユーザー漏洩をデータベース層で完全遮断。',
  },
  {
    icon: Zap,
    title: 'Vercel ワンクリック',
    desc: '下のボタン1つで自分のアカウントにデプロイ完了。環境変数の設定だけで即日稼働。',
  },
]

const comparisons = [
  { feature: 'カスタムドメイン', gitbook: '$65/月〜', ours: '無料（自前ホスト）' },
  { feature: 'ユーザー数制限', gitbook: '$12/ユーザー/月', ours: '無制限' },
  { feature: 'サイト数', gitbook: 'プランごと上限あり', ours: '無制限' },
  { feature: 'AI 検索', gitbook: '$249/月〜', ours: 'BYOK（自分の API キー）' },
  { feature: 'ソースコード', gitbook: 'クローズド', ours: 'MIT ライセンス' },
  { feature: 'セルフホスト', gitbook: '不可', ours: '可（Vercel / VPS 等）' },
]

export default function LandingPage() {
  return (
    <div className="bg-white text-gray-900">
      {/* Nav */}
      <header className="border-b border-gray-100 sticky top-0 z-50 bg-white/95 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight">docs-site</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">機能</a>
            <a href="#pricing" className="hover:text-gray-900 transition-colors">比較</a>
            <a href="https://github.com/postcabinets-jp/docs-site" className="hover:text-gray-900 transition-colors" target="_blank" rel="noopener noreferrer">GitHub</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900 transition-colors">
              ログイン
            </Link>
            <Link
              href="/register"
              className="text-sm bg-slate-900 text-white px-4 py-2 rounded-md hover:bg-slate-700 transition-colors font-medium"
            >
              無料で始める
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-600 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
          MIT ライセンス · Supabase · Next.js 15
        </div>

        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 leading-tight">
          GitBook の代替を
          <br />
          <span className="text-slate-600">自前でホスト</span>
        </h1>

        <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          $65/月のカスタムドメイン課金、$12/ユーザー課金から解放される。
          ブロックエディタ・GitHub 同期・AI 検索をオープンソースで。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-slate-900 text-white px-8 py-3.5 rounded-lg font-medium hover:bg-slate-700 transition-colors text-base"
          >
            無料でアカウント作成
          </Link>
          <a
            href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fdocs-site&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SITE_URL&envDescription=Supabase+project+credentials&envLink=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fdocs-site%23setup&project-name=docs-site&repository-name=docs-site"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 px-8 py-3.5 rounded-lg font-medium hover:bg-gray-50 transition-colors text-base text-gray-700"
          >
            <svg viewBox="0 0 76 65" fill="currentColor" className="w-4 h-4">
              <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
            </svg>
            Vercel にデプロイ
          </a>
        </div>

        <p className="text-xs text-gray-400 mt-4">
          クレジットカード不要 · セルフホストなら完全無料
        </p>
      </section>

      {/* Code preview */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
          {/* Browser chrome */}
          <div className="bg-gray-100 px-4 py-3 flex items-center gap-2 border-b border-gray-200">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
            <div className="flex-1 mx-4">
              <div className="bg-white rounded-md px-3 py-1 text-xs text-gray-400 text-center">
                docs.yourcompany.com
              </div>
            </div>
          </div>

          {/* Fake UI */}
          <div className="flex bg-white" style={{ height: '360px' }}>
            {/* Sidebar */}
            <div className="w-56 border-r border-gray-100 p-4 flex flex-col gap-1 bg-gray-50/50 flex-shrink-0">
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Getting Started</div>
              <div className="flex items-center gap-2 px-2 py-1.5 bg-slate-900 rounded text-white text-xs font-medium">
                <div className="w-3 h-3 rounded-sm bg-white/20 flex-shrink-0" />
                Overview
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600">
                <div className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0" />
                Authentication
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600">
                <div className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0" />
                Error Handling
              </div>
              <div className="mt-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Payments</div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600">
                <div className="w-3 h-3 rounded-sm bg-gray-200 flex-shrink-0" />
                Accept a Payment
              </div>
              <div className="flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 ml-3">
                <div className="w-2.5 h-2.5 rounded-sm bg-gray-200 flex-shrink-0" />
                Payment Methods
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-8 overflow-hidden">
              <div className="max-w-2xl">
                <div className="text-2xl font-bold text-gray-900 mb-4">Overview</div>
                <div className="space-y-3">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-5/6" />
                  <div className="h-3 bg-gray-100 rounded w-4/6" />
                </div>
                <div className="mt-6 bg-slate-900 rounded-lg p-4">
                  <div className="text-xs text-slate-400 mb-2">bash</div>
                  <div className="text-xs font-mono text-green-400">
                    curl https://api.example.com/v1/users \<br />
                    &nbsp;&nbsp;-H &quot;Authorization: Bearer sk_live_...&quot;
                  </div>
                </div>
                <div className="mt-6 p-3 bg-blue-50 border-l-4 border-blue-400 rounded-r-lg">
                  <div className="text-xs text-blue-700">本番環境への移行前にテストモードで確認してください。</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">GitBook ができることはすべて、コストゼロで</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              OSS だから審査なし、価格改定なし、ベンダーロックインなし。
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => (
              <div key={f.title} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-slate-700" />
                </div>
                <div className="font-semibold text-gray-900 mb-2 text-sm">{f.title}</div>
                <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section id="pricing" className="py-20 max-w-4xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">GitBook との比較</h2>
          <p className="text-gray-500">2025年価格改定後の GitBook Premium との対比</p>
        </div>

        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-4 font-medium text-gray-600">機能</th>
                <th className="text-center px-6 py-4 font-medium text-gray-500">GitBook Premium</th>
                <th className="text-center px-6 py-4 font-medium text-slate-900">docs-site（OSS）</th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr key={row.feature} className={i < comparisons.length - 1 ? 'border-b border-gray-100' : ''}>
                  <td className="px-6 py-4 font-medium text-gray-800">{row.feature}</td>
                  <td className="px-6 py-4 text-center text-gray-500">{row.gitbook}</td>
                  <td className="px-6 py-4 text-center font-medium text-emerald-700">{row.ours}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Deploy CTA */}
      <section className="bg-slate-900 py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">今すぐデプロイ</h2>
          <p className="text-slate-400 mb-10 leading-relaxed">
            Supabase プロジェクトを用意して、下のボタンを押すだけ。
            5分でドキュメントサイトが立ち上がります。
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fdocs-site&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SITE_URL&envDescription=Supabase+project+credentials&project-name=docs-site&repository-name=docs-site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-3.5 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
            >
              <svg viewBox="0 0 76 65" fill="currentColor" className="w-4 h-4">
                <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
              </svg>
              Deploy with Vercel
            </a>
            <a
              href="https://github.com/postcabinets-jp/docs-site"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border border-slate-600 text-slate-300 px-8 py-3.5 rounded-lg font-medium hover:bg-slate-800 transition-colors text-sm"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub で見る
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-slate-900 rounded flex items-center justify-center">
              <BookOpen className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-700">docs-site</span>
            <span className="text-gray-300">·</span>
            <span className="text-sm text-gray-500">MIT License</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <a href="https://github.com/postcabinets-jp/docs-site" className="hover:text-gray-700 transition-colors" target="_blank" rel="noopener noreferrer">
              GitHub
            </a>
            <span>Built by <a href="https://postcabinets.co.jp" className="hover:text-gray-700 transition-colors" target="_blank" rel="noopener noreferrer">POST CABINETS</a></span>
          </div>
        </div>
      </footer>
    </div>
  )
}
