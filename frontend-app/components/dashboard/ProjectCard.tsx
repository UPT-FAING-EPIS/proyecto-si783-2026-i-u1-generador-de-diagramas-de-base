'use client'

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { InviteCollaboratorModal } from './InviteCollaboratorModal'
import { Clock, MoreVertical, Trash2, RotateCcw, UserPlus, Pencil, Link as LinkIcon } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProjectAction, restoreProjectAction } from '@/lib/backend/actions/projects/delete'
import { renameProject } from '@/lib/backend/actions/projects/update'
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
  const [isProcessing, setIsProcessing] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isRenaming, setIsRenaming] = useState(false)
  const [newName, setNewName] = useState(project.name)
  const [copied, setCopied] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
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
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }

    setIsProcessing(true)
    const result = await deleteProjectAction(project.id)
    setIsProcessing(false)
    setIsMenuOpen(false)
    setShowDeleteConfirm(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto movido a la papelera')
      router.refresh()
    }
  }

  const handleRename = async () => {
    if (!isRenaming) {
      setIsRenaming(true)
      setIsMenuOpen(false)
      return
    }

    if (!newName.trim()) {
      toast.error('El nombre del proyecto no puede estar vacío')
      return
    }

    setIsProcessing(true)
    const result = await renameProject(project.id, newName.trim())
    setIsProcessing(false)
    setIsRenaming(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto renombrado correctamente')
      router.refresh()
    }
  }

  const handleCopyLink = async () => {
    const publicLink = `${window.location.origin}/public/${project.id}`
    
    try {
      await navigator.clipboard.writeText(publicLink)
      setCopied(true)
      toast.success('✓ Link copiado')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Error al copiar el link')
    }
    setIsMenuOpen(false)
  }

  const handleRestore = async () => {
    setIsProcessing(true)
    const result = await restoreProjectAction(project.id)
    setIsProcessing(false)
    setIsMenuOpen(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Proyecto restaurado correctamente')
      router.refresh()
    }
  }

  const handleDeletePermanent = async () => {
    // TODO: Implementar eliminación permanente cuando se requiera
    toast.info('Función de eliminación permanente próximamente')
    setIsMenuOpen(false)
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
                disabled={isProcessing}
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <div className="absolute right-0 top-8 z-50 min-w-40 rounded-lg bg-gray-900 border border-gray-700 shadow-xl py-1">
                  {project.deleted_at === null ? (
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

                      {/* Opción: Renombrar Proyecto */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setIsMenuOpen(false)
                          setIsRenaming(true)
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <Pencil size={16} />
                        Renombrar proyecto
                      </button>

                      {/* Opción: Copiar Link Público */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCopyLink()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                      >
                        <LinkIcon size={16} />
                        Copiar link público
                      </button>

                      {/* Separador */}
                      <div className="border-t border-gray-700 my-1"></div>
                      {showDeleteConfirm ? (
                        <div className="px-4 py-2 text-sm">
                          <p className="text-gray-300 mb-2">¿Mover a papelera?</p>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                setShowDeleteConfirm(false)
                                setIsMenuOpen(false)
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                            >
                              Cancelar
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                handleDelete()
                              }}
                              className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors disabled:opacity-50"
                              disabled={isProcessing}
                            >
                              {isProcessing ? 'Eliminando...' : 'Confirmar'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDelete()
                          }}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors"
                        >
                          <Trash2 size={16} />
                          Eliminar proyecto
                        </button>
                      )}
                    </>
                  ) : (
                    <>
                      {/* Opción: Restaurar Proyecto */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleRestore()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-400 hover:bg-green-950/40 transition-colors disabled:opacity-50"
                        disabled={isProcessing}
                      >
                        <RotateCcw size={16} />
                        {isProcessing ? 'Restaurando...' : 'Restaurar proyecto'}
                      </button>

                      {/* Separador */}
                      <div className="border-t border-gray-700 my-1"></div>

                      {/* Opción: Eliminar Permanente */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          handleDeletePermanent()
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-red-950/40 transition-colors"
                      >
                        <Trash2 size={16} />
                        Eliminar permanente
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Input inline para renombrar */}
          {isRenaming && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-30 rounded-xl">
              <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 w-80">
                <input
                  ref={inputRef}
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleRename()
                    } else if (e.key === 'Escape') {
                      e.preventDefault()
                      setIsRenaming(false)
                      setNewName(project.name)
                    }
                  }}
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
                  placeholder="Nuevo nombre del proyecto"
                  autoFocus
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => {
                      setIsRenaming(false)
                      setNewName(project.name)
                    }}
                    className="flex-1 px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleRename}
                    className="flex-1 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Nombre del proyecto (en la portada, parte inferior) */}
          {!isRenaming && (
            <h3 className="text-white font-bold text-base leading-tight z-10 relative">
              {project.name}
            </h3>
          )}
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
