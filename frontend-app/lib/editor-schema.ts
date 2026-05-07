import { MarkerType, type Edge, type Node } from '@xyflow/react'

export type EditorDialect = 'postgresql' | 'mysql' | 'sqlserver' | 'json'

export type EditorColumn = {
  name: string
  type: string
  isPrimaryKey?: boolean
  isForeignKey?: boolean
  nullable?: boolean
  defaultValue?: string
  references?: {
    table: string
    column: string
  }
}

export type EditorTableData = {
  tableName: string
  columns: EditorColumn[]
  comment?: string
  color?: string
}

export type EditorNode = Node<EditorTableData, 'tableNode'>

export const DEFAULT_TABLE_COLOR = '#1A6CF6'

export function isEditorNode(node: Node): node is EditorNode {
  return (
    node.type === 'tableNode' &&
    typeof node.data?.tableName === 'string' &&
    Array.isArray(node.data?.columns)
  )
}

export function makeTableNode(index: number, name = `tabla_${index}`): EditorNode {
  return {
    id: crypto.randomUUID(),
    type: 'tableNode',
    position: { x: 120 + (index % 3) * 320, y: 120 + Math.floor(index / 3) * 220 },
    data: {
      tableName: name,
      color: DEFAULT_TABLE_COLOR,
      columns: [
        {
          name: 'id',
          type: 'SERIAL',
          isPrimaryKey: true,
          nullable: false,
        },
      ],
    },
  }
}

export function makeRelationshipEdge(source: EditorNode, sourceColumn: EditorColumn, target: EditorNode, targetColumn: EditorColumn): Edge {
  return {
    id: `rel-${source.id}-${sourceColumn.name}-${target.id}-${targetColumn.name}`,
    source: source.id,
    sourceHandle: `${sourceColumn.name}-source`,
    target: target.id,
    targetHandle: `${targetColumn.name}-target`,
    type: 'relationship',
    animated: false,
    style: { stroke: '#1A6CF6', strokeWidth: 1.5 },
    markerEnd: {
      type: MarkerType.ArrowClosed,
      width: 16,
      height: 16,
      color: '#1A6CF6',
    },
    label: `${sourceColumn.name} -> ${targetColumn.name}`,
  }
}

function quoteIdentifier(name: string, dialect: EditorDialect) {
  if (dialect === 'mysql') return `\`${name}\``
  if (dialect === 'sqlserver') return `[${name}]`
  return `"${name}"`
}

function normalizeType(type: string, dialect: EditorDialect) {
  const upper = (type || 'TEXT').toUpperCase()
  if (dialect === 'postgresql') {
    if (upper.includes('AUTO_INCREMENT') || upper.includes('IDENTITY')) return 'SERIAL'
    if (upper === 'DATETIME') return 'TIMESTAMP'
    if (upper === 'NVARCHAR') return 'VARCHAR'
  }
  if (dialect === 'sqlserver') {
    if (upper === 'SERIAL' || upper.includes('AUTO_INCREMENT')) return 'INT IDENTITY(1,1)'
    if (upper === 'TEXT') return 'NVARCHAR(MAX)'
    if (upper === 'BOOLEAN') return 'BIT'
    if (upper === 'JSONB' || upper === 'JSON') return 'NVARCHAR(MAX)'
  }
  if (dialect === 'mysql') {
    if (upper === 'SERIAL' || upper.includes('IDENTITY')) return 'INT AUTO_INCREMENT'
    if (upper === 'BOOLEAN') return 'TINYINT(1)'
    if (upper === 'JSONB') return 'JSON'
  }
  return type || 'TEXT'
}

export function serializeSchema(nodes: Node[], dialect: EditorDialect, edges: Edge[] = []) {
  const tables = nodes.filter(isEditorNode)

  if (dialect === 'json') {
    const tableMap = Object.fromEntries(
      tables.map((table) => {
        const fields = Object.fromEntries(
          table.data.columns.map((column) => [
            column.name,
            {
              type: column.type || 'string',
              primaryKey: Boolean(column.isPrimaryKey),
              nullable: column.nullable !== false,
              references: column.references,
            },
          ])
        )
        return [table.data.tableName, fields]
      })
    )
    const json = {
      tables: tableMap,
      relations: edges.map((edge) => ({
        source: edge.source,
        sourceHandle: edge.sourceHandle,
        target: edge.target,
        targetHandle: edge.targetHandle,
      })),
    }
    return JSON.stringify(json, null, 2)
  }

  return tables.map((table) => {
    const tableName = quoteIdentifier(table.data.tableName, dialect)
    const primaryKeys = table.data.columns.filter((column) => column.isPrimaryKey).map((column) => quoteIdentifier(column.name, dialect))

    const lines = table.data.columns.map((column) => {
      const pieces = [
        quoteIdentifier(column.name, dialect),
        normalizeType(column.type, dialect),
        column.nullable === false ? 'NOT NULL' : '',
        column.defaultValue ? `DEFAULT ${column.defaultValue}` : '',
        column.isPrimaryKey && primaryKeys.length === 1 ? 'PRIMARY KEY' : '',
      ].filter(Boolean)

      if (column.references?.table && column.references?.column) {
        pieces.push(`REFERENCES ${quoteIdentifier(column.references.table, dialect)}(${quoteIdentifier(column.references.column, dialect)})`)
      }

      return `  ${pieces.join(' ')}`
    })

    if (primaryKeys.length > 1) {
      lines.push(`  PRIMARY KEY (${primaryKeys.join(', ')})`)
    }

    return `CREATE TABLE ${tableName} (\n${lines.join(',\n')}\n);`
  }).join('\n\n')
}

export function serializeAllDialects(nodes: Node[], edges: Edge[] = []) {
  return {
    postgresql: serializeSchema(nodes, 'postgresql'),
    mysql: serializeSchema(nodes, 'mysql'),
    sqlserver: serializeSchema(nodes, 'sqlserver'),
    json: serializeSchema(nodes, 'json', edges),
  }
}

export function getSchemaStats(nodes: Node[], edges: Edge[]) {
  const tables = nodes.filter(isEditorNode)
  const warnings = tables.reduce((count, table) => {
    if (table.data.columns.length === 0) return count + 1
    if (!table.data.columns.some((column) => column.isPrimaryKey)) return count + 1
    return count
  }, 0)

  return {
    tables: tables.length,
    relations: edges.length,
    warnings,
  }
}
