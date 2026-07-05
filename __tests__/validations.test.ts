import { describe, it, expect } from 'vitest'
import { idSchema, slugSchema, createPageSchema, updatePageSchema } from '@/lib/validations'

const VALID_UUID = '550e8400-e29b-41d4-a716-446655440000'
const ANOTHER_UUID = '6ba7b810-9dad-11d1-80b4-00c04fd430c8'

describe('idSchema', () => {
  it('accepts a valid UUID', () => {
    expect(idSchema.parse(VALID_UUID)).toBe(VALID_UUID)
  })

  it('rejects a non-UUID string', () => {
    const result = idSchema.safeParse('not-a-uuid')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe('無効なIDです')
    }
  })

  it('rejects an empty string', () => {
    expect(idSchema.safeParse('').success).toBe(false)
  })

  it('rejects a number', () => {
    expect(idSchema.safeParse(123).success).toBe(false)
  })
})

describe('slugSchema', () => {
  it('accepts lowercase alphanumeric with hyphens', () => {
    expect(slugSchema.parse('my-page')).toBe('my-page')
  })

  it('accepts a single character', () => {
    expect(slugSchema.parse('a')).toBe('a')
  })

  it('accepts digits only', () => {
    expect(slugSchema.parse('123')).toBe('123')
  })

  it('rejects uppercase letters', () => {
    const result = slugSchema.safeParse('My Page')
    expect(result.success).toBe(false)
  })

  it('rejects special characters', () => {
    expect(slugSchema.safeParse('page@1').success).toBe(false)
  })

  it('rejects underscores', () => {
    expect(slugSchema.safeParse('my_page').success).toBe(false)
  })

  it('rejects empty string (min 1)', () => {
    expect(slugSchema.safeParse('').success).toBe(false)
  })

  it('rejects string over 100 characters', () => {
    const long = 'a'.repeat(101)
    expect(slugSchema.safeParse(long).success).toBe(false)
  })

  it('accepts exactly 100 characters', () => {
    const exact = 'a'.repeat(100)
    expect(slugSchema.parse(exact)).toBe(exact)
  })
})

describe('createPageSchema', () => {
  const validInput = {
    spaceId: VALID_UUID,
    orgSlug: 'my-org',
    siteSlug: 'my-site',
    spaceSlug: 'my-space',
  }

  it('accepts valid input', () => {
    expect(createPageSchema.parse(validInput)).toEqual(validInput)
  })

  it('rejects missing spaceId', () => {
    const { spaceId, ...rest } = validInput
    expect(createPageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing orgSlug', () => {
    const { orgSlug, ...rest } = validInput
    expect(createPageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing siteSlug', () => {
    const { siteSlug, ...rest } = validInput
    expect(createPageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing spaceSlug', () => {
    const { spaceSlug, ...rest } = validInput
    expect(createPageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid UUID for spaceId', () => {
    expect(
      createPageSchema.safeParse({ ...validInput, spaceId: 'bad' }).success
    ).toBe(false)
  })

  it('rejects invalid slug format for orgSlug', () => {
    expect(
      createPageSchema.safeParse({ ...validInput, orgSlug: 'BAD SLUG' }).success
    ).toBe(false)
  })
})

describe('updatePageSchema', () => {
  const validInput = {
    pageId: VALID_UUID,
    orgSlug: 'my-org',
    siteSlug: 'my-site',
    spaceSlug: 'my-space',
    pageSlug: 'my-page',
  }

  it('accepts valid input with required fields only', () => {
    const result = updatePageSchema.parse(validInput)
    expect(result.pageId).toBe(VALID_UUID)
  })

  it('accepts valid input with all optional fields', () => {
    const full = {
      ...validInput,
      title: 'My Page Title',
      published: true,
      content: { type: 'doc', blocks: 'data' },
    }
    const result = updatePageSchema.parse(full)
    expect(result.title).toBe('My Page Title')
    expect(result.published).toBe(true)
    expect(result.content).toEqual({ type: 'doc', blocks: 'data' })
  })

  it('title is optional', () => {
    const result = updatePageSchema.parse(validInput)
    expect(result.title).toBeUndefined()
  })

  it('published is optional', () => {
    const result = updatePageSchema.parse(validInput)
    expect(result.published).toBeUndefined()
  })

  it('content is optional', () => {
    const result = updatePageSchema.parse(validInput)
    expect(result.content).toBeUndefined()
  })

  it('rejects title shorter than 1 character', () => {
    expect(
      updatePageSchema.safeParse({ ...validInput, title: '' }).success
    ).toBe(false)
  })

  it('rejects title longer than 200 characters', () => {
    expect(
      updatePageSchema.safeParse({ ...validInput, title: 'x'.repeat(201) }).success
    ).toBe(false)
  })

  it('accepts title at exactly 200 characters', () => {
    const title = 'x'.repeat(200)
    const result = updatePageSchema.parse({ ...validInput, title })
    expect(result.title).toBe(title)
  })

  it('rejects non-boolean published', () => {
    expect(
      updatePageSchema.safeParse({ ...validInput, published: 'yes' }).success
    ).toBe(false)
  })

  it('content accepts a record with string keys', () => {
    const result = updatePageSchema.parse({
      ...validInput,
      content: { key1: 'value', key2: 42, key3: null },
    })
    expect(result.content).toEqual({ key1: 'value', key2: 42, key3: null })
  })

  it('rejects missing pageId', () => {
    const { pageId, ...rest } = validInput
    expect(updatePageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects missing pageSlug', () => {
    const { pageSlug, ...rest } = validInput
    expect(updatePageSchema.safeParse(rest).success).toBe(false)
  })

  it('rejects invalid UUID for pageId', () => {
    expect(
      updatePageSchema.safeParse({ ...validInput, pageId: 'bad-id' }).success
    ).toBe(false)
  })
})
