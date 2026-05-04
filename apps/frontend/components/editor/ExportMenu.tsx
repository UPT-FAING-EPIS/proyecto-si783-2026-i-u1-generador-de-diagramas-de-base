"use client"
import { useEffect, useRef, useState } from "react"
import { useReactFlow } from "@xyflow/react"
import { toPng, toSvg } from "html-to-image"
import { toMermaid } from "@fluxsql/parsers"
import { useEditorStore } from "@/store/useEditorStore"
import { toast } from "sonner"

interface ExportMenuProps {
  projectName: string
}

export function ExportMenu({ projectName }: ExportMenuProps) {
  const [open, setOpen] = useState(false)
  const { fitView, getNodes } = useReactFlow()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Selector del DOM del canvas de React Flow
  const getCanvasNode = (): HTMLElement | null => {
    return document.querySelector('.react-flow__viewport') as HTMLElement || document.querySelector('.react-flow__renderer') as HTMLElement
  }

  async function handleExportPng() {
    setOpen(false)
    const canvas = getCanvasNode()
    if (!canvas) return

    // fitView primero para asegurar que todo es visible
    await fitView({ duration: 200, padding: 0.2 })
    await new Promise(r => setTimeout(r, 250))  // Esperar animación

    const dataUrl = await toPng(canvas, {
      backgroundColor: '#0A0F1E',
      pixelRatio: 2,  // 2x para alta resolución
      filter: (node) => {
        // Ocultar controles de React Flow en la imagen
        if (node.classList?.contains('react-flow__controls')) return false
        if (node.classList?.contains('react-flow__minimap')) return false
        return true
      }
    })

    const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-diagrama.png`
    downloadDataUrl(dataUrl, fileName)
  }

  async function handleExportSvg() {
    setOpen(false)
    const canvas = getCanvasNode()
    if (!canvas) return

    await fitView({ duration: 200, padding: 0.2 })
    await new Promise(r => setTimeout(r, 250))

    const dataUrl = await toSvg(canvas, {
      backgroundColor: '#0A0F1E',
      filter: (node) => {
        if (node.classList?.contains('react-flow__controls')) return false
        if (node.classList?.contains('react-flow__minimap')) return false
        return true
      }
    })

    const fileName = `${projectName.toLowerCase().replace(/\s+/g, '-')}-diagrama.svg`
    downloadDataUrl(dataUrl, fileName)
  }

  async function handleCopyMermaid() {
    setOpen(false)
    const { nodes, edges } = useEditorStore.getState()
    const result = toMermaid(nodes as any, edges as any)

    if (result.isEmpty) {
      toast.warning("No hay entidades en el canvas para exportar")
      return
    }

    try {
      await navigator.clipboard.writeText(result.code)
    } catch {
      // Fallback sin permisos de clipboard:
      const ta = document.createElement('textarea')
      ta.value = result.code
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    toast.success("Código Mermaid copiado al portapapeles")
  }

  function downloadDataUrl(dataUrl: string, fileName: string) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = fileName
    a.click()
  }

  if (getNodes().length === 0) return null  // No mostrar si el canvas está vacío

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="bg-[#1E2A45] hover:bg-[#2A3B5D] text-white px-3 py-1.5 rounded text-sm transition-colors border border-[#2A3B5D] flex items-center gap-1"
      >
        Exportar ▾
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-[#111827] border border-[#1E2A45] rounded shadow-lg z-50 min-w-[140px]">
          <button
            onClick={handleExportPng}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E2A45] transition-colors"
          >
            📸 Exportar PNG
          </button>
          <button
            onClick={handleExportSvg}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E2A45] transition-colors border-t border-[#1E2A45]"
          >
            🖼️ Exportar SVG
          </button>
          <button
            onClick={handleCopyMermaid}
            className="w-full text-left px-3 py-2 text-sm text-white hover:bg-[#1E2A45] transition-colors border-t border-[#1E2A45]"
          >
            📋 Copiar Mermaid
          </button>
        </div>
      )}
    </div>
  )
}
