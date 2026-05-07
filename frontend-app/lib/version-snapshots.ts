import type { EditorDialect } from './editor-schema'

type SnapshotNode = {
  type?: string
  data?: {
    tableName?: string
    columns?: Array<{
      name?: string
      type?: string
      isPrimaryKey?: boolean
      nullable?: boolean
      defaultValue?: string
      references?: {
        table?: string
        column?: string
      }
    }>
  }
}

export type VersionSnapshots = Record<EditorDialect, string>

function isTableNode(node: SnapshotNode) {
  return node.type === 'tableNode' && typeof node.data?.tableName === 'string' && Array.isArray(node.data?.columns)
}

function quoteIdentifier(name: string, dialect: EditorDialect) {
  if (dialect === 'mysql') return `\`${name}\``
  if (dialect === 'sqlserver') return `[${name}]`
  return `"${name}"`
}

function normalizeType(type: string | undefined, dialect: EditorDialect) {
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

export function serializeSnapshotSchema(nodes: unknown[] | undefined, dialect: EditorDialect) {
  const tables = (nodes ?? []).filter((node): node is SnapshotNode => isTableNode(node as SnapshotNode))

  if (dialect === 'json') {
    const json = Object.fromEntries(
      tables.map((table) => [
        table.data?.tableName ?? 'tabla',
        Object.fromEntries((table.data?.columns ?? []).map((column) => [column.name ?? 'campo', column.type || 'string'])),
      ])
    )
    return JSON.stringify(json, null, 2)
  }

  return tables.map((table) => {
    const tableName = quoteIdentifier(table.data?.tableName ?? 'tabla', dialect)
    const columns = table.data?.columns ?? []
    const primaryKeys = columns
      .filter((column) => column.isPrimaryKey)
      .map((column) => quoteIdentifier(column.name ?? 'id', dialect))

    const lines = columns.map((column) => {
      const columnName = quoteIdentifier(column.name ?? 'campo', dialect)
      const pieces = [
        columnName,
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

export function serializeVersionSnapshots(nodes: unknown[] | undefined): VersionSnapshots {
  return {
    postgresql: serializeSnapshotSchema(nodes, 'postgresql'),
    mysql: serializeSnapshotSchema(nodes, 'mysql'),
    sqlserver: serializeSnapshotSchema(nodes, 'sqlserver'),
    json: serializeSnapshotSchema(nodes, 'json'),
  }
}

export function hasVersionSnapshots(value: unknown): value is VersionSnapshots {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<VersionSnapshots>
  return ['postgresql', 'mysql', 'sqlserver', 'json'].every(
    (key) => typeof candidate[key as EditorDialect] === 'string'
  )
}
