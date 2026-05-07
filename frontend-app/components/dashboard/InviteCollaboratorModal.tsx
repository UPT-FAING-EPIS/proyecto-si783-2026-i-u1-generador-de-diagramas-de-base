'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { inviteCollaboratorAction } from '@/lib/backend/actions/projects/invite'
import { UserPlus, Trash2 } from 'lucide-react'
import { deleteProjectAction } from '@/lib/backend/actions/projects/delete'
import { useRouter } from 'next/navigation'

interface InviteCollaboratorModalProps {
  projectId: string
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function InviteCollaboratorModal({ 
  projectId, 
  open: externalOpen, 
  onOpenChange 
}: InviteCollaboratorModalProps) {
  const [localOpen, setLocalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : localOpen
  const setOpen = (newOpen: boolean) => {
    setLocalOpen(newOpen)
    onOpenChange?.(newOpen)
  }
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation() // Prevent link navigation
    if (!email.trim() || loading) return

    setLoading(true)
    const result = await inviteCollaboratorAction(projectId, email)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(result.message)
      setOpen(false)
      setEmail('')
    }
  }

  const handleDeleteProject = async () => {
    if (deleting || !window.confirm('¿Mover este proyecto a la papelera?')) return
    setDeleting(true)
    const result = await deleteProjectAction(projectId)
    setDeleting(false)

    if (result.error) {
      toast.error(result.error)
      return
    }

    toast.success(result.message)
    setOpen(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[#94A3B8] hover:text-white hover:bg-[#1E2A45] px-2 h-7"
          onClick={(e) => e.stopPropagation()} // Prevent card link navigation
        >
          <UserPlus className="w-4 h-4 mr-1" />
          <span className="text-xs">Invitar</span>
        </Button>
      </DialogTrigger>
      <DialogContent 
        className="bg-[#111827] border-[#1E2A45] text-white sm:max-w-[425px]"
        onClick={(e) => e.stopPropagation()} // Prevent card link navigation
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -8 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        >
          <DialogHeader>
            <DialogTitle>Invitar Colaborador</DialogTitle>
            <DialogDescription className="text-[#94A3B8]">
              Ingresa el email del usuario que deseas invitar a este proyecto.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInvite}>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6]"
                  disabled={loading}
                />
              </div>
            </div>
            <DialogFooter>
              <div className="flex w-full flex-col gap-2">
                <Button
                  type="submit"
                  disabled={loading || email.trim() === ''}
                  className="bg-[#1A6CF6] hover:bg-[#1A6CF6]/90 text-white w-full"
                >
                  {loading ? 'Invitando...' : 'Enviar invitacion'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  disabled={deleting}
                  onClick={handleDeleteProject}
                  className="w-full border-red-500/30 bg-red-500/10 text-red-200 hover:bg-red-500/20 hover:text-white"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {deleting ? 'Eliminando...' : 'Eliminar proyecto'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
