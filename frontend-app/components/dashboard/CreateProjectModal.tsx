'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { createProjectAction } from '@/lib/backend/actions/projects/create'
import { Plus } from 'lucide-react'
import { TagInput } from '@/components/ui/TagInput'

export function CreateProjectModal() {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)
  const [tags, setTags] = useState<string[]>([])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    // append tags as JSON
    formData.set('tags', JSON.stringify(tags))
    const result = await createProjectAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      setOpen(false)
      setIsPending(false)
      setTags([])
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button id="create-project-btn" className="bg-[#1A6CF6] hover:bg-blue-700 text-white shadow-lg shadow-[#1A6CF6]/20 transition-all hover:-translate-y-[1px]">
          <Plus className="w-4 h-4 mr-2" />
          Crear Proyecto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#111827] border-[#1E2A45] text-[#E2E8F0] p-6 shadow-xl shadow-black/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nuevo Proyecto</DialogTitle>
          <DialogDescription className="text-[#94A3B8]">
            Ingresa los detalles para tu nuevo diagrama de base de datos.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-[#94A3B8] font-medium">Nombre <span className="text-red-400">*</span></Label>
            <Input 
              id="name" 
              name="name" 
              required 
              maxLength={50}
              placeholder="Ej. Sistema de Ventas"
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] focus-visible:border-[#1A6CF6] text-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-[#94A3B8] font-medium">Descripción (opcional)</Label>
            <Textarea 
              id="description" 
              name="description" 
              maxLength={200}
              placeholder="Un breve resumen del proyecto..."
              className="bg-[#0A0F1E] border-[#1E2A45] focus-visible:ring-[#1A6CF6] focus-visible:border-[#1A6CF6] text-white resize-none"
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#94A3B8] font-medium">
              Tags <span style={{ color: '#6B7280' }}>(opcional)</span>
            </Label>
            <TagInput value={tags} onChange={setTags} />
          </div>
          {error && (
            <div className="bg-red-900/20 border border-red-900/50 p-3 rounded-md">
              <p className="text-red-400 text-sm font-medium">{error}</p>
            </div>
          )}
          <div className="flex justify-end gap-3 pt-4 border-t border-[#1E2A45] mt-6">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => setOpen(false)}
              className="hover:bg-[#1E2A45] hover:text-white text-[#94A3B8]"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isPending}
              className="bg-[#1A6CF6] hover:bg-blue-700 text-white min-w-[140px]"
            >
              {isPending ? 'Creando...' : 'Crear Proyecto'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
