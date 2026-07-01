-- ============================================================
-- docs-site Seed Data
-- リアルなサンプルデータ
-- ============================================================

-- NOTE: This seed assumes you've created a test user in Supabase Auth.
-- Replace the UUIDs with real auth.users IDs when running against real Supabase.
-- For local dev: supabase db seed

-- ============================================================
-- Test Organizations
-- ============================================================
insert into organizations (id, name, slug, avatar_url) values
  ('a1000000-0000-0000-0000-000000000001', 'Stripe Engineering', 'stripe-engineering', 'https://avatars.githubusercontent.com/u/856813'),
  ('a1000000-0000-0000-0000-000000000002', 'Vercel Docs', 'vercel-docs', 'https://avatars.githubusercontent.com/u/14985020'),
  ('a1000000-0000-0000-0000-000000000003', 'Linear', 'linear-app', 'https://avatars.githubusercontent.com/u/62011337')
on conflict do nothing;

-- ============================================================
-- Sites
-- ============================================================
insert into sites (id, organization_id, name, slug, description, visibility, theme_config) values
  (
    'b1000000-0000-0000-0000-000000000001',
    'a1000000-0000-0000-0000-000000000001',
    'Stripe API Reference',
    'api-reference',
    '決済・サブスクリプション・Connect の完全なAPIリファレンス。',
    'public',
    '{"primaryColor": "#635BFF", "fontFamily": "inter", "sidebar": "left"}'
  ),
  (
    'b1000000-0000-0000-0000-000000000002',
    'a1000000-0000-0000-0000-000000000001',
    'Stripe Developer Docs',
    'developer-docs',
    'Stripe への統合方法、SDKの使い方、ベストプラクティス。',
    'public',
    '{"primaryColor": "#635BFF", "fontFamily": "inter", "sidebar": "left"}'
  ),
  (
    'b1000000-0000-0000-0000-000000000003',
    'a1000000-0000-0000-0000-000000000002',
    'Vercel Documentation',
    'docs',
    'Next.js、Nuxt、SvelteKit をゼロ設定でデプロイ。',
    'public',
    '{"primaryColor": "#000000", "fontFamily": "geist", "sidebar": "left"}'
  )
on conflict do nothing;

-- ============================================================
-- Spaces
-- ============================================================
insert into spaces (id, site_id, name, slug, description, position) values
  ('c1000000-0000-0000-0000-000000000001', 'b1000000-0000-0000-0000-000000000001', 'Getting Started', 'getting-started', 'Stripe との最初の接続方法', 0),
  ('c1000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', 'Payments', 'payments', '決済フローの実装', 1),
  ('c1000000-0000-0000-0000-000000000003', 'b1000000-0000-0000-0000-000000000001', 'Subscriptions', 'subscriptions', 'サブスクリプション・課金管理', 2),
  ('c1000000-0000-0000-0000-000000000004', 'b1000000-0000-0000-0000-000000000002', 'Quickstart', 'quickstart', 'SDK インストールから最初のAPIコールまで', 0),
  ('c1000000-0000-0000-0000-000000000005', 'b1000000-0000-0000-0000-000000000003', 'Deployments', 'deployments', 'Vercel へのデプロイメント設定', 0),
  ('c1000000-0000-0000-0000-000000000006', 'b1000000-0000-0000-0000-000000000003', 'Functions', 'functions', 'Edge Functions・Serverless Functions', 1)
on conflict do nothing;

-- ============================================================
-- Pages
-- ============================================================
insert into pages (id, space_id, parent_id, title, slug, position, type, published) values
  -- Stripe Getting Started
  ('d1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', null, 'Overview', 'overview', 0, 'page', true),
  ('d1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', null, 'Authentication', 'authentication', 1, 'page', true),
  ('d1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', null, 'Error Handling', 'error-handling', 2, 'page', true),
  ('d1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', null, 'Rate Limits', 'rate-limits', 3, 'page', true),
  -- Stripe Payments
  ('d1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', null, 'Accept a Payment', 'accept-a-payment', 0, 'page', true),
  ('d1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', null, 'Payment Intents', 'payment-intents', 1, 'page', true),
  ('d1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000002', null, 'Payment Methods', 'payment-methods', 2, 'page', true),
  ('d1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000012', 'Cards', 'cards', 0, 'page', true),
  ('d1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000012', 'Bank Transfers', 'bank-transfers', 1, 'page', true),
  -- Vercel Deployments
  ('d1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000005', null, 'Deploy from Git', 'deploy-from-git', 0, 'page', true),
  ('d1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000005', null, 'Environment Variables', 'environment-variables', 1, 'page', true),
  ('d1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000005', null, 'Build Configuration', 'build-configuration', 2, 'page', true)
on conflict do nothing;

