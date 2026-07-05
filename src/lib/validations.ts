import { z } from 'zod'

export const idSchema = z.string().uuid('無効なIDです')

export const slugSchema = z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'スラッグは英小文字・数字・ハイフンのみ')

export const createPageSchema = z.object({
  spaceId: idSchema,
  orgSlug: slugSchema,
  siteSlug: slugSchema,
  spaceSlug: slugSchema,
})

export const updatePageSchema = z.object({
  pageId: idSchema,
  title: z.string().min(1, 'タイトルは必須です').max(200, '200文字以内').optional(),
  published: z.boolean().optional(),
  content: z.record(z.string(), z.unknown()).optional(),
  orgSlug: slugSchema,
  siteSlug: slugSchema,
  spaceSlug: slugSchema,
  pageSlug: slugSchema,
})
