'use server'

import { db } from '../../db'
import { projects, collaborators, users, projectInvitations } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { logActivity } from '../activity/logActivity'

function getSiteUrl() {
  const fallback = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  return fallback.replace(/\/$/, '')
}

async function sendProjectInviteEmail(email: string, projectId: string) {
  const redirectTo = `${getSiteUrl()}/editor/${projectId}`
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (serviceRoleKey) {
    const admin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      { auth: { persistSession: false, autoRefreshToken: false } }
    )

    const { error } = await admin.auth.admin.inviteUserByEmail(email, { redirectTo })
    if (error) throw error
    return 'Correo de invitacion enviado'
  }

  const supabase = await createClient()
  const origin = (await headers()).get('origin') ?? getSiteUrl()
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: false,
      emailRedirectTo: `${origin}/editor/${projectId}`,
    },
  })

  if (error) throw error
  return 'Correo de acceso enviado'
}

export async function inviteCollaboratorAction(projectId: string, email: string) {
  const normalizedEmail = email.trim().toLowerCase()
  if (!normalizedEmail) {
    return { error: 'El email es requerido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    return { error: 'Usuario actual no encontrado en la base de datos' }
  }

  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, dbUser.id)))
    .limit(1)

  if (!project) {
    return { error: 'No tienes permisos de propietario para invitar colaboradores' }
  }

  const [invitedDbUser] = await db
    .select()
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  if (invitedDbUser?.id === dbUser.id) {
    return { error: 'No puedes invitarte a ti mismo' }
  }

  try {
    let message = 'Invitacion enviada'

    if (invitedDbUser) {
      const [existingCollab] = await db
        .select()
        .from(collaborators)
        .where(
          and(
            eq(collaborators.projectId, projectId),
            eq(collaborators.userId, invitedDbUser.id)
          )
        )
        .limit(1)

      if (!existingCollab) {
        await db.insert(collaborators).values({
          projectId,
          userId: invitedDbUser.id,
          role: 'editor',
        })
      }
    } else if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      await db
        .insert(projectInvitations)
        .values({
          projectId,
          email: normalizedEmail,
          role: 'editor',
          invitedBy: dbUser.id,
        })
        .onConflictDoNothing()
      return { error: 'Invitacion pendiente guardada. Para enviar correo a usuarios nuevos configura SUPABASE_SERVICE_ROLE_KEY en .env.local.' }
    }

    if (!invitedDbUser) {
      await db
        .insert(projectInvitations)
        .values({
          projectId,
          email: normalizedEmail,
          role: 'editor',
          invitedBy: dbUser.id,
        })
        .onConflictDoNothing()
    }

    message = await sendProjectInviteEmail(normalizedEmail, projectId)
    await logActivity(user.id, 'collaborator_invited', projectId, { invitedEmail: normalizedEmail })

    revalidatePath('/dashboard')
    return { success: true, message }
  } catch (error) {
    console.error('Error in inviteCollaboratorAction:', error)
    return { error: 'No se pudo enviar la invitacion. Revisa la configuracion de correos de Supabase.' }
  }
}
