import { diagramsAPI } from '@/lib/api/client'
import type { FlowJson } from '@/lib/flow-types'

export async function saveDiagramAction({
  projectId,
  sqlContent,
  flowJson,
  dialect,
}: {
  projectId: string
  sqlContent: string
  flowJson: FlowJson
  dialect: string
}) {
  try {
    await diagramsAPI.saveByProject(projectId, {
      schema_json: JSON.stringify(flowJson),
      sql_content: sqlContent,
      active_dialect: dialect,
    });
    return { 
      success: true,
      flowJson,
      activeDialect: dialect,
      sqlContent,
      versionNumber: 1
    }
  } catch (error) {
    console.error('Error saving diagram via API:', error)
    return { error: 'Error interno al guardar' }
  }
}
