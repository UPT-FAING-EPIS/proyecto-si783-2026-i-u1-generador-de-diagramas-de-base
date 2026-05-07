"use client"

import { useEffect, useRef, useState } from "react"
import { useReactFlow } from "@xyflow/react"
import { toPng, toSvg } from "html-to-image"
import { toMermaid } from "@/lib/parsers"
import { useEditorStore } from "@/store/useEditorStore"
import { serializeAllDialects, serializeSchema, type EditorDialect } from "@/lib/editor-schema"
import { toast } from "sonner"
import type { FlowNode } from "@/lib/parsers"

interface ExportMenuProps {
  projectName: string
}

function isMermaidNode(node: unknown): node is FlowNode {
  if (!node || typeof node !== 'object') return false
  const candidate = node as Partial<FlowNode>
  return typeof candidate.id === 'string' && candidate.data !== undefined && typeof candidate.data.tableName === 'string' && Array.isArray(candidate.data.columns)
}

function downloadText(content: string, fileName: string, type = 'text/plain') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}

export function ExportMenu({ projectName }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const { fitView, getNodes } = useReactFlow()
  const menuRef = useRef<HTMLDivElement>(null)
  const safeName = projectName.toLowerCase().replace(/\s+/g, '-')

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getCanvasNode = (): HTMLElement | null => {
    return document.querySelector('.react-flow__viewport') as HTMLElement || document.querySelector('.react-flow__renderer') as HTMLElement
  }

  async function handleExportImage(kind: 'png' | 'svg') {
    setOpen(false)
    const canvas = getCanvasNode()
    if (!canvas) return

    await fitView({ duration: 200, padding: 0.2 })
    await new Promise(r => setTimeout(r, 250))

    const dataUrl = kind === 'png'
      ? await toPng(canvas, { backgroundColor: '#0A0F1E', pixelRatio: 2, filter: filterChrome })
      : await toSvg(canvas, { backgroundColor: '#0A0F1E', filter: filterChrome })

    const a = document.createElement('a')
    a.href = dataUrl
    a.download = `${safeName}-diagrama.${kind}`
    a.click()
  }

  function filterChrome(node: HTMLElement) {
    if (node.classList?.contains('react-flow__controls')) return false
    if (node.classList?.contains('react-flow__minimap')) return false
    return true
  }

  function handleExportSql(dialect: EditorDialect | 'all') {
    setOpen(false)
    const { nodes } = useEditorStore.getState()
    if (dialect === 'all') {
      const all = serializeAllDialects(nodes)
      downloadText(
        Object.entries(all).map(([name, content]) => `-- ${name.toUpperCase()}\n${content}`).join('\n\n'),
        `${safeName}-sql-todos-los-dialectos.sql`
      )
      toast.success('SQL exportado para todos los dialectos')
      return
    }
    const extension = dialect === 'json' ? 'json' : 'sql'
    downloadText(serializeSchema(nodes, dialect), `${safeName}-${dialect}.${extension}`, dialect === 'json' ? 'application/json' : 'text/sql')
    toast.success(`Exportado como ${dialect}`)
  }

  async function handleCopyMermaid() {
    setOpen(false)
    const { nodes, edges } = useEditorStore.getState()
    const result = toMermaid(nodes.filter(isMermaidNode), edges)
    if (result.isEmpty) {
      toast.warning("No hay entidades en el canvas para exportar")
      return
    }
    await navigator.clipboard.writeText(result.code).catch(() => {
      const ta = document.createElement('textarea')
      ta.value = result.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    })
    toast.success("Código Mermaid copiado")
  }

  if (getNodes().length === 0) return null

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-lg border border-[#2A3B5D] bg-[#1E2A45] px-3 py-2 text-xs text-white transition-colors hover:bg-[#2A3B5D]"
      >
        Exportar
      </button>

      {open && (
        <div className="absolute right-0 top-full z-[80] mt-2 w-56 overflow-hidden rounded-xl border border-[#1E2A45] bg-[#111827] shadow-2xl shadow-black/40">
          <MenuButton onClick={() => handleExportImage('png')}>Exportar PNG</MenuButton>
          <MenuButton onClick={() => handleExportImage('svg')}>Exportar SVG</MenuButton>
          <MenuButton onClick={() => handleExportSql('postgresql')}>SQL PostgreSQL</MenuButton>
          <MenuButton onClick={() => handleExportSql('mysql')}>SQL MySQL</MenuButton>
          <MenuButton onClick={() => handleExportSql('sqlserver')}>SQL Server</MenuButton>
          <MenuButton onClick={() => handleExportSql('json')}>JSON</MenuButton>
          <MenuButton onClick={() => handleExportSql('all')}>Todos los dialectos</MenuButton>
          <MenuButton onClick={handleCopyMermaid}>Copiar Mermaid</MenuButton>
        </div>
      )}
    </div>
  )
}

function MenuButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button onClick={onClick} className="w-full border-b border-[#1E2A45] px-3 py-2 text-left text-xs text-[#E2E8F0] transition-colors last:border-b-0 hover:bg-[#1E2A45]">
      {children}
    </button>
  )
}
