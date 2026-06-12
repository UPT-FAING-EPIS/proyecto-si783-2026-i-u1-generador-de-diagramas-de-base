'use client'

import { Database, KeyRound, Link2 } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { isEditorNode } from '@/lib/editor-schema'

export function SchemaInspector() {
  const nodes = useEditorStore((state) => state.nodes)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)
  const tables = nodes.filter(isEditorNode)
  const selected = tables.find((node) => node.id === selectedNodeId) ?? tables[0]

  if (!selected) {
    return <p className="p-4 text-sm text-[#94A3B8]">No hay tablas en este snapshot.</p>
  }

  return (
    <aside className="h-full overflow-y-auto bg-[#0D1424] p-4 text-white">
      <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">Esquema de solo lectura</p>
      <select
        value={selected.id}
        onChange={(event) => setSelectedNodeId(event.target.value)}
        className="mt-3 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm font-semibold"
      >
        {tables.map((table) => <option key={table.id} value={table.id}>{table.data.tableName}</option>)}
      </select>

      <div className="mt-4 flex items-center gap-2 rounded-lg border border-[#1A6CF6]/25 bg-[#1A6CF6]/10 p-3 text-xs text-[#BFDBFE]">
        <Database size={15} />
        La estructura proviene de la base de datos. Usa Actualizar desde BD para sincronizar cambios.
      </div>

      <div className="mt-5 space-y-2">
        {selected.data.columns.map((column) => (
          <div key={column.name} className="rounded-lg border border-[#1E2A45] bg-[#111827]/80 p-3">
            <div className="flex items-center gap-2">
              {column.isPrimaryKey && <KeyRound size={13} className="text-amber-300" />}
              {column.isForeignKey && <Link2 size={13} className="text-blue-300" />}
              <span className="font-mono text-xs font-semibold text-white">{column.name}</span>
              <span className="ml-auto font-mono text-[11px] text-[#94A3B8]">{column.type}</span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B]">
              {column.nullable === false ? 'NOT NULL' : 'NULL'}
              {column.references && ` · FK → ${column.references.table}.${column.references.column}`}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
