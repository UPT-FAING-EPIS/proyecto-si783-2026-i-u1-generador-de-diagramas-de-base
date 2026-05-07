'use client'

import { useEffect, useMemo, useState } from 'react'
import { ReactFlow, Background, MiniMap, MarkerType, useReactFlow, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '@/store/useEditorStore'
import { TableNode } from './nodes/TableNode'
import { RelationshipEdge } from './edges/RelationshipEdge'
import { Eye, GitBranch, Grid3X3, Maximize2, MoreHorizontal, Rows3 } from 'lucide-react'

// CRITICAL: nodeTypes and edgeTypes MUST be defined outside the component
const nodeTypes = {
  tableNode: TableNode,
}

const edgeTypes = {
  relationship: RelationshipEdge,
}

const DEMO_NODES: Node[] = [
  {
    id: 'users',
    type: 'tableNode',
    position: { x: 80, y: 100 },
    data: {
      tableName: 'users',
      columns: [
        { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false },
        { name: 'email', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'created_at', type: 'TIMESTAMPTZ', isPrimaryKey: false, isForeignKey: false },
      ],
    },
  },
  {
    id: 'projects',
    type: 'tableNode',
    position: { x: 460, y: 100 },
    data: {
      tableName: 'projects',
      columns: [
        { name: 'id', type: 'UUID', isPrimaryKey: true, isForeignKey: false },
        { name: 'name', type: 'TEXT', isPrimaryKey: false, isForeignKey: false },
        { name: 'owner_id', type: 'UUID', isPrimaryKey: false, isForeignKey: true },
        { name: 'created_at', type: 'TIMESTAMPTZ', isPrimaryKey: false, isForeignKey: false },
      ],
    },
  },
]

const DEMO_EDGES: Edge[] = [
  {
    id: 'fk-projects-users',
    source: 'projects',
    sourceHandle: 'owner_id-source',
    target: 'users',
    targetHandle: 'id-target',
    type: 'relationship',
    animated: false,
    style: { stroke: '#00D4FF', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#00D4FF',
    },
  },
]

interface CanvasProps {
  emitNodeMove?: (nodeId: string, position: { x: number, y: number }) => void
}

export function Canvas({ emitNodeMove }: CanvasProps = {}) {
  const { fitView, setCenter } = useReactFlow()
  const [showGrid, setShowGrid] = useState(true)
  const { nodes, edges, hoveredNodeId, onNodesChange, onEdgesChange, setNodesAndEdges, setSelectedNodeId, setHoveredNodeId } = useEditorStore()

  const visibleEdges = useMemo(() => {
    if (!hoveredNodeId) return edges
    return edges.map((edge) => {
      const active = edge.source === hoveredNodeId || edge.target === hoveredNodeId
      return {
        ...edge,
        animated: active,
        style: {
          ...edge.style,
          stroke: active ? '#60A5FA' : '#1E3A5F',
          strokeWidth: active ? 3 : 1,
          opacity: active ? 1 : 0.25,
        },
      }
    })
  }, [edges, hoveredNodeId])

  useEffect(() => {
    if (nodes.length === 0) {
      setNodesAndEdges(DEMO_NODES, DEMO_EDGES)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="relative isolate h-full min-h-0 w-full overflow-hidden bg-[#07101F] [background-image:radial-gradient(#1E3A5F_1px,transparent_1px)] [background-size:24px_24px]">
      <ReactFlow
        nodes={nodes}
        edges={visibleEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onNodeMouseEnter={(_, node) => setHoveredNodeId(node.id)}
        onNodeMouseLeave={() => setHoveredNodeId(null)}
        onPaneClick={() => setSelectedNodeId(null)}
        onNodeDragStop={(_, node) => emitNodeMove?.(node.id, node.position)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        {showGrid && <Background color="#1E2A45" gap={20} size={1} />}
        <MiniMap
          pannable
          zoomable
          className="!bottom-5 !right-5 !h-28 !w-40 overflow-hidden !rounded-xl !border !border-[#1E2A45] !bg-[#0D1424]"
          nodeColor="#1A6CF6"
          maskColor="rgba(7,16,31,0.72)"
        />
      </ReactFlow>
      <div className="pointer-events-auto absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 overflow-hidden rounded-xl border border-[#1E2A45] bg-[#0D1424]/95 shadow-2xl shadow-black/40 backdrop-blur">
        <ToolButton icon={Maximize2} label="Ajustar" onClick={() => fitView({ duration: 350, padding: 0.22 })} />
        <ToolButton icon={GitBranch} label="Auto-layout" onClick={() => autoLayout(nodes, setNodesAndEdges, fitView)} active />
        <ToolButton icon={Rows3} label="Alinear" onClick={() => alignRows(nodes, setNodesAndEdges)} />
        <ToolButton icon={Eye} label="Relaciones" onClick={() => setHoveredNodeId(null)} />
        <ToolButton icon={Grid3X3} label="Cuadrícula" onClick={() => setShowGrid((value) => !value)} active={showGrid} />
        <ToolButton icon={MoreHorizontal} label="Más" onClick={() => setCenter(0, 0, { zoom: 1, duration: 300 })} />
      </div>
    </div>
  )
}

function ToolButton({ icon: Icon, label, onClick, active = false }: { icon: React.ElementType; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button onClick={onClick} className={`flex min-w-20 flex-col items-center gap-1 border-r border-[#1E2A45] px-3 py-2 text-[11px] last:border-r-0 ${active ? 'text-[#60A5FA]' : 'text-[#94A3B8] hover:text-white'}`}>
      <Icon size={15} />
      {label}
    </button>
  )
}

function autoLayout(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void, fitView: ReturnType<typeof useReactFlow>['fitView']) {
  const edges = useEditorStore.getState().edges
  const laidOut = nodes.map((node, index) => ({
    ...node,
    position: {
      x: 120 + (index % 3) * 340,
      y: 150 + Math.floor(index / 3) * 230,
    },
  }))
  setNodesAndEdges(laidOut, edges)
  window.setTimeout(() => fitView({ duration: 350, padding: 0.22 }), 50)
}

function alignRows(nodes: Node[], setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void) {
  const edges = useEditorStore.getState().edges
  setNodesAndEdges(nodes.map((node, index) => ({ ...node, position: { ...node.position, y: 160 + Math.floor(index / 3) * 220 } })), edges)
}
