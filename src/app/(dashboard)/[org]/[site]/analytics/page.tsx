import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, TrendingUp, Users, Clock, Globe } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface AnalyticsPageProps {
  params: Promise<{ org: string; site: string }>
}

export default async function AnalyticsPage({ params }: AnalyticsPageProps) {
  const { org: orgSlug, site: siteSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug')
    .eq('slug', orgSlug)
    .single()

  if (!org) notFound()

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, slug')
    .eq('organization_id', org.id)
    .eq('slug', siteSlug)
    .single()

  if (!site) notFound()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const { data: analytics7d } = await supabase
    .from('site_analytics')
    .select('*')
    .eq('site_id', site.id)
    .gte('created_at', sevenDaysAgo.toISOString())

  const { data: analytics30d } = await supabase
    .from('site_analytics')
    .select('path, country, device, created_at')
    .eq('site_id', site.id)
    .gte('created_at', thirtyDaysAgo.toISOString())
    .order('created_at', { ascending: false })

  const totalPV7d = analytics7d?.length ?? 0
  const totalPV30d = analytics30d?.length ?? 0

  // Top pages
  const pageCounts: Record<string, number> = {}
  analytics30d?.forEach(a => {
    pageCounts[a.path] = (pageCounts[a.path] ?? 0) + 1
  })
  const topPages = Object.entries(pageCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Device breakdown
  const deviceCounts: Record<string, number> = {}
  analytics30d?.forEach(a => {
    if (a.device) deviceCounts[a.device] = (deviceCounts[a.device] ?? 0) + 1
  })

  // Country breakdown
  const countryCounts: Record<string, number> = {}
  analytics30d?.forEach(a => {
    if (a.country) countryCounts[a.country] = (countryCounts[a.country] ?? 0) + 1
  })
  const topCountries = Object.entries(countryCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  // Ratings
  const { data: ratings } = await supabase
    .from('page_ratings')
    .select('rating, page_id, pages(title, slug)')
    .in(
      'page_id',
      (await supabase.from('pages').select('id').eq('space_id',
        (await supabase.from('spaces').select('id').eq('site_id', site.id)).data?.[0]?.id ?? ''
      )).data?.map(p => p.id) ?? []
    )
    .limit(100)

  const positiveRatings = ratings?.filter(r => r.rating === 1).length ?? 0
  const negativeRatings = ratings?.filter(r => r.rating === -1).length ?? 0
  const ratingScore = positiveRatings + negativeRatings > 0
    ? Math.round((positiveRatings / (positiveRatings + negativeRatings)) * 100)
    : null

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <Link href={`/${orgSlug}`} className="hover:text-gray-700">{org.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${orgSlug}/${siteSlug}`} className="hover:text-gray-700">{site.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">分析</span>
      </nav>

      <h1 className="text-2xl font-bold text-gray-900 mb-8">サイト分析</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PV (7日)</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalPV7d.toLocaleString()}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">PV (30日)</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{totalPV30d.toLocaleString()}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">評価数</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">{positiveRatings + negativeRatings}</div>
        </Card>
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">満足度</span>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {ratingScore !== null ? `${ratingScore}%` : '—'}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Pages */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">人気ページ (30日)</h2>
          {topPages.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <div className="space-y-3">
              {topPages.map(([path, count], i) => (
                <div key={path} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs text-gray-400 w-4 flex-shrink-0">{i + 1}</span>
                    <span className="text-sm text-gray-700 truncate">{path}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900 ml-2 flex-shrink-0">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Geography */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">国別アクセス (30日)</h2>
          {topCountries.length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <div className="space-y-3">
              {topCountries.map(([country, count]) => (
                <div key={country} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-gray-400" />
                    <span className="text-sm text-gray-700">{country}</span>
                  </div>
                  <span className="text-sm font-medium text-gray-900">{count.toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Device Breakdown */}
        <Card className="p-6">
          <h2 className="font-semibold text-gray-900 mb-4">デバイス別 (30日)</h2>
          {Object.keys(deviceCounts).length === 0 ? (
            <p className="text-sm text-gray-500">データがありません</p>
          ) : (
            <div className="space-y-3">
              {Object.entries(deviceCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([device, count]) => {
                  const total = Object.values(deviceCounts).reduce((a, b) => a + b, 0)
                  const pct = Math.round((count / total) * 100)
                  return (
                    <div key={device}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-700">
                          {device === 'desktop' ? 'デスクトップ' : device === 'mobile' ? 'モバイル' : 'タブレット'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{pct}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="bg-slate-700 h-1.5 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </Card>

        {/* Privacy note */}
        <Card className="p-6 bg-gray-50">
          <h2 className="font-semibold text-gray-900 mb-2">プライバシーファースト</h2>
          <p className="text-sm text-gray-600 leading-relaxed">
            docs-site の分析はクッキーなし・IPアドレス非保存で動作します。
            GDPR/CCPA に準拠したプライバシーファーストの計測で、
            閲覧者に同意バナーを表示する必要はありません。
          </p>
        </Card>
      </div>
    </div>
  )
}
