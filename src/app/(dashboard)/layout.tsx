import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardSidebar } from '@/components/layout/dashboard-sidebar'
import { DashboardHeader } from '@/components/layout/dashboard-header'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get user's organizations
  const { data: orgs } = await supabase
    .from('organization_members')
    .select(`
      role,
      organizations (
        id, name, slug, avatar_url
      )
    `)
    .eq('user_id', user.id)

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const organizations = orgs?.map(o => ({
    ...o.organizations,
    role: o.role,
  })).filter(Boolean) ?? []

  return (
    <div className="flex h-screen bg-gray-50">
      <DashboardSidebar organizations={organizations as Parameters<typeof DashboardSidebar>[0]['organizations']} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <DashboardHeader user={user} profile={profile} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
