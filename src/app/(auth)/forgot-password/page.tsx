'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { forgotPassword } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false)
  const [state, formAction, pending] = useActionState(
    async (prev: { error?: string } | undefined, formData: FormData) => {
      const result = await forgotPassword(formData)
      if (!result.error) setSent(true)
      return result
    },
    undefined
  )

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm space-y-4 px-6 text-center">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900">メールを送信しました</h2>
          <p className="text-sm text-gray-600">
            パスワードリセット用のリンクをメールに送信しました。受信ボックスを確認してください。
          </p>
          <Link href="/login" className="inline-block text-sm font-medium text-slate-900 hover:underline">
            ログインに戻る
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-8 px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">パスワードをリセット</h1>
          <p className="mt-2 text-sm text-gray-600">
            登録済みのメールアドレスを入力してください
          </p>
        </div>

        <form action={formAction} className="space-y-4">
          {state?.error && (
            <div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">メールアドレス</Label>
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              placeholder="name@company.com"
            />
          </div>

          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-700" disabled={pending}>
            {pending ? '送信中...' : 'リセットリンクを送信'}
          </Button>
        </form>

        <p className="text-center text-sm text-gray-600">
          <Link href="/login" className="font-medium text-slate-900 hover:underline">
            ログインに戻る
          </Link>
        </p>
      </div>
    </div>
  )
}
