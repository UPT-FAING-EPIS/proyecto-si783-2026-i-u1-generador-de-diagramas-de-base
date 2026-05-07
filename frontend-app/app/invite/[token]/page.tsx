import { createClient } from '@/lib/backend/supabase/server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/backend/db'
import { collaborators, users } from '@/lib/backend/db/schema'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

interface InvitePageProps {
  params: Promise<{ token: string }>
}

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params
  const supabase = await createClient()

  try {
    // 1. Buscar token en project_invitations
    const { data: invitation, error: inviteError } = await supabase
      .from('project_invitations')
      .select('*')
      .eq('token', token)
      .single()

    if (inviteError || !invitation) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Invitación inválida o expirada</h1>
            <p className="text-[#94A3B8]">El enlace de invitación no es válido o ha expirado.</p>
          </div>
        </div>
      )
    }

    // 2. Si ya tiene accepted_at: mostrar "Invitación ya utilizada"
    if (invitation.accepted_at) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Invitación ya utilizada</h1>
            <p className="text-[#94A3B8]">Esta invitación ya fue aceptada anteriormente.</p>
          </div>
        </div>
      )
    }

    // 3. Verificar autenticación
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      // Si NO autenticado: redirect a /login?returnUrl=/invite/[token]
      redirect(`/login?returnUrl=/invite/${token}`)
    }

    // 4. Si SÍ autenticado:
    // a. UPDATE project_invitations SET accepted_at = now()
    const { error: updateError } = await supabase
      .from('project_invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token)

    if (updateError) {
      console.error('Error updating invitation:', updateError)
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Error al aceptar invitación</h1>
            <p className="text-[#94A3B8]">Ocurrió un error al procesar la invitación.</p>
          </div>
        </div>
      )
    }

    // b. Obtener el usuario local
    const [dbUser] = await db
      .select()
      .from(users)
      .where(eq(users.authId, user.id))
      .limit(1)

    if (!dbUser) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
          <div className="text-center p-8">
            <h1 className="text-2xl font-bold text-white mb-4">Usuario no encontrado</h1>
            <p className="text-[#94A3B8]">No se encontró tu perfil en el sistema.</p>
          </div>
        </div>
      )
    }

    // c. INSERT INTO collaborators ON CONFLICT DO NOTHING
    await db
      .insert(collaborators)
      .values({
        projectId: invitation.project_id,
        userId: dbUser.id,
        role: 'viewer'
      })
      .onConflictDoNothing({
        target: [collaborators.projectId, collaborators.userId]
      })

    // d. redirect al editor del proyecto
    redirect(`/editor/${invitation.project_id}`)

  } catch (error) {
    console.error('Error processing invitation:', error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0D1117]">
        <div className="text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Error inesperado</h1>
          <p className="text-[#94A3B8]">Ocurrió un error al procesar la invitación.</p>
        </div>
      </div>
    )
  }
}
