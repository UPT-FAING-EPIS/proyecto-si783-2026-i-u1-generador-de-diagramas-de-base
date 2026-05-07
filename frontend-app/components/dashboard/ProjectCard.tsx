'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { InviteCollaboratorModal } from './InviteCollaboratorModal'
import { Clock, MoreVertical, Trash2, RotateCcw, UserPlus } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProjectAction, restoreProjectAction } from '@/lib/backend/actions/projects/delete'
import { toast } from 'sonner'

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  createdAt?: Date
  ownerId: string
  deleted_at?: string | null
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
  members: { id: string; name: string }[]
  tags?: string[]
  currentUser?: { id: string; name: string } | null
}


export function ProjectCard({ project, role, isOwner = false, members, tags, currentUser }: ProjectCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isMenuOpen])

  const handleDelete = async () => {
    toast.info('La funcionalidad de papelera se habilitará pronto')
  }

  const handleRestore = async () => {
    toast.info('La funcionalidad de restauración se habilitará pronto')
  }

  return (
    <Link href={`/editor/${project.id}`} className="block h-full">
      <Card className="h-full flex flex-col bg-gray-900 group relative rounded-xl overflow-hidden border border-gray-800 hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/20 transition-all duration-200 cursor-pointer">
        {/* PORTADA CON GRADIENTE Y BADGES ABSOLUTOS */}
        <div className="relative h-28 bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900 flex items-end p-3 overflow-hidden">
          {/* Grid pattern background */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              opacity: 0.3,
            }}
          />
          
          {/* Badge Plan (esquina superior izquierda) */}
          <div className="absolute top-2 left-2 z-10">
            <div className={`text-xs font-medium px-2.5 py-1 rounded-full ${
              role === 'owner' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-600 text-gray-200'
            }`}>
              {role === 'owner' ? 'Pro' : 'Free'}
            </div>
          </div>

          {/* MENÚ DE 3 PUNTOS (reemplaza botón Invitar) */}
          {role === 'owner' && (
            <div 
              className="absolute top-2 right-2 z-20"
              ref={menuRef}
            >
              {/* Botón MoreVertical */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsMenuOpen(!isMenuOpen)
                }}
                className="p-1.5 rounded-full bg-black/40 hover:bg-black/60 transition-colors text-gray-300 hover:text-white"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-50 min-w-40 rounded-lg bg-gray-900 border border-gray-700 shadow-xl py-1">
                  <>
                    {/* Opción: Invitar Colaborador */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsMenuOpen(false)
                        setIsInviteOpen(true)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      <UserPlus size={16} />
                      Invitar colaborador
                    </button>

                    {/* Opción: Eliminar Proyecto */}
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setIsMenuOpen(false)
                        handleDelete()
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors"
                    >
                      <Trash2 size={16} />
                      Eliminar proyecto
                    </button>
                  </>
                </div>
              )}
            </div>
          )}

          {/* Nombre del proyecto (en la portada, parte inferior) */}
          <h3 className="text-white font-bold text-base leading-tight z-10 relative">
            {project.name}
          </h3>
        </div>

        <CardContent className="flex-grow pb-2 px-3 pt-3">
          {/* Description */}
          {project.description && (
            <p className="text-sm text-gray-400 line-clamp-2 mb-2">
              {project.description}
            </p>
          )}
          
          {/* Tags si existen */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {tags.slice(0, 2).map(tag => (
                <span key={tag} className="text-xs px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: getTagColor(tag) + '22',
                    color: getTagColor(tag),
                    border: `1px solid ${getTagColor(tag)}33`,
                  }}>
                  {tag}
                </span>
              ))}
              {tags.length > 2 && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-gray-800 text-gray-400">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="p-3 bg-gray-800/50 border-t border-gray-700 mt-auto">
          <div className="flex items-center justify-between w-full">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
              isOwner 
                ? 'bg-green-900/50 text-green-300 border-green-800'
                : 'bg-purple-900/50 text-purple-300 border-purple-800'
            }`}>
              {isOwner ? 'Propietario' : 'Colaborador'}
            </span>

            <div className="flex items-center gap-1 text-gray-400 text-xs">
              <Clock size={14} />
              <span>Hace {getRelativeDate(project.updatedAt ?? project.createdAt)}</span>
            </div>
          </div>
        </CardFooter>

        {/* InviteCollaboratorModal controlado por estado */}
        {isInviteOpen && (
          <InviteCollaboratorModal 
            projectId={project.id} 
            open={isInviteOpen}
            onOpenChange={setIsInviteOpen}
          />
        )}
      </Card>
    </Link>
  )
}
