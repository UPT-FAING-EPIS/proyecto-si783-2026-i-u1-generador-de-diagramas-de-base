'use client'

import { ProjectCard } from './ProjectCard'
import { CreateProjectModal } from './CreateProjectModal'

interface ProjectData {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    ownerId: string
    tags?: string[] | null
  }
  role: string
  members?: { id: string; name: string }[]
}

interface ProjectGridProps {
  projects: ProjectData[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
  onCreateProject?: () => void
}

export function ProjectGrid({ projects, currentUserId, currentUser, onCreateProject }: ProjectGridProps) {
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
          <CreateProjectModal />
        </div>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="text-5xl mb-4">🗂️</div>
          <h3 className="text-white font-semibold mb-2">No tienes proyectos aún</h3>
          <p className="text-[#6B7280] text-sm">
            Crea tu primer diagrama haciendo clic en &quot;Nuevo proyecto&quot;
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
        <CreateProjectModal />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {projects.map(({ project, role, members }) => (
          <ProjectCard
            key={project.id}
            project={project}
            role={role}
            isOwner={project.ownerId === currentUserId}
            members={members ?? []}
            tags={project.tags ?? []}
            currentUser={currentUser}
          />
        ))}
        
        <button
          onClick={onCreateProject || (() => document.getElementById('create-project-btn')?.click())}
          className="rounded-xl border-2 border-dashed transition-all duration-200 group"
          style={{ borderColor: '#1E2A45', minHeight: '180px' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = '#1E2A45')}>
          <div className="h-full flex flex-col items-center justify-center gap-3 p-6">
            <div className="w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                 style={{ backgroundColor: '#1E2A45' }}>
              <span className="text-2xl leading-none" style={{ color: '#6B7280' }}>+</span>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-white">Crear nuevo proyecto</p>
              <p className="text-xs mt-1" style={{ color: '#6B7280' }}>Comienza desde cero</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  )
}
