'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'

// CRITICAL: ssr: false — Monaco uses browser APIs
const DiffEditor = dynamic(
  () => import('@monaco-editor/react').then((m) => m.DiffEditor),
  { 
    ssr: false, 
    loading: () => <div className="h-96 w-full bg-[#1E1E1E] animate-pulse rounded" /> 
  }
)

interface DiffViewerModalProps {
  open: boolean
  onClose: () => void
  originalCode: string
  modifiedCode: string
  versionLabel: string
}

export function DiffViewerModal({
  open,
  onClose,
  originalCode,
  modifiedCode,
  versionLabel,
}: DiffViewerModalProps) {
  const { resolvedTheme } = useTheme()
  const hasDiff = originalCode.trim() !== modifiedCode.trim()

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="max-w-5xl w-full bg-[#111827] border-[#1E2A45] text-white p-0 gap-0 h-[80vh] flex flex-col">
        <DialogHeader className="p-4 border-b border-[#1E2A45]">
          <DialogTitle className="font-mono text-[#E2E8F0] font-normal text-sm flex items-center">
            Comparando: <span className="text-[#1A6CF6] font-bold ml-2">{versionLabel}</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 bg-[#1E1E1E] relative overflow-hidden">
          {!hasDiff ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-[#94A3B8]">
              <CheckCircle2 className="w-12 h-12 text-[#10B981] mb-4" />
              <p className="text-lg">No hay diferencias estructurales en el DDL entre estas versiones</p>
            </div>
          ) : (
            <DiffEditor
              original={originalCode}
              modified={modifiedCode}
              language="sql"
              theme={resolvedTheme === 'dark' ? 'vs-dark' : 'light'}
              options={{
                readOnly: true,
                renderSideBySide: true,
                minimap: { enabled: false },
                fontSize: 13,
                scrollBeyondLastLine: false,
                padding: { top: 12 },
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
