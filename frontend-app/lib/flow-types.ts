import type { Edge, Node } from '@xyflow/react'

export type FlowJson = {
  nodes?: Node[]
  edges?: Edge[]
}

export function toFlowJson(value: unknown): FlowJson {
  if (!value || typeof value !== 'object') return {}

  const candidate = value as FlowJson
  return {
    nodes: Array.isArray(candidate.nodes) ? candidate.nodes : [],
    edges: Array.isArray(candidate.edges) ? candidate.edges : [],
  }
}
