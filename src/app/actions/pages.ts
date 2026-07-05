'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createPageSchema, updatePageSchema, idSchema, slugSchema } from '@/lib/validations'

export async function createPage(args: {
  spaceId: string
  orgSlug: string
  siteSlug: string
  spaceSlug: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const parsed = createPageSchema.safeParse(args)
  if (!parsed.success) {
    console.error('Validation error:', parsed.error.issues[0]?.message)
    return
  }

  const { spaceId, orgSlug, siteSlug, spaceSlug } = parsed.data

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

export async function updatePage(args: {
  pageId: string
  title?: string
  published?: boolean
  content?: object
  orgSlug: string
  siteSlug: string
  spaceSlug: string
  pageSlug: string
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = updatePageSchema.safeParse(args)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'バリデーションエラー' }
  }

  const { pageId, title, published, content, orgSlug, siteSlug, spaceSlug, pageSlug } = parsed.data

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

  const idResult = idSchema.safeParse(pageId)
  const orgResult = slugSchema.safeParse(orgSlug)
  const siteResult = slugSchema.safeParse(siteSlug)
  const spaceResult = slugSchema.safeParse(spaceSlug)
  if (!idResult.success || !orgResult.success || !siteResult.success || !spaceResult.success) {
    return { error: '無効なパラメータです' }
  }

  const { error } = await supabase.from('pages').delete().eq('id', pageId)
  if (error) return { error: error.message }

  revalidatePath(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`)
  redirect(`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`)
}
