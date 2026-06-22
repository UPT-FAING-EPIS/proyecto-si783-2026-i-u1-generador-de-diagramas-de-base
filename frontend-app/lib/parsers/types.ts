export interface ParseResult {
  nodes: FlowNode[]
  edges: FlowEdge[]
  errors: ParseError[]
}

export interface FlowNode {
  id: string
  type: 'tableNode' | 'nosqlNode'
  position: { x: number; y: number }
  data: {
    tableName: string
    columns: Column[]
  }
}

export interface Column {
  name: string
  type: string
  isPrimaryKey: boolean
  isForeignKey: boolean
  references?: {
    table: string
    column: string
  }
  isAutoIncrement?: boolean
  isIdentity?: boolean
  isArray?: boolean
  subFields?: Column[]
}

export interface FlowEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  type: 'smoothstep' | 'relationship'
  animated: boolean
  style: { stroke: string; strokeWidth?: number }
  label?: string
}

export interface ParseError {
  line?: number
  message: string
}
