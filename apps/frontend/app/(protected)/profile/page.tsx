import { createClient } from '@fluxsql/backend/supabase/server'
import { db } from '@fluxsql/backend/db'
import { users } from '@fluxsql/backend/schema'
import { eq } from 'drizzle-orm'
import { ProfileForm } from '@/components/profile/ProfileForm'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [dbUser] = await db
    .select({ id: users.id, name: users.name, email: users.email, avatarUrl: users.avatarUrl })
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) redirect('/login')

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#0A0F1E' }}>
      <div className="flex-1 p-8">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-white mb-2">Mi perfil</h1>
          <p className="text-sm mb-8" style={{ color: '#6B7280' }}>
            Actualiza tu nombre y foto de perfil
          </p>
          <ProfileForm
            userId={dbUser.id}
            initialName={dbUser.name ?? ''}
            initialEmail={dbUser.email}
            initialAvatarUrl={dbUser.avatarUrl ?? null}
          />
        </div>
      </div>
    </div>
  )
}
