'use server'

import { db } from '../../db'
import { diagramVersions, diagrams, users } from '../../db/schema'
import { eq, desc } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

export async function listVersionsAction(projectId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    // Obtener el diagrama asociado al proyecto
    const [diagram] = await db
      .select({ id: diagrams.id })
      .from(diagrams)
      .where(eq(diagrams.projectId, projectId))
      .limit(1)

    if (!diagram) {
      return { error: 'Diagrama no encontrado para este proyecto' }
    }

    // Consultar el historial ordenado descendentemente
    const versionsList = await db
      .select({
        id: diagramVersions.id,
        versionNumber: diagramVersions.versionNumber,
        message: diagramVersions.message,
        userId: diagramVersions.userId,
        createdAt: diagramVersions.createdAt,
        authorName: users.name,
      })
      .from(diagramVersions)
      .leftJoin(users, eq(diagramVersions.userId, users.id))
      .where(eq(diagramVersions.diagramId, diagram.id))
      .orderBy(desc(diagramVersions.createdAt))

    return { data: versionsList }
  } catch (error) {
    console.error('Error listing versions:', error)
    return { error: 'Error interno al cargar el historial' }
  }
}
