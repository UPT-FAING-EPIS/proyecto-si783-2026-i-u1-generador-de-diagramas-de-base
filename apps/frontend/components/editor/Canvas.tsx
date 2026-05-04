'use client'

import { useEffect } from 'react'
import { ReactFlow, Background, Controls, MarkerType, type Node, type Edge } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useEditorStore } from '@/store/useEditorStore'
import { TableNode } from './nodes/TableNode'
import { RelationshipEdge } from './edges/RelationshipEdge'

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
  const { nodes, edges, onNodesChange, onEdgesChange, setNodesAndEdges } = useEditorStore()

  useEffect(() => {
    if (nodes.length === 0) {
      setNodesAndEdges(DEMO_NODES, DEMO_EDGES)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full bg-[#0A0F1E]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={(_, node) => emitNodeMove?.(node.id, node.position)}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        deleteKeyCode={null}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1E2A45" gap={20} size={1} />
        <Controls className="[&>button]:bg-[#111827] [&>button]:border-[#1E2A45] [&>button]:text-[#E2E8F0] [&>button:hover]:bg-[#1E2A45]" />
      </ReactFlow>
    </div>
  )
}
