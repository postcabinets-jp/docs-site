import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, BookOpen, BarChart2, Settings, ExternalLink, GitBranch, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface SitePageProps {
  params: Promise<{ org: string; site: string }>
}

export default async function SitePage({ params }: SitePageProps) {
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
    .select('*')
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

  const { data: spaces } = await supabase
    .from('spaces')
    .select(`
      *,
      pages (count)
    `)
    .eq('site_id', site.id)
    .order('position', { ascending: true })

  // Analytics summary
  const { data: analyticsData } = await supabase
    .from('site_analytics')
    .select('id')
    .eq('site_id', site.id)
    .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())

  const weeklyViews = analyticsData?.length ?? 0

  const canEdit = membership.role === 'owner' || membership.role === 'editor'

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <nav className="text-sm text-gray-500 mb-2">
            <Link href={`/${orgSlug}`} className="hover:text-gray-700">{org.name}</Link>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{site.name}</span>
          </nav>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">{site.name}</h1>
            <Badge
              variant="secondary"
              className={site.visibility === 'public' ? 'bg-emerald-50 text-emerald-700 border-none' : ''}
            >
              {site.visibility === 'public' ? '公開' : site.visibility === 'private' ? '非公開' : '限定'}
            </Badge>
          </div>
          {site.description && (
            <p className="text-sm text-gray-500 mt-1">{site.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          {site.custom_domain && (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <a href={`https://${site.custom_domain}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4" />
                サイトを見る
              </a>
            </Button>
          )}
          {membership.role === 'owner' && (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/${orgSlug}/${siteSlug}/settings`}>
                <Settings className="w-4 h-4" />
                設定
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{spaces?.length ?? 0}</div>
          <div className="text-sm text-gray-500">スペース</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">
            {spaces?.reduce((acc, s) => acc + ((s.pages as unknown as { count: number }[])?.[0]?.count ?? 0), 0) ?? 0}
          </div>
          <div className="text-sm text-gray-500">ページ</div>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-gray-900">{weeklyViews}</div>
          <div className="text-sm text-gray-500">直近7日のPV</div>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="spaces">
        <TabsList className="mb-6">
          <TabsTrigger value="spaces" className="gap-2">
            <BookOpen className="w-4 h-4" />
            スペース
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart2 className="w-4 h-4" />
            分析
          </TabsTrigger>
        </TabsList>

        <TabsContent value="spaces">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">{spaces?.length ?? 0} スペース</span>
            {canEdit && (
              <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-700 gap-2">
                <Link href={`/${orgSlug}/${siteSlug}/spaces/new`}>
                  <Plus className="w-4 h-4" />
                  スペースを追加
                </Link>
              </Button>
            )}
          </div>

          {!spaces || spaces.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
              <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-4" />
              <p className="text-sm font-medium text-gray-700 mb-2">スペースがありません</p>
              <p className="text-xs text-gray-500 mb-6">
                スペースはドキュメントのグループです。機能・バージョン・カテゴリ別に分けられます。
              </p>
              {canEdit && (
                <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-700 gap-2">
                  <Link href={`/${orgSlug}/${siteSlug}/spaces/new`}>
                    <Plus className="w-3.5 h-3.5" />
                    最初のスペースを作成
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {spaces.map(space => {
                const pageCount = (space.pages as unknown as { count: number }[])?.[0]?.count ?? 0
                return (
                  <Link key={space.id} href={`/${orgSlug}/${siteSlug}/spaces/${space.slug}`} className="block">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                          <BookOpen className="w-4 h-4 text-gray-500" />
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{space.name}</div>
                          {space.description && (
                            <div className="text-xs text-gray-500">{space.description}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {space.git_repo && (
                          <div className="flex items-center gap-1 text-xs text-gray-400">
                            <GitBranch className="w-3.5 h-3.5" />
                            {space.git_repo}
                          </div>
                        )}
                        <div className="text-sm text-gray-500">{pageCount} ページ</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <Link href={`/${orgSlug}/${siteSlug}/analytics`}>
            <Card className="p-6 text-center hover:shadow-md transition-shadow cursor-pointer">
              <BarChart2 className="w-8 h-8 text-gray-400 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-700">詳細な分析を表示</p>
              <p className="text-xs text-gray-500 mt-1">PV・UU・デバイス・国別統計</p>
            </Card>
          </Link>
        </TabsContent>
      </Tabs>
    </div>
  )
}
