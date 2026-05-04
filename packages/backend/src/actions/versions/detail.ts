'use server'

import { db } from '../../db'
import { diagramVersions } from '../../db/schema'
import { eq } from 'drizzle-orm'
import { createClient } from '../../supabase/server'

export async function getVersionDetailAction(versionId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'No autorizado' }
    }

    const [version] = await db
      .select({
        sqlContent: diagramVersions.sqlContent,
        versionNumber: diagramVersions.versionNumber,
      })
      .from(diagramVersions)
      .where(eq(diagramVersions.id, versionId))
      .limit(1)

    if (!version) {
      return { error: 'Versión no encontrada' }
    }

    return { data: version }
  } catch (error) {
    console.error('Error fetching version detail:', error)
    return { error: 'Error interno al cargar la versión' }
  }
}
