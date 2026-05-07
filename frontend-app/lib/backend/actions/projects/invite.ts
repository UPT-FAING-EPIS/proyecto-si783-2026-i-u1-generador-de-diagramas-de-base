'use server'

import { db } from '../../db'
import { projects, collaborators, users } from '../../db/schema'
import { eq, and } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function inviteCollaboratorAction(projectId: string, email: string) {
  if (!email || email.trim() === '') {
    return { error: 'El email es requerido' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  // Get the db user
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, user.id))
    .limit(1)

  if (!dbUser) {
    return { error: 'Usuario actual no encontrado en la base de datos' }
  }

  // Check if current user is owner
  const [project] = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.ownerId, dbUser.id)))
    .limit(1)

  if (!project) {
    return { error: 'No tienes permisos de propietario para invitar colaboradores' }
  }

  // Buscar al invitado en la tabla profiles de supabase
  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single()

  if (!profile) {
    return { error: 'El usuario no está registrado en DBCanvas' }
  }

  if (profile.id === user.id) {
    return { error: 'No puedes invitarte a ti mismo' }
  }

  // Find the invited user in our local users table
  const [invitedDbUser] = await db
    .select()
    .from(users)
    .where(eq(users.authId, profile.id))
    .limit(1)

  if (!invitedDbUser) {
    return { error: 'El usuario no ha completado su perfil' }
  }

  // Check if they are already a collaborator
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

  if (existingCollab) {
    return { error: 'El usuario ya es colaborador' }
  }

  try {
    await db.insert(collaborators).values({
      projectId,
      userId: invitedDbUser.id,
      role: 'editor'
    })

    revalidatePath('/dashboard')
    return { success: true, message: 'Colaborador añadido correctamente' }
  } catch (error) {
    console.error('Error in inviteCollaboratorAction:', error)
    return { error: 'Ocurrió un error al añadir el colaborador' }
  }
}
