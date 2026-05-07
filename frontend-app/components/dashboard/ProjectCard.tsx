import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { InviteCollaboratorModal } from './InviteCollaboratorModal'
import { Crown, Edit3 } from 'lucide-react'
import { getRelativeDate } from '@/lib/relativeDate'
import { getTagColor } from '@/components/ui/TagInput'
import { PresenceDot } from './PresenceDot'

const GRADIENTS = [
  'from-blue-500/20 via-transparent to-purple-500/20',
  'from-emerald-500/20 via-transparent to-blue-500/20',
  'from-amber-500/20 via-transparent to-red-500/20',
  'from-purple-500/20 via-transparent to-cyan-500/20',
  'from-red-500/20 via-transparent to-amber-500/20',
  'from-cyan-500/20 via-transparent to-emerald-500/20',
]

function getGradient(id: string): string {
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash + id.charCodeAt(i)) | 0
  }
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length]
}

interface Project {
  id: string
  name: string
  description: string | null
  updatedAt: Date
  createdAt?: Date
  ownerId: string
}

interface ProjectCardProps {
  project: Project
  role: string
  isOwner?: boolean
  members: { id: string; name: string }[]
  tags?: string[]
  currentUser?: { id: string; name: string } | null
}

function getAvatarColor(name: string): string {
  const colors = ['#1A6CF6','#10B981','#8B5CF6','#F59E0B','#EF4444','#06B6D4']
  let h = 0
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0
  return colors[Math.abs(h) % colors.length]
}

function getInitials(name: string): string {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

function CollaboratorAvatars({ members }: { members: { id: string, name: string }[] }) {
  const MAX = 3
  const visible = members.slice(0, MAX)
  const extra = members.length - MAX
  return (
    <div className="flex items-center">
      {visible.map((m, i) => (
        <div key={m.id}
          className="w-6 h-6 rounded-full flex items-center justify-center text-white border-2 flex-shrink-0"
          style={{
            backgroundColor: getAvatarColor(m.name || 'Unknown'),
            borderColor: '#0D1117',
            marginLeft: i === 0 ? 0 : '-6px',
            fontSize: '9px',
            fontWeight: 700,
            zIndex: MAX - i,
            position: 'relative',
          }}>
          {getInitials(m.name || 'U')}
        </div>
      ))}
      {extra > 0 && (
        <div className="w-6 h-6 rounded-full flex items-center justify-center border-2 flex-shrink-0"
          style={{
            backgroundColor: '#1E2A45',
            borderColor: '#0D1117',
            marginLeft: '-6px',
            fontSize: '9px',
            fontWeight: 700,
            color: '#9CA3AF',
            position: 'relative',
          }}>
          +{extra}
        </div>
      )}
    </div>
  )
}

export function ProjectCard({ project, role, isOwner = false, members, tags, currentUser }: ProjectCardProps) {
  return (
    <Link href={`/editor/${project.id}`} className="block h-full">
      <Card className="h-full flex flex-col bg-[#111827] border-[#1E2A45] text-[#E2E8F0] hover:border-[#1A6CF6] hover:shadow-lg hover:shadow-[#1A6CF6]/10 transition-all duration-200 group cursor-pointer hover:-translate-y-1 overflow-hidden">
        {/* Visual thumbnail header */}
        <div className={`h-24 bg-gradient-to-br ${getGradient(project.id)} relative overflow-hidden`}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.05) 1px, transparent 1px)',
              backgroundSize: '16px 16px',
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl opacity-10 select-none">⬡</span>
          </div>
        </div>

        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 pt-3">
          <CardTitle className="text-xl font-bold font-semibold text-white leading-snug pr-4">{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            {role === 'owner' && (
              <div onClick={(e) => e.preventDefault()}>
                <InviteCollaboratorModal projectId={project.id} />
              </div>
            )}
            <Badge className="bg-[#00D4FF]/20 text-[#00D4FF] hover:bg-[#00D4FF]/30 border-0 pointer-events-none whitespace-nowrap">
              {role === 'owner' ? 'Propietario' : role === 'editor' ? 'Editor' : 'Lector'}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="flex-grow pb-2">
          <p className="text-sm text-[#94A3B8] line-clamp-2">
            {project.description || 'Sin descripción'}
          </p>
          {/* Role badge */}
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full"
              style={{
                backgroundColor: isOwner ? 'rgba(26,108,246,0.1)' : 'rgba(107,114,128,0.1)',
                color: isOwner ? '#1A6CF6' : '#6B7280',
              }}
            >
              {isOwner ? <Crown size={10} /> : <Edit3 size={10} />}
              {isOwner ? 'Propietario' : 'Editor'}
            </span>
          </div>
          {/* Tags */}
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
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
                <span className="text-xs px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: '#1E2A45', color: '#6B7280' }}>
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-3 mt-auto w-full">
          <div className="flex items-center justify-between mt-3 pt-3 w-full"
               style={{ borderTop: '1px solid #1E2A45' }}>
            <div className="flex items-center gap-2">
              <CollaboratorAvatars members={members ?? []} />
              <PresenceDot projectId={project.id} currentUser={currentUser ?? null} />
            </div>
            <span className="text-xs" style={{ color: '#6B7280' }}>
              Actualizado {getRelativeDate(project.updatedAt ?? project.createdAt)}
            </span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
