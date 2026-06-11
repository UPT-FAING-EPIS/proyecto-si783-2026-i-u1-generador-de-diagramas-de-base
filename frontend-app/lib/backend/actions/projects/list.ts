import { projectsAPI } from '@/lib/api/client';

export interface ProjectListItem {
  project: {
    id: string
    name: string
    description: string | null
    ownerId: string
    tags: string[] | null
    createdAt: Date
    updatedAt: Date
    deleted_at: Date | null
  }
  role: string
  members: { id: string; name: string }[]
}

export async function getProjectsByUser(): Promise<ProjectListItem[]> {
  try {
    const projects = await projectsAPI.list();
    return projects.map((p: any) => ({
      project: {
        id: String(p.id),
        name: p.name,
        description: p.description,
        ownerId: 'local-user',
        tags: [],
        createdAt: new Date(p.created_at || new Date()),
        updatedAt: new Date(p.created_at || new Date()),
        deleted_at: null
      },
      role: 'owner',
      members: [{ id: 'local-user', name: 'Usuario Local' }]
    }));
  } catch (error) {
    console.error('Error fetching projects via API:', error);
    // Para modo local sin el backend corriendo, retornar un arreglo vacío en lugar de romper
    return [];
  }
}
