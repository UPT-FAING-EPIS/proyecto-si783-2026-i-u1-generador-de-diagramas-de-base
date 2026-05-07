import { getProjectsByUser } from '@/lib/backend/actions/projects/list'
import { logoutAction } from '@/lib/backend/actions/auth/logout'
import { Button } from '@/components/ui/button'
import { LogOut, DatabaseZap } from 'lucide-react'
import { createClient } from '@/lib/backend/supabase/server'
import { db } from '@/lib/backend/db'
import { users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar'
import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch dbUser id for ownership comparison
  let dbUserId = ''
  let userName = user?.email ?? 'Usuario'
  let userAvatarUrl: string | null = null
  let currentUser: { id: string; name: string } | null = null
  if (user) {
    const [dbUser] = await db.select({ id: users.id, name: users.name, avatarUrl: users.avatarUrl }).from(users).where(eq(users.authId, user.id)).limit(1)
    dbUserId = dbUser?.id ?? ''
    if (dbUser?.name) userName = dbUser.name
    if (dbUser?.avatarUrl) userAvatarUrl = dbUser.avatarUrl
    if (dbUser) currentUser = { id: dbUser.id, name: dbUser.name ?? userName }
  }

  const projects = await getProjectsByUser()

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <Suspense fallback={<div className="hidden lg:block w-[220px] flex-shrink-0" />}>
        <DashboardSidebar 
          userName={userName} 
          userEmail={user?.email}
          userAvatarUrl={userAvatarUrl}
        />
      </Suspense>
      <main className="flex-1 overflow-auto">
        <header className="border-b border-[#1E2A45] bg-[#111827] sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1A6CF6] to-[#00D4FF] flex items-center justify-center shadow-lg shadow-[#1A6CF6]/20">
                <DatabaseZap className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-[#E2E8F0]">DBCanvas</span>
            </div>
            <form action={logoutAction}>
              <Button type="submit" variant="ghost" size="sm" className="text-[#94A3B8] hover:text-white hover:bg-[#1E2A45] transition-colors">
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </Button>
            </form>
          </div>
        </header>

        <div className="container mx-auto px-4 py-10 max-w-6xl">
          <DashboardClient projects={projects} currentUserId={dbUserId} currentUser={currentUser} />
        </div>
      </main>
    </div>
  )
}
