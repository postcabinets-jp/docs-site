import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import { PageEditor } from '@/components/editor/page-editor'

interface EditPageProps {
  params: Promise<{ org: string; site: string; space: string; page: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { org: orgSlug, site: siteSlug, space: spaceSlug, page: pageSlug } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: org } = await supabase
    .from('organizations')
    .select('id, name, slug')
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

  const { data: site } = await supabase
    .from('sites')
    .select('id, name, slug')
    .eq('organization_id', org.id)
    .eq('slug', siteSlug)
    .single()

  if (!site) notFound()

  const { data: space } = await supabase
    .from('spaces')
    .select('id, name, slug')
    .eq('site_id', site.id)
    .eq('slug', spaceSlug)
    .single()

  if (!space) notFound()

  const { data: page } = await supabase
    .from('pages')
    .select('*')
    .eq('space_id', space.id)
    .eq('slug', pageSlug)
    .single()

  if (!page) notFound()

  const { data: version } = await supabase
    .from('page_versions')
    .select('content')
    .eq('page_id', page.id)
    .eq('is_current', true)
    .single()

  const canEdit = membership.role === 'owner' || membership.role === 'editor'

  return (
    <PageEditor
      page={page}
      initialContent={(version?.content as object) ?? { blocks: [] }}
      orgSlug={orgSlug}
      siteSlug={siteSlug}
      spaceSlug={spaceSlug}
      canEdit={canEdit}
    />
  )
}
