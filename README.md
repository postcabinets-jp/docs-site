# docs-site

GitBook の代替として使えるセルフホスト型ドキュメントプラットフォーム。$65/月のカスタムドメイン課金や $12/ユーザー課金なしで、チームのドキュメントを管理・公開できます。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fpostcabinets-jp%2Fdocs-site&env=NEXT_PUBLIC_SUPABASE_URL,NEXT_PUBLIC_SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,NEXT_PUBLIC_SITE_URL&envDescription=Supabase+project+credentials&project-name=docs-site&repository-name=docs-site)

## 機能

- **ブロックエディタ** — スラッシュコマンドで見出し・コードブロック・コールアウトを挿入
- **GitHub 双方向同期** — リポジトリの Markdown と双方向同期、変更は PR として送信
- **カスタムドメイン無料** — セルフホストなので追加コストゼロ
- **リアルタイム協調編集** — Yjs ベースの CRDT でコンフリクトなし
- **セマンティック検索** — BYOK（自分の OpenAI キー）でベクトル検索、未設定時は全文検索へフォールバック
- **プライバシーファースト分析** — クッキーなし・IP 非保存で GDPR 準拠
- **チームメンバー管理** — Organization/Editor/Viewer ロールとスペース単位のアクセス制御
- **ページ評価** — 各ページに👍👎フィードバック、集計ダッシュボードで改善優先度を可視化
- **リダイレクト管理** — GUI で 301/302 リダイレクト設定、ドキュメント再構成時の SEO を維持

## Quick Start

### 1. Supabase プロジェクトを作成

[supabase.com](https://supabase.com) で新規プロジェクトを作成し、マイグレーションを適用します：

```bash
# Supabase CLI でローカル環境を起動
supabase start

# マイグレーション適用
supabase db push

# サンプルデータ投入（オプション）
supabase db seed
```

### 2. 環境変数を設定

```bash
cp .env.example .env.local
```

`.env.local` に Supabase の認証情報を設定：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. 開発サーバーを起動

```bash
npm install
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

### Vercel への 1 クリックデプロイ

上の「Deploy with Vercel」ボタンをクリックし、Supabase の認証情報を入力するだけで完了です。

## Tech Stack

| レイヤー | 技術 |
|---|---|
| フレームワーク | Next.js 15 (App Router, TypeScript strict) |
| データベース・認証 | Supabase (PostgreSQL + RLS + Auth) |
| スタイリング | Tailwind CSS v4 + shadcn/ui |
| デプロイ | Vercel |

## データベース構成

- **organizations** — 組織（テナント）
- **organization_members** — メンバーとロール（owner/editor/viewer）
- **sites** — 公開ドキュメントサイト（カスタムドメイン対応）
- **spaces** — サイト内のコンテンツグループ（GitHub 同期設定）
- **pages** — ページ（ツリー構造、parent_id で入れ子）
- **page_versions** — ページコンテンツのバージョン管理
- **site_analytics** — プライバシーファーストな PV 計測
- **page_ratings** — 👍👎 フィードバック

すべてのテーブルに Row Level Security (RLS) が設定されています。

## License

MIT

---

Built by [POST CABINETS](https://postcabinets.co.jp)
