'use client'

import { useState, useMemo } from 'react'
import { Search, LayoutGrid, List, X } from 'lucide-react'
import { ProjectGrid } from './ProjectGrid'
import { ProjectListView } from './ProjectListView'
import { CreateProjectModal } from './CreateProjectModal'

interface ProjectItem {
  project: {
    id: string
    name: string
    description: string | null
    updatedAt: Date
    createdAt?: Date
    ownerId: string
  }
  role: string
  members?: { id: string; name: string }[]
}

interface DashboardClientProps {
  projects: ProjectItem[]
  currentUserId: string
  currentUser?: { id: string; name: string } | null
}

export function DashboardClient({ projects, currentUserId, currentUser }: DashboardClientProps) {
  const [query, setQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    try {
      if (typeof window === 'undefined') return 'grid'
      const saved = localStorage.getItem('dbcanvas_view_mode')
      return saved === 'grid' || saved === 'list' ? saved : 'grid'
    } catch {
      return 'grid'
    }
  })

  function handleViewMode(mode: 'grid' | 'list') {
    setViewMode(mode)
    try { localStorage.setItem('dbcanvas_view_mode', mode) } catch {}
  }

  // Filtrado en tiempo real
  const filtered = useMemo(() =>
    projects.filter(item =>
      item.project.name.toLowerCase().includes(query.toLowerCase())
    ), [projects, query])

  return (
    <div>
      {/* Header: título + acciones */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-[#E2E8F0]">Mis Proyectos</h2>
        <CreateProjectModal />
      </div>

      {/* Toolbar: búsqueda + toggle */}
      <div className="flex items-center gap-3 mb-6">

        {/* Campo de búsqueda */}
        <div className="relative flex-1 max-w-xs">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: '#6B7280' }}
          />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Buscar proyectos..."
            className="w-full pl-9 pr-8 py-2 rounded-lg text-sm text-white placeholder-[#4B5563] outline-none transition-colors"
            style={{ backgroundColor: '#111827', border: '1px solid #1E2A45' }}
            onFocus={e => (e.currentTarget.style.borderColor = '#1A6CF6')}
            onBlur={e => (e.currentTarget.style.borderColor = '#1E2A45')}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2"
              style={{ color: '#6B7280' }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Toggle grid/lista */}
        <div
          className="flex items-center rounded-lg overflow-hidden flex-shrink-0"
          style={{ border: '1px solid #1E2A45' }}
        >
          <button
            onClick={() => handleViewMode('grid')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'grid' ? '#1E2A45' : 'transparent',
              color: viewMode === 'grid' ? '#FFFFFF' : '#6B7280',
            }}
            title="Vista de grilla"
          >
            <LayoutGrid size={15} />
          </button>
          <button
            onClick={() => handleViewMode('list')}
            className="p-2 transition-colors"
            style={{
              backgroundColor: viewMode === 'list' ? '#1E2A45' : 'transparent',
              color: viewMode === 'list' ? '#FFFFFF' : '#6B7280',
            }}
            title="Vista de lista"
          >
            <List size={15} />
          </button>
        </div>
      </div>

      {/* Contenido */}
      {filtered.length === 0 && query ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-white font-medium mb-1">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
          <p className="text-sm mb-4" style={{ color: '#6B7280' }}>
            Intenta con otro nombre de proyecto
          </p>
          <button
            onClick={() => setQuery('')}
            className="text-sm transition-colors hover:opacity-80"
            style={{ color: '#1A6CF6' }}
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <ProjectGrid
          projects={filtered}
          currentUserId={currentUserId}
          currentUser={currentUser}
          onCreateProject={() => document.getElementById('create-project-btn')?.click()}
        />
      ) : (
        <ProjectListView
          projects={filtered}
          currentUserId={currentUserId}
        />
      )}
    </div>
  )
}
