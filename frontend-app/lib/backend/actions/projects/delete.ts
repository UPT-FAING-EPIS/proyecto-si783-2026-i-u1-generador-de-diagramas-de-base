'use server'

import { db } from '../../db'
import { projects, users } from '../../db/schema'
import { and, eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'
import { logActivity } from '../activity/logActivity'

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
    if (!dbUser) return { error: 'Usuario no encontrado' }

    const [project] = await db
      .update(projects)
      .set({ deletedAt: new Date(), updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, dbUser.id)))
      .returning({ id: projects.id, name: projects.name })

    if (!project) return { error: 'No tienes permisos para eliminar este proyecto' }

    await logActivity(user.id, 'project_deleted', project.id, { projectName: project.name })
    revalidatePath('/dashboard')
    return { success: true, message: 'Proyecto movido a la papelera' }
  } catch (error) {
    console.error('Delete project error:', error)
    return { error: 'Error al eliminar el proyecto' }
  }
}

export async function restoreProjectAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  try {
    const [dbUser] = await db.select().from(users).where(eq(users.authId, user.id)).limit(1)
    if (!dbUser) return { error: 'Usuario no encontrado' }

    const [project] = await db
      .update(projects)
      .set({ deletedAt: null, updatedAt: new Date() })
      .where(and(eq(projects.id, projectId), eq(projects.ownerId, dbUser.id)))
      .returning({ id: projects.id, name: projects.name })

    if (!project) return { error: 'No tienes permisos para restaurar este proyecto' }

    await logActivity(user.id, 'project_restored', project.id, { projectName: project.name })
    revalidatePath('/dashboard')
    return { success: true, message: 'Proyecto restaurado' }
  } catch (error) {
    console.error('Restore project error:', error)
    return { error: 'Error al restaurar el proyecto' }
  }
}
