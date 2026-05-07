'use client'

import { useState } from 'react'
import { Link2, Plus, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/useEditorStore'
import { DEFAULT_TABLE_COLOR, isEditorNode, type EditorNode } from '@/lib/editor-schema'

const DATA_TYPES = ['SERIAL', 'UUID', 'INT', 'VARCHAR(100)', 'TEXT', 'DECIMAL(10,2)', 'DATE', 'TIMESTAMP', 'BOOLEAN', 'JSONB']

export function EditorInspector() {
  const nodes = useEditorStore((state) => state.nodes)
  const edges = useEditorStore((state) => state.edges)
  const selectedNodeId = useEditorStore((state) => state.selectedNodeId)
  const setSelectedNodeId = useEditorStore((state) => state.setSelectedNodeId)
  const addTable = useEditorStore((state) => state.addTable)
  const updateTable = useEditorStore((state) => state.updateTable)
  const deleteTable = useEditorStore((state) => state.deleteTable)
  const addColumn = useEditorStore((state) => state.addColumn)
  const updateColumn = useEditorStore((state) => state.updateColumn)
  const deleteColumn = useEditorStore((state) => state.deleteColumn)
  const addRelationship = useEditorStore((state) => state.addRelationship)

  const tables = nodes.filter(isEditorNode)
  const selected = tables.find((node) => node.id === selectedNodeId) ?? tables[0]

  if (!selected) {
    return (
      <aside className="h-full min-h-0 w-full overflow-y-auto border-l border-[#1E2A45] bg-[#0D1424]/95 p-4 text-white">
        <h2 className="text-lg font-semibold">Inspector</h2>
        <p className="mt-2 text-sm text-[#94A3B8]">Aún no hay tablas. Crea una para empezar a modelar sin escribir SQL.</p>
        <button onClick={addTable} className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#1A6CF6] px-3 py-2 text-sm font-medium text-white">
          <Plus size={14} />
          Agregar tabla
        </button>
      </aside>
    )
  }

  return (
    <aside className="flex h-full min-h-0 w-full flex-col overflow-y-auto border-l border-[#1E2A45] bg-[#0D1424]/95 text-white">
      <div className="shrink-0 border-b border-[#1E2A45] bg-[#0D1424] p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-[#64748B]">Inspector</p>
        <select
          value={selected.id}
          onChange={(event) => setSelectedNodeId(event.target.value)}
          className="mt-2 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm font-semibold text-white outline-none focus:border-[#1A6CF6]"
        >
          {tables.map((table) => <option key={table.id} value={table.id}>{table.data.tableName}</option>)}
        </select>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 pr-3 [scrollbar-color:#1E2A45_transparent]">
        <div className="space-y-5 pb-24">
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Propiedades</h3>
              <button onClick={() => deleteTable(selected.id)} className="rounded-lg border border-red-500/20 p-2 text-red-300 hover:bg-red-500/10" title="Eliminar tabla">
                <Trash2 size={15} />
              </button>
            </div>
            <TextField label="Nombre de tabla" value={selected.data.tableName} onChange={(value) => updateTable(selected.id, { tableName: value || 'sin_nombre' })} />
            <label className="block text-xs text-[#94A3B8]">
              Comentario
              <textarea
                value={selected.data.comment ?? ''}
                onChange={(event) => updateTable(selected.id, { comment: event.target.value })}
                placeholder="Describe esta tabla..."
                className="mt-1 min-h-16 w-full resize-none rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#1A6CF6]"
              />
            </label>
            <label className="block text-xs text-[#94A3B8]">
              Color
              <input type="color" value={selected.data.color ?? DEFAULT_TABLE_COLOR} onChange={(event) => updateTable(selected.id, { color: event.target.value })} className="mt-1 h-9 w-16 rounded-lg border border-[#1E2A45] bg-[#111827] p-1" />
            </label>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Campos ({selected.data.columns.length})</h3>
              <button onClick={() => addColumn(selected.id)} className="rounded-lg border border-[#1E2A45] p-1.5 text-[#94A3B8] hover:text-white">
                <Plus size={14} />
              </button>
            </div>

            {selected.data.columns.map((column, index) => (
              <div key={`${selected.id}-${index}`} className="rounded-xl border border-[#1E2A45] bg-[#111827]/80 p-3">
                <div className="flex items-center gap-2">
                  <input value={column.name} onChange={(event) => updateColumn(selected.id, index, { name: event.target.value || `campo_${index + 1}` })} className="min-w-0 flex-1 rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]" />
                  <select value={column.type} onChange={(event) => updateColumn(selected.id, index, { type: event.target.value })} className="w-32 rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]">
                    {DATA_TYPES.map((type) => <option key={type}>{type}</option>)}
                  </select>
                  <button onClick={() => deleteColumn(selected.id, index)} className="rounded-md p-1.5 text-[#64748B] hover:bg-red-500/10 hover:text-red-300">
                    <Trash2 size={13} />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-[11px] text-[#94A3B8]">
                  <FancyCheck label="Primaria" checked={Boolean(column.isPrimaryKey)} onChange={(checked) => updateColumn(selected.id, index, { isPrimaryKey: checked })} />
                  <FancyCheck label="Nulo" checked={column.nullable !== false} onChange={(checked) => updateColumn(selected.id, index, { nullable: checked })} />
                  <FancyCheck label="Foránea" checked={Boolean(column.isForeignKey)} onChange={(checked) => updateColumn(selected.id, index, { isForeignKey: checked })} />
                </div>
                <input value={column.defaultValue ?? ''} onChange={(event) => updateColumn(selected.id, index, { defaultValue: event.target.value })} placeholder="DEFAULT opcional" className="mt-2 w-full rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]" />
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#E2E8F0]">Relaciones ({edges.length})</h3>
            </div>
            <RelationBuilder key={selected.id} selected={selected} tables={tables} onAdd={addRelationship} />
          </section>
        </div>
      </div>
    </aside>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="block text-xs text-[#94A3B8]">
      {label}
      <input value={value} onChange={(event) => onChange(event.target.value)} className="mt-1 w-full rounded-lg border border-[#1E2A45] bg-[#111827] px-3 py-2 text-sm text-white outline-none focus:border-[#1A6CF6]" />
    </label>
  )
}

function FancyCheck({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className={`flex cursor-pointer items-center justify-center gap-1 rounded-lg border px-2 py-1.5 transition ${checked ? 'border-[#1A6CF6]/50 bg-[#1A6CF6]/15 text-[#BFDBFE]' : 'border-[#1E2A45] bg-[#0A0F1E] text-[#94A3B8]'}`}>
      <input className="sr-only" type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={`h-3 w-3 rounded border ${checked ? 'border-[#1A6CF6] bg-[#1A6CF6]' : 'border-[#475569]'}`} />
      {label}
    </label>
  )
}

function RelationBuilder({
  selected,
  tables,
  onAdd,
}: {
  selected: EditorNode
  tables: EditorNode[]
  onAdd: (sourceId: string, sourceColumn: string, targetId: string, targetColumn: string) => void
}) {
  const firstTarget = tables.find((item) => item.id !== selected.id) ?? tables[0]
  const [sourceId, setSourceId] = useState(selected.id)
  const source = tables.find((item) => item.id === sourceId) ?? selected
  const [sourceColumn, setSourceColumn] = useState(source.data.columns[0]?.name ?? '')
  const [targetId, setTargetId] = useState(firstTarget?.id ?? '')
  const target = tables.find((item) => item.id === targetId)
  const [targetColumn, setTargetColumn] = useState(target?.data.columns[0]?.name ?? '')

  if (tables.length < 2 || tables.some((table) => table.data.columns.length === 0)) {
    return <p className="rounded-lg border border-[#1E2A45] bg-[#111827] p-3 text-xs text-[#94A3B8]">Agrega al menos dos tablas con campos para crear relaciones manuales.</p>
  }

  return (
    <div className="space-y-2 rounded-xl border border-[#1E2A45] bg-[#111827]/80 p-3">
      <p className="text-[11px] text-[#94A3B8]">Elige origen y destino para crear una clave foranea directa.</p>
      <div className="grid grid-cols-2 gap-2">
        <LabeledSelect label="Tabla origen" value={sourceId} onChange={(value) => {
          const nextSource = tables.find((item) => item.id === value)
          const nextTarget = tables.find((item) => item.id !== value)
          setSourceId(value)
          setSourceColumn(nextSource?.data.columns[0]?.name ?? '')
          setTargetId(nextTarget?.id ?? '')
          setTargetColumn(nextTarget?.data.columns[0]?.name ?? '')
        }} options={tables.map((table) => ({ value: table.id, label: table.data.tableName }))} />
        <LabeledSelect label="Campo origen" value={sourceColumn} onChange={setSourceColumn} options={source.data.columns.map((column) => ({ value: column.name, label: column.name }))} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <LabeledSelect label="Tabla destino" value={targetId} onChange={(value) => { const nextTarget = tables.find((item) => item.id === value); setTargetId(value); setTargetColumn(nextTarget?.data.columns[0]?.name ?? '') }} options={tables.filter((table) => table.id !== sourceId).map((table) => ({ value: table.id, label: table.data.tableName }))} />
        <LabeledSelect label="Campo destino" value={targetColumn} onChange={setTargetColumn} options={(target?.data.columns ?? []).map((column) => ({ value: column.name, label: column.name }))} />
      </div>
      <button onClick={() => onAdd(sourceId, sourceColumn, targetId, targetColumn)} disabled={!sourceId || !sourceColumn || !targetId || !targetColumn || sourceId === targetId} className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#1A6CF6]/30 bg-[#1A6CF6]/10 px-3 py-2 text-xs text-[#BFDBFE] hover:bg-[#1A6CF6]/20 disabled:opacity-50">
        <Link2 size={13} />
        Crear relación manual
      </button>
    </div>
  )
}

function LabeledSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <label className="block text-[11px] text-[#94A3B8]">
      {label}
      <Select value={value} onChange={onChange} options={options} />
    </label>
  )
}

function Select({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)} className="w-full rounded-md border border-[#1E2A45] bg-[#0A0F1E] px-2 py-1.5 text-xs text-white outline-none focus:border-[#1A6CF6]">
      {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
    </select>
  )
}
