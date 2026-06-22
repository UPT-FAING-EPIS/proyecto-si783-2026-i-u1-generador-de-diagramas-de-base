'use client'

import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Braces, Hash, Link } from 'lucide-react'

interface Column {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  isArray?: boolean
  subFields?: Column[]
}

export interface MongoNodeData extends Record<string, unknown> {
  tableName: string
  columns: Column[]
  color?: string
}

function MongoField({ col, isLast, depth = 0 }: { col: Column, isLast: boolean, depth?: number }) {
  const isNested = col.subFields && col.subFields.length > 0
  
  return (
    <div className="flex flex-col">
      <div className="relative flex items-center gap-2 group hover:bg-[#111827] rounded transition-colors pr-2 py-0.5">
        {/* Left handle (target) */}
        <Handle
          type="target"
          position={Position.Left}
          id={`${col.name}-target`}
          className="!w-2.5 !h-2.5 !bg-[#10B981] !border-2 !border-[#0B1322] opacity-0 group-hover:opacity-100 transition-all"
          style={{ top: '50%', left: `-${18 + depth * 16}px` }}
        />

        {col.isPrimaryKey ? (
          <Hash size={12} className="text-[#F59E0B] shrink-0" />
        ) : col.isForeignKey ? (
          <Link size={12} className="text-[#3B82F6] shrink-0" />
        ) : (
          <span className="w-3 shrink-0" />
        )}

        {/* Column name (Key) */}
        <span className="text-[#9cdcfe] shrink-0 truncate">
          "{col.name}"
        </span>
        <span className="text-[#d4d4d4]">:</span>

        {/* Column type / Value */}
        <span className="text-[#4fc1ff] text-xs truncate flex-1 flex items-center">
          {col.isArray && <span className="text-[#ffd700] mr-0.5">[</span>}
          {isNested ? (
            <span className="text-[#10B981]">{`{`}</span>
          ) : (
            col.type
          )}
          {col.isArray && !isNested && <span className="text-[#ffd700] ml-0.5">]</span>}
        </span>

        {!isNested && !isLast && <span className="text-[#d4d4d4]">,</span>}

        {/* Right handle (source) */}
        <Handle
          type="source"
          position={Position.Right}
          id={`${col.name}-source`}
          className="!w-2.5 !h-2.5 !bg-[#3B82F6] !border-2 !border-[#0B1322] opacity-0 group-hover:opacity-100 transition-all"
          style={{ top: '50%', right: '-8px' }}
        />
      </div>

      {isNested && (
        <div className="flex flex-col pl-4 border-l border-[#1E2A45] ml-[5px]">
          {col.subFields!.map((sub, idx) => (
            <MongoField key={sub.name} col={sub} isLast={idx === col.subFields!.length - 1} depth={depth + 1} />
          ))}
          <div className="text-[#10B981] text-xs mt-0.5">
            {`}`}
            {col.isArray && <span className="text-[#ffd700]">]</span>}
            {!isLast && <span className="text-[#d4d4d4]">,</span>}
          </div>
        </div>
      )}
    </div>
  )
}

export function MongoNode({ data }: NodeProps) {
  const { tableName, columns: rawCols, color } = data as MongoNodeData
  const columns: Column[] = Array.isArray(rawCols) ? rawCols : []
  // Greenish default for MongoDB
  const accent = color ?? '#10B981'

  return (
    <div className="min-w-[260px] overflow-hidden rounded-xl border border-[#1E2A45] bg-[#0B1322] shadow-2xl shadow-black/40 backdrop-blur font-mono">
      <div className="px-4 py-3 flex items-center justify-between" style={{ background: `linear-gradient(135deg, ${accent}, #059669)` }}>
        <span className="flex items-center gap-2 truncate text-sm font-bold tracking-wide text-white drop-shadow-md">
          <Braces size={16} className="opacity-90" />
          {tableName}
        </span>
        <span className="text-[10px] font-semibold text-[#0B1322] bg-white/90 px-1.5 py-0.5 rounded shadow-sm">
          Collection
        </span>
      </div>

      <div className="p-3 bg-[#0B1322] text-sm text-[#E2E8F0]">
        <div className="text-[#10B981] mb-1">{`{`}</div>
        
        <div className="flex flex-col gap-0.5 pl-4 border-l border-[#1E2A45] ml-[5px]">
          {columns.length === 0 ? (
            <div className="text-[#64748B] text-xs italic pl-2">  // No fields</div>
          ) : (
            columns.map((col, idx) => (
              <MongoField key={col.name} col={col} isLast={idx === columns.length - 1} />
            ))
          )}
        </div>
        
        <div className="text-[#10B981] mt-1">{`}`}</div>
      </div>
    </div>
  )
}
