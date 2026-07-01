import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, Globe, ArrowRight, BookOpen, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: memberships } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id, name, slug, avatar_url, created_at,
        sites (
          id, name, slug, visibility, updated_at
        )
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const orgs = memberships?.map(m => ({
    ...m.organizations,
    role: m.role,
  })) ?? []

  const recentSites = orgs
    .flatMap(org => (org?.sites ?? []).map(site => ({ ...site, orgSlug: org?.slug })))
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 6)

  const totalSites = orgs.reduce((acc, org) => acc + (org?.sites?.length ?? 0), 0)

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orgs.length} 組織・{totalSites} サイト
          </p>
        </div>
        {orgs.length > 0 && (
          <Button asChild className="bg-slate-900 hover:bg-slate-700 gap-2">
            <Link href={`/${orgs[0]?.slug}/sites/new`}>
              <Plus className="w-4 h-4" />
              新規サイト
            </Link>
          </Button>
        )}
      </div>

      {orgs.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-xl">
          <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-slate-500" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">最初の組織を作成</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto">
            チームとドキュメントを管理するための組織を作成してください。
          </p>
          <Button asChild className="bg-slate-900 hover:bg-slate-700 gap-2">
            <Link href="/dashboard/new-org">
              <Plus className="w-4 h-4" />
              組織を作成
            </Link>
          </Button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Card className="p-4">
              <div className="text-2xl font-bold text-gray-900">{orgs.length}</div>
              <div className="text-sm text-gray-500">組織</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-gray-900">{totalSites}</div>
              <div className="text-sm text-gray-500">サイト</div>
            </Card>
            <Card className="p-4">
              <div className="text-2xl font-bold text-gray-900">
                {recentSites.filter(s => s.visibility === 'public').length}
              </div>
              <div className="text-sm text-gray-500">公開中</div>
            </Card>
          </div>

          {/* Recent Sites */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">最近のサイト</h2>
            </div>

            {recentSites.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
                <Globe className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 mb-4">サイトがありません</p>
                <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-700 gap-2">
                  <Link href={`/${orgs[0]?.slug}/sites/new`}>
                    <Plus className="w-3.5 h-3.5" />
                    最初のサイトを作成
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {recentSites.map(site => (
                  <Link
                    key={site.id}
                    href={`/${site.orgSlug}/${site.slug}`}
                    className="block group"
                  >
                    <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer h-full">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-8 h-8 bg-slate-100 rounded-md flex items-center justify-center">
                          <Globe className="w-4 h-4 text-slate-600" />
                        </div>
                        <Badge
                          variant={site.visibility === 'public' ? 'default' : 'secondary'}
                          className={site.visibility === 'public' ? 'bg-green-100 text-green-700 border-none' : ''}
                        >
                          {site.visibility === 'public' ? '公開' : site.visibility === 'private' ? '非公開' : '限定'}
                        </Badge>
                      </div>
                      <div className="font-medium text-gray-900 group-hover:text-slate-700 mb-1 truncate">
                        {site.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(site.updated_at), { addSuffix: true, locale: ja })}
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Organizations */}
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-4">組織</h2>
            <div className="space-y-2">
              {orgs.map(org => org && (
                <Link key={org.id} href={`/${org.slug}`} className="block">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center text-sm font-semibold text-slate-700">
                        {org.name[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{org.name}</div>
                        <div className="text-xs text-gray-500">{org.sites?.length ?? 0} サイト</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className="text-xs">
                        {org.role === 'owner' ? 'Owner' : org.role === 'editor' ? 'Editor' : 'Viewer'}
                      </Badge>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
