'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface CreatePageArgs {
  spaceId: string
  orgSlug: string
  siteSlug: string
  spaceSlug: string
}

export async function createPage({ spaceId, orgSlug, siteSlug, spaceSlug }: CreatePageArgs) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get current max position
  const { data: existing } = await supabase
    .from('pages')
    .select('position')
    .eq('space_id', spaceId)
    .order('position', { ascending: false })
    .limit(1)

  const nextPosition = (existing?.[0]?.position ?? -1) + 1

  const { data: page, error } = await supabase
    .from('pages')
    .insert({
      space_id: spaceId,
      title: '新しいページ',
      slug: `page-${Date.now()}`,
      position: nextPosition,
      type: 'page',
      published: false,
    })
    .select()
    .single()

  if (error) {
    console.error('Failed to create page:', error)
    return
  }

  // Create initial page version
  await supabase.from('page_versions').insert({
    page_id: page.id,
    content: { blocks: [] },
    is_current: true,
    created_by: user.id,
  })

  revalidatePath(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`)
  redirect(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}/pages/${page.slug}/edit`)
}

interface UpdatePageArgs {
  pageId: string
  title?: string
  published?: boolean
  content?: object
  orgSlug: string
  siteSlug: string
  spaceSlug: string
  pageSlug: string
}

export async function updatePage({
  pageId,
  title,
  published,
  content,
  orgSlug,
  siteSlug,
  spaceSlug,
  pageSlug,
}: UpdatePageArgs) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  if (title !== undefined || published !== undefined) {
    const { error } = await supabase
      .from('pages')
      .update({
        ...(title !== undefined && { title }),
        ...(published !== undefined && { published }),
        updated_at: new Date().toISOString(),
      })
      .eq('id', pageId)

    if (error) return { error: error.message }
  }

  if (content !== undefined) {
    // Mark old versions as not current
    await supabase
      .from('page_versions')
      .update({ is_current: false })
      .eq('page_id', pageId)
      .eq('is_current', true)

    const { error } = await supabase.from('page_versions').insert({
      page_id: pageId,
      content: content as import('@/lib/supabase/types').Json,
      is_current: true,
      created_by: user.id,
    })

    if (error) return { error: error.message }
  }

  revalidatePath(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}/pages/${pageSlug}/edit`)
  return { success: true }
}

export async function deletePage(pageId: string, orgSlug: string, siteSlug: string, spaceSlug: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) return { error: error.message }

  revalidatePath(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`)
  redirect(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`)
}
