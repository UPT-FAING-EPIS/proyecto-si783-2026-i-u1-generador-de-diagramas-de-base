import { create } from 'zustand'
import {
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
  type Node,
  type Edge,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react'

const SQL_PLACEHOLDER = `-- FluxSQL Editor
-- Escribe tu DDL aquí

CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL
);
`

interface EditorStore {
  nodes: Node[]
  edges: Edge[]
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  setNodesAndEdges: (nodes: Node[], edges: Edge[]) => void
  sqlValue: string
  setSqlValue: (value: string) => void
}

export const useEditorStore = create<EditorStore>((set) => ({
  nodes: [],
  edges: [],
  onNodesChange: (changes) =>
    set((state) => ({ nodes: applyNodeChanges(changes, state.nodes) })),
  onEdgesChange: (changes) =>
    set((state) => ({ edges: applyEdgeChanges(changes, state.edges) })),
  setNodesAndEdges: (nodes, edges) => set({ nodes, edges }),
  sqlValue: SQL_PLACEHOLDER,
  setSqlValue: (value) => set({ sqlValue: value }),
}))

/**
 * Stamps a parser-generated FlowEdge with the markerEnd arrow config.
 * Call this when converting ParseResult.edges → React Flow edges.
 */
export function toReactFlowEdge(edge: Edge): Edge {
  return {
    ...edge,
    type: 'relationship',
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#00D4FF',
    },
  }
}
