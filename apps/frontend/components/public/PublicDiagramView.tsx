'use client'

import { ReactFlow, Background, Controls, ReactFlowProvider } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { TableNode } from '@/components/editor/nodes/TableNode'
import { RelationshipEdge } from '@/components/editor/edges/RelationshipEdge'
import { useMemo } from 'react'

interface PublicDiagramViewProps {
  flowJson: {
    nodes?: any[]
    edges?: any[]
  }
}

function PublicDiagramInner({ flowJson }: PublicDiagramViewProps) {
  const nodeTypes = useMemo(() => ({ tableNode: TableNode }), [])
  const edgeTypes = useMemo(() => ({ relationship: RelationshipEdge }), [])
  
  return (
    <ReactFlow
      nodes={flowJson.nodes ?? []}
      edges={flowJson.edges ?? []}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      zoomOnDoubleClick={false}
      fitView
      proOptions={{ hideAttribution: true }}
    >
      <Background color="#1E2A45" gap={16} size={1} />
      <Controls showInteractive={false} className="bg-[#111827] border-[#1E2A45] fill-white" />
    </ReactFlow>
  )
}

export function PublicDiagramView(props: PublicDiagramViewProps) {
  return (
    <ReactFlowProvider>
      <PublicDiagramInner {...props} />
    </ReactFlowProvider>
  )
}
