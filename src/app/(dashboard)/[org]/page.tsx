import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, Globe, Settings, Users, Key, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'

interface OrgPageProps {
  params: Promise<{ org: string }>
}

export default async function OrgPage({ params }: OrgPageProps) {
  const { org: orgSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', orgSlug)
    .single()

  if (!org) notFound()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  const { data: sites } = await supabase
    .from('sites')
    .select('*')
    .eq('organization_id', org.id)
    .order('updated_at', { ascending: false })

  const { data: members } = await supabase
    .from('organization_members')
    .select(`
      role,
      profiles (full_name, avatar_url)
    `)
    .eq('organization_id', org.id)

  const canEdit = membership.role === 'owner' || membership.role === 'editor'

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-slate-200 rounded-xl flex items-center justify-center text-xl font-bold text-slate-700">
            {org.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
            <p className="text-sm text-gray-500">{sites?.length ?? 0} サイト · {members?.length ?? 0} メンバー</p>
          </div>
        </div>
        <div className="flex gap-2">
          {membership.role === 'owner' && (
            <Button asChild variant="outline" size="sm" className="gap-2">
              <Link href={`/${orgSlug}/settings`}>
                <Settings className="w-4 h-4" />
                設定
              </Link>
            </Button>
          )}
          {canEdit && (
            <Button asChild className="bg-slate-900 hover:bg-slate-700 gap-2" size="sm">
              <Link href={`/${orgSlug}/sites/new`}>
                <Plus className="w-4 h-4" />
                新規サイト
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Quick nav */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        {[
          { href: `/${orgSlug}`, label: 'サイト', icon: Globe, count: sites?.length ?? 0 },
          { href: `/${orgSlug}/settings#members`, label: 'メンバー', icon: Users, count: members?.length ?? 0 },
          { href: `/${orgSlug}/settings#api`, label: 'APIキー', icon: Key, count: null },
          { href: `/${orgSlug}/analytics`, label: '分析', icon: BarChart2, count: null },
        ].map(item => (
          <Link key={item.href} href={item.href}>
            <Card className="p-4 hover:shadow-md transition-shadow cursor-pointer">
              <div className="flex items-center gap-3">
                <item.icon className="w-5 h-5 text-gray-500" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{item.label}</div>
                  {item.count !== null && (
                    <div className="text-xs text-gray-500">{item.count}</div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {/* Sites */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 mb-4">サイト</h2>

        {!sites || sites.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
            <Globe className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <p className="text-sm font-medium text-gray-700 mb-2">サイトがありません</p>
            <p className="text-xs text-gray-500 mb-6">
              ドキュメントサイトを作成して公開しましょう
            </p>
            {canEdit && (
              <Button asChild size="sm" className="bg-slate-900 hover:bg-slate-700 gap-2">
                <Link href={`/${orgSlug}/sites/new`}>
                  <Plus className="w-3.5 h-3.5" />
                  サイトを作成
                </Link>
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sites.map(site => (
              <Link key={site.id} href={`/${orgSlug}/${site.slug}`} className="block group">
                <Card className="p-5 hover:shadow-md transition-shadow h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Globe className="w-5 h-5 text-gray-500" />
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        site.visibility === 'public'
                          ? 'bg-emerald-50 text-emerald-700 border-none text-xs'
                          : 'text-xs'
                      }
                    >
                      {site.visibility === 'public' ? '公開' : site.visibility === 'private' ? '非公開' : '限定'}
                    </Badge>
                  </div>
                  <div className="font-semibold text-gray-900 mb-1 group-hover:text-slate-700">
                    {site.name}
                  </div>
                  {site.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{site.description}</p>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
