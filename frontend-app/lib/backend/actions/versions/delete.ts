import { versionsAPI } from '@/lib/api/client'

export async function deleteVersionAction(versionId: string, projectId: string) {
  try {
    await versionsAPI.delete(versionId, projectId);
    return { success: true }
  } catch (error: any) {
    console.error('Error deleting version via API:', error)
    return { error: error.message || 'Error al eliminar la versión' }
  }
}
