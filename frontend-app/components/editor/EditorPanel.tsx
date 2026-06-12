'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import { useEditorStore } from '@/store/useEditorStore'
import { useSyncEditor } from '@/hooks/useSyncEditor'
import type { Edge, Node } from '@xyflow/react'
import type { EditorDialect } from '@/lib/editor-schema'

const MonacoEditor = dynamic(
  () => import('@monaco-editor/react'),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full animate-pulse items-center justify-center bg-white">
        <span className="text-sm text-slate-400">Cargando editor...</span>
      </div>
    ),
  }
)

interface EditorPanelProps {
  mode: EditorDialect
  emitSqlChange?: (nodes: Node[], edges: Edge[]) => void
}

export function EditorPanel({ mode, emitSqlChange }: EditorPanelProps) {
  const { sqlValue, setSqlValue } = useEditorStore()
  const { resolvedTheme } = useTheme()
  useSyncEditor(mode, emitSqlChange)

  return (
    <div className="flex h-full w-full flex-col bg-white border-r border-slate-200">
      <div className="flex shrink-0 items-center border-b border-slate-200 bg-slate-50 px-4 py-2">
        <span className="font-mono text-xs text-slate-700 font-semibold">schema.{mode === 'json' ? 'json' : 'sql'}</span>
        <span className="ml-auto rounded-md border border-slate-200 bg-white px-2 py-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
          {mode}
        </span>
      </div>

      <div className="flex-1 overflow-hidden">
        <MonacoEditor
          height="100%"
          language={mode === 'json' ? 'json' : 'sql'}
          theme="light"
          value={sqlValue}
          onChange={(value) => setSqlValue(value ?? '')}
          options={{
            minimap: { enabled: false },
            fontSize: 13,
            fontFamily: "'JetBrains Mono', 'Cascadia Code', 'Fira Code', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            tabSize: 2,
            renderLineHighlight: 'line',
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    </div>
  )
}
