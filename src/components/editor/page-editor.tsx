'use client'

import { useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { updatePage } from '@/app/actions/pages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Eye, EyeOff, Save, Check } from 'lucide-react'

interface PageEditorProps {
  page: {
    id: string
    title: string
    slug: string
    published: boolean
  }
  initialContent: object
  orgSlug: string
  siteSlug: string
  spaceSlug: string
  canEdit: boolean
}

export function PageEditor({
  page,
  initialContent,
  orgSlug,
  siteSlug,
  spaceSlug,
  canEdit,
}: PageEditorProps) {
  const [title, setTitle] = useState(page.title)
  const [published, setPublished] = useState(page.published)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [content, setContent] = useState(initialContent)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  const save = useCallback(async (newContent?: object) => {
    setSaveState('saving')
    await updatePage({
      pageId: page.id,
      title,
      content: newContent ?? content,
      orgSlug,
      siteSlug,
      spaceSlug,
      pageSlug: page.slug,
    })
    setSaveState('saved')
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(() => setSaveState('idle'), 2000)
  }, [title, content, page.id, page.slug, orgSlug, siteSlug, spaceSlug])

  const togglePublish = async () => {
    const newPublished = !published
    setPublished(newPublished)
    await updatePage({
      pageId: page.id,
      published: newPublished,
      orgSlug,
      siteSlug,
      spaceSlug,
      pageSlug: page.slug,
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3">
        <nav className="text-sm text-gray-500 flex items-center gap-1">
          <Link href={`/${orgSlug}/${siteSlug}/spaces/${spaceSlug}`} className="hover:text-gray-700">
            スペース
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-gray-900 font-medium truncate max-w-48">{title}</span>
        </nav>

        {canEdit && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm">
              {saveState === 'saving' && <span className="text-gray-400">保存中...</span>}
              {saveState === 'saved' && (
                <span className="text-green-600 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  保存済み
                </span>
              )}
            </div>

            <button
              onClick={togglePublish}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                published
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {published ? '公開中' : '下書き'}
            </button>

            <Button
              onClick={() => save()}
              size="sm"
              className="bg-slate-900 hover:bg-slate-700 gap-2"
              disabled={saveState === 'saving'}
            >
              <Save className="w-3.5 h-3.5" />
              保存
            </Button>
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="max-w-3xl mx-auto px-8 py-12">
          {/* Title */}
          {canEdit ? (
            <Input
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-4xl font-bold border-none shadow-none p-0 h-auto focus-visible:ring-0 text-gray-900 mb-8"
              placeholder="ページタイトル"
              style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: '2.5rem' }}
            />
          ) : (
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
          )}

          {/* Placeholder editor - production would use BlockNote */}
          <div className="prose prose-gray max-w-none">
            {canEdit ? (
              <div className="min-h-96">
                <div className="border border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-400">
                  <p className="text-sm mb-2">ブロックエディタ</p>
                  <p className="text-xs">
                    本番環境では BlockNote エディタが表示されます。
                    <br />
                    スラッシュ（/）コマンドで見出し・コードブロック・画像などを追加できます。
                  </p>
                  <div className="mt-6 text-left max-w-md mx-auto space-y-3 text-gray-600 text-sm">
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/h1</kbd>
                      <span>見出し 1</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/code</kbd>
                      <span>コードブロック</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/image</kbd>
                      <span>画像</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs">/callout</kbd>
                      <span>コールアウト</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 italic">このページを閲覧する権限のみがあります。</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
