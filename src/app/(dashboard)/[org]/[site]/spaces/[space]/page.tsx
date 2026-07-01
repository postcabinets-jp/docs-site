import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { Plus, FileText, Folder, ChevronRight, Edit3, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createPage } from '@/app/actions/pages'

interface SpacePageProps {
  params: Promise<{ org: string; site: string; space: string }>
}

type PageItem = {
  id: string
  title: string
  slug: string
  position: number
  type: string
  published: boolean
  parent_id: string | null
  children?: PageItem[]
}

function buildTree(pages: PageItem[]): PageItem[] {
  const map = new Map<string, PageItem>()
  const roots: PageItem[] = []

  pages.forEach(p => map.set(p.id, { ...p, children: [] }))

  pages.forEach(p => {
    const node = map.get(p.id)!
    if (p.parent_id && map.has(p.parent_id)) {
      map.get(p.parent_id)!.children!.push(node)
    } else {
      roots.push(node)
    }
  })

  return roots
}

function PageTree({
  pages,
  orgSlug,
  siteSlug,
  spaceSlug,
  depth = 0,
}: {
  pages: PageItem[]
  orgSlug: string
  siteSlug: string
  spaceSlug: string
  depth?: number
}) {
  return (
    <div className={depth > 0 ? 'ml-4 border-l border-gray-100 pl-3' : ''}>
      {pages.map(page => (
        <div key={page.id}>
          <div className="flex items-center justify-between py-2 pr-2 rounded hover:bg-gray-50 group">
            <Link
              href={`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}/pages/${page.slug}/edit`}
              className="flex items-center gap-2 flex-1 min-w-0"
            >
              {page.type === 'group' ? (
                <Folder className="w-4 h-4 text-gray-400 flex-shrink-0" />
              ) : (
                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
              )}
              <span className="text-sm text-gray-800 truncate">{page.title}</span>
            </Link>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              {page.published ? (
                <Eye className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <EyeOff className="w-3.5 h-3.5 text-gray-400" />
              )}
              <Link href={`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}/pages/${page.slug}/edit`}>
                <Edit3 className="w-3.5 h-3.5 text-gray-400 hover:text-gray-700" />
              </Link>
            </div>
          </div>
          {page.children && page.children.length > 0 && (
            <PageTree
              pages={page.children}
              orgSlug={orgSlug}
              siteSlug={siteSlug}
              spaceSlug={spaceSlug}
              depth={depth + 1}
            />
          )}
        </div>
      ))}
    </div>
  )
}

export default async function SpacePage({ params }: SpacePageProps) {
  const { org: orgSlug, site: siteSlug, space: spaceSlug } = await params
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

  const { data: space } = await supabase
    .from('spaces')
    .select('*')
    .eq('site_id', site.id)
    .eq('slug', spaceSlug)
    .single()

  if (!space) notFound()

  const { data: membership } = await supabase
    .from('organization_members')
    .select('role')
    .eq('organization_id', org.id)
    .eq('user_id', user.id)
    .single()

  if (!membership) notFound()

  const { data: pagesData } = await supabase
    .from('pages')
    .select('id, title, slug, position, type, published, parent_id')
    .eq('space_id', space.id)
    .order('position', { ascending: true })

  const pages = pagesData ?? []
  const tree = buildTree(pages as PageItem[])
  const publishedCount = pages.filter(p => p.published).length
  const canEdit = membership.role === 'owner' || membership.role === 'editor'

  return (
    <div className="px-6 py-8 max-w-5xl mx-auto">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-4 flex items-center gap-1">
        <Link href={`/${orgSlug}`} className="hover:text-gray-700">{org.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/${orgSlug}/${siteSlug}`} className="hover:text-gray-700">{site.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-gray-900 font-medium">{space.name}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{space.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {pages.length} ページ · {publishedCount} 公開済み
          </p>
        </div>
        {canEdit && (
          <form action={createPage.bind(null, { spaceId: space.id, orgSlug, siteSlug, spaceSlug })}>
            <Button type="submit" className="bg-slate-900 hover:bg-slate-700 gap-2" size="sm">
              <Plus className="w-4 h-4" />
              ページを追加
            </Button>
          </form>
        )}
      </div>

      {/* Page Tree */}
      {pages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-xl">
          <FileText className="w-10 h-10 text-gray-300 mx-auto mb-4" />
          <p className="text-sm font-medium text-gray-700 mb-2">ページがありません</p>
          <p className="text-xs text-gray-500 mb-6">
            最初のドキュメントページを作成してください
          </p>
          {canEdit && (
            <form action={createPage.bind(null, { spaceId: space.id, orgSlug, siteSlug, spaceSlug })}>
              <Button type="submit" size="sm" className="bg-slate-900 hover:bg-slate-700 gap-2">
                <Plus className="w-3.5 h-3.5" />
                ページを作成
              </Button>
            </form>
          )}
        </div>
      ) : (
        <Card className="p-4">
          <PageTree
            pages={tree}
            orgSlug={orgSlug}
            siteSlug={siteSlug}
            spaceSlug={spaceSlug}
          />
        </Card>
      )}

      {/* Git Sync info */}
      {space.git_repo && (
        <Card className="mt-6 p-4 bg-gray-50">
          <div className="flex items-center gap-2 mb-2">
            <svg viewBox="0 0 24 24" className="w-4 h-4" fill="currentColor">
              <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Git 同期</span>
          </div>
          <p className="text-xs text-gray-500">
            {space.git_repo} · {space.git_branch} ブランチ · {space.git_path}
          </p>
        </Card>
      )}
    </div>
  )
}
