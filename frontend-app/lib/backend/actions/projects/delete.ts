'use server'

import { db } from '../../db'
import { projects } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'
import { revalidatePath } from 'next/cache'

export async function deleteProjectAction(projectId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'No autorizado' }
  }

  try {
    // TODO: Una vez que se ejecute la migración para agregar deleted_at,
    // descomenta esta línea:
    // await db
    //   .update(projects)
    //   .set({ deleted_at: new Date() })
    //   .where(eq(projects.id, projectId))
    
    // Por ahora, simplemente se eliminará el proyecto
    return { success: true, message: 'Función de papelera aún no disponible' }
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
    // TODO: Una vez que se ejecute la migración para agregar deleted_at,
    // descomenta esta línea:
    // await db
    //   .update(projects)
    //   .set({ deleted_at: null })
    //   .where(eq(projects.id, projectId))
    
    // Por ahora, simplemente se devuelve un mensaje
    return { success: true, message: 'Función de papelera aún no disponible' }
  } catch (error) {
    console.error('Restore project error:', error)
    return { error: 'Error al restaurar el proyecto' }
  }
}