-- ============================================================
-- Page Versions（リアルなコンテンツ）
-- ============================================================
insert into page_versions (page_id, content, is_current) values
  (
    'd1000000-0000-0000-0000-000000000001',
    '{
      "blocks": [
        {"id": "1", "type": "heading", "props": {"level": 1}, "content": [{"type": "text", "text": "Stripe API Reference"}]},
        {"id": "2", "type": "paragraph", "content": [{"type": "text", "text": "Stripe の REST API はあらゆる支払い処理を可能にします。リクエストはHTTPSで送信し、レスポンスはJSON形式で返却されます。"}]},
        {"id": "3", "type": "callout", "props": {"type": "info"}, "content": [{"type": "text", "text": "ライブ環境への移行前に、必ずテストモードで動作確認を行ってください。テスト用APIキーは sk_test_ で始まります。"}]},
        {"id": "4", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "Base URL"}]},
        {"id": "5", "type": "codeBlock", "props": {"language": "bash"}, "content": [{"type": "text", "text": "https://api.stripe.com/v1"}]},
        {"id": "6", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "ライブラリ"}]},
        {"id": "7", "type": "paragraph", "content": [{"type": "text", "text": "Stripe の公式SDKは以下の言語に対応しています：Node.js、Python、Ruby、PHP、Go、Java、.NET"}]}
      ]
    }',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000002',
    '{
      "blocks": [
        {"id": "1", "type": "heading", "props": {"level": 1}, "content": [{"type": "text", "text": "Authentication"}]},
        {"id": "2", "type": "paragraph", "content": [{"type": "text", "text": "Stripe API は APIキーによる認証を使用します。ダッシュボードの「開発者」セクションからキーを取得してください。"}]},
        {"id": "3", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "APIキーの使用方法"}]},
        {"id": "4", "type": "codeBlock", "props": {"language": "bash"}, "content": [{"type": "text", "text": "curl https://api.stripe.com/v1/charges \\\n  -u YOUR_SECRET_KEY:"}]},
        {"id": "5", "type": "callout", "props": {"type": "warning"}, "content": [{"type": "text", "text": "シークレットキー（sk_）はサーバーサイドのみで使用し、クライアントサイドには絶対に含めないでください。"}]}
      ]
    }',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000010',
    '{
      "blocks": [
        {"id": "1", "type": "heading", "props": {"level": 1}, "content": [{"type": "text", "text": "Accept a Payment"}]},
        {"id": "2", "type": "paragraph", "content": [{"type": "text", "text": "Stripe の Payment Intents API を使用して、安全な支払いフローを実装する方法を説明します。SCA（Strong Customer Authentication）に完全準拠した実装が可能です。"}]},
        {"id": "3", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "実装手順"}]},
        {"id": "4", "type": "numberedListItem", "content": [{"type": "text", "text": "サーバーサイドで PaymentIntent を作成"}]},
        {"id": "5", "type": "numberedListItem", "content": [{"type": "text", "text": "クライアントの Stripe.js に client_secret を渡す"}]},
        {"id": "6", "type": "numberedListItem", "content": [{"type": "text", "text": "stripe.confirmPayment() で支払いを確定"}]},
        {"id": "7", "type": "codeBlock", "props": {"language": "typescript"}, "content": [{"type": "text", "text": "const paymentIntent = await stripe.paymentIntents.create({\n  amount: 2000,\n  currency: ''jpy'',\n  automatic_payment_methods: { enabled: true },\n});"}]}
      ]
    }',
    true
  ),
  (
    'd1000000-0000-0000-0000-000000000020',
    '{
      "blocks": [
        {"id": "1", "type": "heading", "props": {"level": 1}, "content": [{"type": "text", "text": "Deploy from Git"}]},
        {"id": "2", "type": "paragraph", "content": [{"type": "text", "text": "GitHub、GitLab、またはBitbucketリポジトリをインポートして、Vercelに自動デプロイします。mainブランチへのプッシュが本番環境への自動デプロイをトリガーします。"}]},
        {"id": "3", "type": "heading", "props": {"level": 2}, "content": [{"type": "text", "text": "自動プレビュー"}]},
        {"id": "4", "type": "paragraph", "content": [{"type": "text", "text": "すべてのプルリクエストに対して、一意のプレビューURLが自動生成されます。チームメンバーはコードレビューと同時にビジュアル確認が可能です。"}]}
      ]
    }',
    true
  )
on conflict do nothing;

-- ============================================================
-- Sample Analytics
-- ============================================================
insert into site_analytics (site_id, page_id, path, referrer, country, device, created_at) values
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '/getting-started/overview', 'https://google.com', 'JP', 'desktop', now() - interval '1 day'),
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', '/getting-started/authentication', 'https://google.com', 'US', 'desktop', now() - interval '2 hours'),
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000010', '/payments/accept-a-payment', null, 'JP', 'mobile', now() - interval '30 minutes'),
  ('b1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', '/getting-started/overview', 'https://twitter.com', 'KR', 'desktop', now() - interval '5 hours'),
  ('b1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000020', '/deployments/deploy-from-git', null, 'US', 'desktop', now() - interval '1 hour')
on conflict do nothing;

-- ============================================================
-- Sample Ratings
-- ============================================================
insert into page_ratings (page_id, rating, comment) values
  ('d1000000-0000-0000-0000-000000000001', 1, null),
  ('d1000000-0000-0000-0000-000000000001', 1, 'とても分かりやすかった'),
  ('d1000000-0000-0000-0000-000000000002', 1, null),
  ('d1000000-0000-0000-0000-000000000010', -1, 'コードサンプルがJavaScriptのみで、Pythonの例が欲しい'),
  ('d1000000-0000-0000-0000-000000000020', 1, 'ステップが明確で助かりました')
on conflict do nothing;

-- ============================================================
-- Sample Redirects
-- ============================================================
insert into redirects (site_id, from_path, to_path, status_code) values
  ('b1000000-0000-0000-0000-000000000001', '/v1/charges', '/payments/accept-a-payment', 301),
  ('b1000000-0000-0000-0000-000000000001', '/api/authentication', '/getting-started/authentication', 301),
  ('b1000000-0000-0000-0000-000000000003', '/docs/deployments', '/deployments/deploy-from-git', 302)
on conflict do nothing;
