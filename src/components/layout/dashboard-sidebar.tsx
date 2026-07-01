'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Globe,
  Settings,
  ChevronDown,
  Plus,
  BookOpen,
  BarChart2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'

type Organization = {
  id: string
  name: string
  slug: string
  avatar_url: string | null
  role: string
}

interface DashboardSidebarProps {
  organizations: Organization[]
}

export function DashboardSidebar({ organizations }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [expandedOrg, setExpandedOrg] = useState<string | null>(
    organizations[0]?.slug ?? null
  )

  const mainNav = [
    { href: '/dashboard', label: 'ダッシュボード', icon: LayoutDashboard },
  ]

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-gray-200 bg-white transition-all duration-200',
        collapsed ? 'w-14' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center border-b border-gray-200 px-4">
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-base tracking-tight">docs-site</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 bg-slate-900 rounded-md flex items-center justify-center mx-auto">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {mainNav.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-3 rounded-md px-2 py-2 text-sm font-medium transition-colors',
              pathname === item.href
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && item.label}
          </Link>
        ))}

        {/* Organizations */}
        {!collapsed && (
          <div className="mt-6">
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Organizations
              </span>
              <Link
                href="/dashboard/new-org"
                className="rounded p-0.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                title="組織を作成"
              >
                <Plus className="w-3.5 h-3.5" />
              </Link>
            </div>

            {organizations.map(org => (
              <div key={org.id}>
                <button
                  onClick={() => setExpandedOrg(expandedOrg === org.slug ? null : org.slug)}
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center text-xs font-medium flex-shrink-0">
                    {org.name[0].toUpperCase()}
                  </div>
                  <span className="flex-1 text-left truncate">{org.name}</span>
                  <Badge variant="secondary" className="text-xs py-0 px-1 h-4">
                    {org.role === 'owner' ? 'Owner' : org.role === 'editor' ? 'Editor' : 'Viewer'}
                  </Badge>
                  <ChevronDown
                    className={cn('w-3 h-3 text-gray-400 transition-transform', expandedOrg === org.slug && 'rotate-180')}
                  />
                </button>

                {expandedOrg === org.slug && (
                  <div className="ml-3 pl-3 border-l border-gray-100 mt-1 space-y-0.5">
                    <Link
                      href={`/${org.slug}`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50',
                        pathname === `/${org.slug}` && 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <Globe className="w-3.5 h-3.5" />
                      サイト一覧
                    </Link>
                    <Link
                      href={`/${org.slug}/settings`}
                      className={cn(
                        'flex items-center gap-2 px-2 py-1.5 rounded text-xs text-gray-600 hover:bg-gray-50',
                        pathname.startsWith(`/${org.slug}/settings`) && 'bg-gray-100 text-gray-900'
                      )}
                    >
                      <Settings className="w-3.5 h-3.5" />
                      設定
                    </Link>
                  </div>
                )}
              </div>
            ))}

            {organizations.length === 0 && (
              <div className="px-2 py-4 text-center">
                <p className="text-xs text-gray-500 mb-2">組織がありません</p>
                <Link
                  href="/dashboard/new-org"
                  className="text-xs font-medium text-slate-900 hover:underline"
                >
                  最初の組織を作成
                </Link>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-gray-200 p-2">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-1.5 rounded text-gray-400 hover:text-gray-600 hover:bg-gray-50"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </aside>
  )
}
