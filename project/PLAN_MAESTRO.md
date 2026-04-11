# DBCanvas — Plan Maestro de Desarrollo

> Este documento organiza las fases, issues y tareas específicas para cada integrante.
> Cada issue incluye instrucciones detalladas paso a paso para evitar errores y maximizar velocidad.

---

## Roles

| Integrante | Rol | Responsabilidades |
| :-- | :-- | :-- |
| **Jefferson Vargas** | Backend + Infra | Go (conectores, API HTTP), `@dbcanvas/parsers` (TypeScript), Monorepo setup, migraciones DB, CI/CD |
| **Kiara Zapana** | Frontend + UX | React (Web App + Desktop UI), `@dbcanvas/ui` (componentes compartidos), Electron, diseño visual, tests E2E |

---

## Estructura de Carpetas Objetivo

```
├── apps/
│   ├── web/                    # [Kiara] React + Vite SPA
│   │   ├── src/
│   │   │   ├── pages/          # Login, Workspace, Editor
│   │   │   ├── hooks/          # useAuth, useDiagramas, useRealtime
│   │   │   └── lib/            # insforge client config
│   │   └── package.json
│   ├── desktop/                # [Kiara] Electron shell
│   │   ├── src/
│   │   │   ├── main/           # Electron main process (spawn Go)
│   │   │   ├── preload/        # contextBridge API
│   │   │   └── renderer/       # React UI (importa @dbcanvas/ui)
│   │   └── package.json
│   └── backend/                # [Jefferson] Go HTTP server
│       ├── main.go             # Entry point, puerto dinámico
│       ├── connector/          # Interfaz Connector + implementaciones
│       │   ├── connector.go    # Interface: Connect, GetTables, GetSchema, Disconnect
│       │   ├── postgres.go
│       │   ├── mysql.go
│       │   ├── sqlite.go
│       │   ├── mongodb.go
│       │   └── sqlserver.go
│       ├── schema/             # SchemaModel Go equivalente
│       │   └── model.go
│       ├── handler/            # HTTP handlers
│       │   └── api.go
│       └── go.mod
├── packages/
│   ├── parsers/                # [Jefferson] TypeScript puro
│   │   ├── src/
│   │   │   ├── schema-model.ts # Interfaces SchemaModel, Entity, Attribute, Relationship
│   │   │   ├── sql-ddl/        # Tokenizer + Parser SQL → SchemaModel
│   │   │   ├── json-schema/    # Parser JSON Schema → SchemaModel
│   │   │   └── mermaid/        # SchemaModel → Mermaid ERD string
│   │   ├── __tests__/
│   │   └── package.json
│   └── ui/                     # [Kiara] Componentes React compartidos
│       ├── src/
│       │   ├── CodeEditor.tsx    # Monaco Editor wrapper
│       │   ├── DiagramViewer.tsx # Mermaid renderer con zoom/pan
│       │   ├── TableSelector.tsx # Checkboxes para filtrar entidades
│       │   ├── ConnectionForm.tsx# Formulario de conexión a BD (Desktop)
│       │   └── ExportMenu.tsx    # Botones de exportación
│       └── package.json
├── doc/                        # Documentación universitaria
├── project/                    # Este archivo y planificación
└── package.json                # Root del monorepo (pnpm workspaces)
```

---

# FASE 1 — FOUNDATION (v0.1) · 5 días

> **Objetivo:** Monorepo funcional donde `pnpm dev` levanta todo. Interfaces TypeScript del SchemaModel definidas. Base de datos nube con tablas creadas.

---

## Issue #1 · [Jefferson] Inicializar monorepo con pnpm + Turborepo

**Archivo:** `package.json` (root), `turbo.json`, `pnpm-workspace.yaml`

### Pasos:
1. En la raíz del proyecto, ejecutar:
   ```bash
   pnpm init
   ```
2. Crear `pnpm-workspace.yaml`:
   ```yaml
   packages:
     - 'apps/*'
     - 'packages/*'
   ```
3. Instalar Turborepo:
   ```bash
   pnpm add -D turbo -w
   ```
4. Crear `turbo.json`:
   ```json
   {
     "$schema": "https://turbo.build/schema.json",
     "pipeline": {
       "dev": { "cache": false, "persistent": true },
       "build": { "dependsOn": ["^build"], "outputs": ["dist/**"] },
       "test": { "dependsOn": ["build"] },
       "lint": {}
     }
   }
   ```
5. Crear `tsconfig.base.json` con configuración TypeScript compartida.

### Criterio de aceptación:
- `pnpm install` completa sin errores.
- La estructura de carpetas `apps/`, `packages/` existe.

---

## Issue #2 · [Jefferson] Definir interfaces SchemaModel en `packages/parsers`

**Archivo:** `packages/parsers/src/schema-model.ts`

### Pasos:
1. Inicializar el paquete:
   ```bash
   cd packages/parsers
   pnpm init
   ```
   Nombre: `@dbcanvas/parsers`. Agregar campo `"main": "src/index.ts"`.
2. Instalar TypeScript y Vitest como devDependencies.
3. Crear el archivo `src/schema-model.ts` con las interfaces:

```typescript
export interface SchemaModel {
  entities: Entity[];
  relationships: Relationship[];
  metadata?: {
    sourceType: 'sql_ddl' | 'json_schema' | 'connector_pg' | 'connector_mysql' | 'connector_sqlite' | 'connector_mongo' | 'connector_sqlserver';
    parsedAt: string;
    sourceDialect?: string;
  };
}

export interface Entity {
  name: string;
  attributes: Attribute[];
  primaryKey?: string[];
  comment?: string;
}

export interface Attribute {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
  comment?: string;
  references?: {
    entity: string;
    attribute: string;
  };
}

export interface Relationship {
  from: string;
  fromAttribute: string;
  to: string;
  toAttribute: string;
  type: 'one-to-one' | 'one-to-many' | 'many-to-many';
  label?: string;
}
```

4. Crear `src/index.ts` que re-exporte todo.

### Criterio de aceptación:
- `tsc --noEmit` pasa sin errores en `packages/parsers`.
- Las interfaces están documentadas con JSDoc.

---

## Issue #3 · [Jefferson] Implementar generador SchemaModel → Mermaid ERD string

**Archivo:** `packages/parsers/src/mermaid/to-mermaid.ts`

### Pasos:
1. Crear función `toMermaidERD(schema: SchemaModel): string`.
2. La función debe generar un string Mermaid válido como:
   ```
   erDiagram
     USERS {
       uuid id PK
       text email
       text name
     }
     ORDERS {
       uuid id PK
       uuid user_id FK
       decimal total
     }
     USERS ||--o{ ORDERS : "has"
   ```
3. Mapear los relationship types:
   - `one-to-one` → `||--||`
   - `one-to-many` → `||--o{`
   - `many-to-many` → `}o--o{`
4. Escribir al menos 5 tests con Vitest:
   - Esquema vacío → `erDiagram\n`
   - 1 tabla sin relaciones
   - 2 tablas con FK
   - Tabla con columnas PK y nullable
   - 5 tablas con relaciones cruzadas

### Criterio de aceptación:
- `pnpm --filter @dbcanvas/parsers test` pasa con 5/5 tests.

---

## Issue #4 · [Kiara] Inicializar `packages/ui` con React + TailwindCSS + Shadcn

**Archivo:** `packages/ui/`

### Pasos:
1. Inicializar paquete: nombre `@dbcanvas/ui`.
2. Instalar React, TailwindCSS, Shadcn/UI.
3. Crear componente placeholder `DiagramViewer.tsx` que reciba un prop `mermaidCode: string` y renderice un `<div>` con ese texto.
4. Crear componente placeholder `CodeEditor.tsx` que reciba `value: string` y `onChange: (value: string) => void`.
5. Exportar ambos desde `src/index.ts`.

### Criterio de aceptación:
- `@dbcanvas/ui` se importa correctamente desde `apps/web` sin errores.

---

## Issue #5 · [Kiara] Inicializar `apps/web` con Vite + React + TypeScript

**Archivo:** `apps/web/`

### Pasos:
1. Crear el proyecto Vite:
   ```bash
   cd apps/web
   pnpm create vite . --template react-ts
   ```
2. Configurar TailwindCSS.
3. Importar `@dbcanvas/ui` y `@dbcanvas/parsers` como workspace dependencies:
   ```bash
   pnpm add @dbcanvas/ui @dbcanvas/parsers --workspace
   ```
4. Crear página principal con dos paneles: editor de código (izquierda) y diagrama (derecha).
5. Verificar que `pnpm --filter @dbcanvas/web dev` levanta sin errores.

### Criterio de aceptación:
- La Web App se levanta en `localhost:5173` con los dos paneles visibles.

---

## Issue #6 · [Jefferson] Verificar migraciones DB nube y documentar esquema

**Archivo:** `doc/migrations/001_initial_schema.sql`

### Pasos:
1. Verificar que las 4 tablas existen en la BD cloud:
   ```bash
   npx @insforge/cli db tables
   ```
2. Documentar el esquema con un comentario en cada tabla.
3. Crear `doc/migrations/README.md` explicando cómo agregar nuevas migraciones.

### Criterio de aceptación:
- `npx @insforge/cli db tables` muestra: `usuarios`, `proyectos`, `diagramas`, `colaboradores`.

---

# FASE 2 — CORE ENGINE (v0.2) · 8 días

> **Objetivo:** Los parsers convierten DDL y JSON a SchemaModel. El backend Go extrae schema de 5 motores. El diagrama se genera end-to-end.

---

## Issue #7 · [Jefferson] Parser SQL DDL → SchemaModel (Tokenizer)

**Archivo:** `packages/parsers/src/sql-ddl/tokenizer.ts`

### Pasos:
1. Implementar un tokenizer que convierta texto SQL en tokens: `KEYWORD`, `IDENTIFIER`, `SYMBOL`, `TYPE`, `STRING`, `NUMBER`.
2. Debe manejar:
   - Palabras clave: `CREATE`, `TABLE`, `PRIMARY`, `KEY`, `FOREIGN`, `REFERENCES`, `NOT`, `NULL`, `DEFAULT`, `CONSTRAINT`, `UNIQUE`, `INDEX`, `INT`, `VARCHAR`, `TEXT`, `UUID`, `BOOLEAN`, `TIMESTAMP`, `DECIMAL`, `FLOAT`, `SERIAL`, `BIGINT`, `SMALLINT`, etc.
   - Comentarios SQL: `--` y `/* */`
   - Strings entrecomillados: `'valor'` y `"identificador"`
   - Paréntesis, comas, punto y coma
3. Escribir 8 tests con Vitest cubriendo: tipos con parámetros `VARCHAR(255)`, `DECIMAL(10,2)`, PK inline, constraint separado, FK inline, FK como constraint, múltiples tablas, comentarios.

### Criterio de aceptación:
- Tokeniza correctamente las variantes de MySQL, PostgreSQL y SQL Server.

---

## Issue #8 · [Jefferson] Parser SQL DDL → SchemaModel (AST → SchemaModel)

**Archivo:** `packages/parsers/src/sql-ddl/parser.ts`

### Pasos:
1. Consumir tokens del tokenizer y producir un `SchemaModel`.
2. Detectar:
   - `CREATE TABLE nombre (...)` → Entity
   - Columnas con tipo, nullable y default → Attributes
   - `PRIMARY KEY (col)` o `col TYPE PRIMARY KEY` → isPrimaryKey
   - `FOREIGN KEY (col) REFERENCES tabla(col)` → isForeignKey + Relationship
   - `CONSTRAINT ... REFERENCES ...` → Relationship
3. Ignorar sentencias que no sean `CREATE TABLE` (como `CREATE INDEX`, `ALTER TABLE`, etc.) sin crashear.
4. Escribir 10 tests cubriendo:
   - DDL mínimo: 1 tabla, 2 columnas
   - DDL con FK inline
   - DDL con FK como constraint
   - DDL multi-tabla (3+ tablas)
   - DDL con tipos PostgreSQL (`SERIAL`, `TIMESTAMPTZ`, `UUID`)
   - DDL con tipos MySQL (`AUTO_INCREMENT`, `ENGINE=InnoDB`)
   - DDL con tipos SQL Server (`NVARCHAR`, `IDENTITY`)
   - DDL con `IF NOT EXISTS`
   - DDL con comentarios SQL
   - DDL malformado → retornar SchemaModel parcial + warnings, **no crash**

### Criterio de aceptación:
- Los 10 tests pasan. Un `CREATE TABLE` real de PostgreSQL genera un SchemaModel correcto.

---

## Issue #9 · [Jefferson] Parser JSON Schema → SchemaModel

**Archivo:** `packages/parsers/src/json-schema/parser.ts`

### Pasos:
1. Recibir un JSON Schema (draft-07/2020-12) o un documento de ejemplo JSON.
2. Convertirlo a SchemaModel:
   - Objetos con `properties` → Entity, cada property → Attribute
   - `$ref` y objetos anidados → Relationship
   - Arrays de objetos → Relationship one-to-many
   - `required` → nullable: false
3. Si recibe un documento de ejemplo (no schema): inferir tipos por los valores.
4. Escribir 5 tests.

### Criterio de aceptación:
- Un JSON Schema de MongoDB con 3 colecciones genera un SchemaModel con 3 entidades.

---

## Issue #10 · [Jefferson] Backend Go — HTTP server con puerto dinámico

**Archivo:** `apps/backend/main.go`

### Pasos:
1. Inicializar módulo Go: `go mod init github.com/UPT-FAING-EPIS/dbcanvas-backend`
2. Crear servidor HTTP que escuche en `:0` (puerto asignado por el SO).
3. Al iniciar, imprimir en stdout: `READY:{port}` para que Electron lo capture.
4. Habilitar CORS para `localhost`.
5. Crear un endpoint de health: `GET /health` → `{"status": "ok"}`.

### Criterio de aceptación:
- `go run .` levanta el servidor y muestra `READY:xxxxx` en stdout.

---

## Issue #11 · [Jefferson] Backend Go — Interfaz Connector y conector PostgreSQL

**Archivo:** `apps/backend/connector/connector.go`, `apps/backend/connector/postgres.go`

### Pasos:
1. Definir la interfaz:
   ```go
   type Connector interface {
       Connect(config ConnectionConfig) error
       GetTables() ([]string, error)
       GetSchema(tables []string) (*SchemaModel, error)
       Disconnect() error
   }
   ```
2. Implementar `PostgresConnector` usando `lib/pq`:
   - `GetTables()`: query a `information_schema.tables` WHERE `table_schema = 'public'`
   - `GetSchema()`: query a `information_schema.columns` + `information_schema.table_constraints` + `information_schema.key_column_usage` + `information_schema.referential_constraints`
   - Construir SchemaModel Go → serializar a JSON
3. Escribir test con BD PostgreSQL de prueba (Docker o la de insforge).

### Criterio de aceptación:
- Conectar a una BD PostgreSQL con 5 tablas retorna un SchemaModel JSON correcto con entidades y relaciones.

---

## Issue #12 · [Jefferson] Backend Go — Conectores MySQL, SQLite, MongoDB, SQL Server

**Archivo:** `apps/backend/connector/mysql.go`, `sqlite.go`, `mongodb.go`, `sqlserver.go`

### Pasos:
1. **MySQL**: Mismo patrón que PG con `information_schema`. Driver: `go-sql-driver/mysql`.
2. **SQLite**: Usar `PRAGMA table_list`, `PRAGMA table_info(table)`, `PRAGMA foreign_key_list(table)`. Driver: `mattn/go-sqlite3`.
3. **MongoDB**: Usar `listDatabaseNames` + `listCollectionNames` + sampling con `$sample` (100 docs) para inferir esquema. Driver: `go.mongodb.org/mongo-driver`.
4. **SQL Server**: Mismo patrón que PG con `information_schema`. Driver: `denisenkom/go-mssqldb`.

### Criterio de aceptación:
- Los 5 conectores implementan la interfaz `Connector`.
- Test con al menos PG y SQLite pasan exitosamente.

---

## Issue #13 · [Jefferson] Backend Go — Endpoints REST

**Archivo:** `apps/backend/handler/api.go`

### Pasos:
1. Implementar endpoints:
   - `POST /connect` — recibe `{engine, host, port, user, password, database}`, retorna `{sessionId}`
   - `GET /tables?sessionId=xxx` — retorna `{tables: ["users", "orders", ...]}`
   - `POST /generate` — recibe `{sessionId, tables: [...]}`, retorna `{schema: SchemaModel, mermaid: "erDiagram..."}`
   - `POST /disconnect` — cierra la conexión
2. Guardar sesiones en un `map[string]Connector` en memoria.
3. Las credenciales NUNCA se logean. Los logs solo muestran motor y host.

### Criterio de aceptación:
- Flujo completo `/connect` → `/tables` → `/generate` → `/disconnect` funciona con PostgreSQL.

---

## Issue #14 · [Kiara] Integrar Monaco Editor en `@dbcanvas/ui`

**Archivo:** `packages/ui/src/CodeEditor.tsx`

### Pasos:
1. Instalar `@monaco-editor/react`.
2. Crear componente que reciba:
   - `value: string`
   - `onChange: (value: string) => void`
   - `language: 'sql' | 'json'`
3. Configurar syntax highlighting para SQL.
4. Implementar debounce de 300ms en el onChange.
5. Agregar soporte para arrastrar archivos `.sql` o `.json` al editor.

### Criterio de aceptación:
- Al escribir SQL en el editor, el `onChange` se dispara con debounce de 300ms.

---

## Issue #15 · [Kiara] Integrar Mermaid.js en `@dbcanvas/ui`

**Archivo:** `packages/ui/src/DiagramViewer.tsx`

### Pasos:
1. Instalar `mermaid`.
2. Crear componente que reciba `mermaidCode: string`.
3. Renderizar el código Mermaid como SVG en un `<div>` dedicado.
4. Agregar zoom (scroll) y pan (arrastrar) usando CSS `transform`.
5. Re-renderizar solo cuando `mermaidCode` cambie.

### Criterio de aceptación:
- El string `erDiagram\n USERS { uuid id PK }` renderiza un SVG con la tabla USERS.

---

## Issue #16 · [Kiara] Componente ExportMenu

**Archivo:** `packages/ui/src/ExportMenu.tsx`

### Pasos:
1. Crear componente con botones: "PNG", "SVG", "Mermaid (.mmd)".
2. Implementar:
   - **PNG**: convertir SVG del DiagramViewer a canvas → `toDataURL('image/png')` → descargar.
   - **SVG**: obtener el SVG innerHTML del DiagramViewer → crear Blob → descargar.
   - **MMD**: descargar el string Mermaid como archivo `.mmd`.

### Criterio de aceptación:
- Cada botón descarga un archivo válido.

---

# FASE 3 — WEB APP (v0.3) · 8 días

> **Objetivo:** Web App completa con login, proyectos, guardado de diagramas y colaboración en tiempo real.

---

## Issue #17 · [Jefferson] Configurar auth con @insforge/cli en la Web App

**Archivo:** `apps/web/src/lib/insforge.ts`

### Pasos:
1. Instalar el SDK de insforge en `apps/web`.
2. Crear hook `useAuth()` que gestione login, logout y sesión actual.
3. Verificar que las credenciales se almacenen hasheadas en la tabla `usuarios`.
4. Crear la función `registerUser(email, password, nombre)` que inserte en `usuarios` con `bcrypt` hash.

### Criterio de aceptación:
- Un usuario puede registrarse, hacer login y ver su sesión activa.

---

## Issue #18 · [Kiara] Página de Login / Register

**Archivo:** `apps/web/src/pages/AuthPage.tsx`

### Pasos:
1. Diseñar con Shadcn/UI un formulario de login/register con tabs.
2. Campos: email, contraseña (+ nombre en register).
3. Conectar con el hook `useAuth()`.
4. Aplicar Dark Theme por defecto.
5. Mostrar errores de validación inline.

### Criterio de aceptación:
- El formulario se ve profesional, funciona el registro y login.

---

## Issue #19 · [Kiara] Página Workspace (listado de proyectos y diagramas)

**Archivo:** `apps/web/src/pages/WorkspacePage.tsx`

### Pasos:
1. Mostrar los proyectos del usuario autenticado (query a tabla `proyectos`).
2. Dentro de cada proyecto, listar sus diagramas (query a tabla `diagramas`).
3. Botón "Nuevo Proyecto" y "Nuevo Diagrama".
4. Al hacer clic en un diagrama, navegar al editor.

### Criterio de aceptación:
- El usuario ve sus proyectos y diagramas guardados. Puede crear nuevos.

---

## Issue #20 · [Kiara] Página Editor principal (Web — split view)

**Archivo:** `apps/web/src/pages/EditorPage.tsx`

### Pasos:
1. Layout split: `CodeEditor` a la izquierda, `DiagramViewer` a la derecha.
2. Panel inferior opcional con `TableSelector` (checkboxes para filtrar entidades).
3. Barra superior con: nombre del diagrama, botón "Guardar", `ExportMenu`, selector de fuente (SQL DDL / JSON Schema).
4. Integrar el pipeline:
   ```
   CodeEditor onChange → parser(value) → SchemaModel → toMermaidERD(schema) → DiagramViewer
   ```
5. El diagrama se actualiza en tiempo real mientras escribes.

### Criterio de aceptación:
- Pegar un `CREATE TABLE users (id SERIAL PRIMARY KEY, email VARCHAR(255) NOT NULL);` muestra el diagrama ERD en <500ms.

---

## Issue #21 · [Jefferson] CRUD de proyectos y diagramas (Web persistence)

**Archivo:** `apps/web/src/hooks/useDiagramas.ts`

### Pasos:
1. Crear hook `useDiagramas(proyectoId)` con funciones:
   - `save(diagrama)` → INSERT/UPDATE en tabla `diagramas`
   - `load(diagramaId)` → SELECT de tabla `diagramas`
   - `delete(diagramaId)` → DELETE
   - `list()` → SELECT WHERE proyecto_id
2. Al guardar, almacenar: `contenido_fuente` (el DDL), `schema_json` (el SchemaModel como JSONB), `mermaid_code` (el string Mermaid cacheado).

### Criterio de aceptación:
- Guardar un diagrama y recargarlo restaura el editor con el mismo DDL y el diagrama idéntico.

---

## Issue #22 · [Jefferson] Colaboración en tiempo real

**Archivo:** `apps/web/src/hooks/useRealtime.ts`

### Pasos:
1. Usar el módulo real-time de `@insforge/cli` para suscribirse a cambios en la tabla `diagramas`.
2. Cuando otro usuario modifica el `contenido_fuente` del mismo diagrama, actualizar el editor local.
3. Implementar lógica de "último en escribir gana" (simple, sin CRDTs por ahora).

### Criterio de aceptación:
- Dos pestañas del navegador con el mismo diagrama abierto ven las actualizaciones del otro.

---

## Issue #23 · [Kiara] Importar archivo (.sql, .json, .mmd)

**Archivo:** `packages/ui/src/FileImporter.tsx`

### Pasos:
1. Componente con zona de "drag & drop" y botón "Seleccionar archivo".
2. Detectar extensión: `.sql` → parser DDL, `.json` → parser JSON Schema, `.mmd` → cargar directo como Mermaid.
3. Al importar, poblar el CodeEditor con el contenido del archivo.

### Criterio de aceptación:
- Arrastrar un `.sql` con 3 `CREATE TABLE` genera el diagrama correctamente.

---

# FASE 4 — DESKTOP APP + RELEASE (v1.0) · 9 días

> **Objetivo:** Desktop App funcional con conexión directa a BDs. Instaladores listos.

---

## Issue #24 · [Kiara] Inicializar `apps/desktop` con Electron + electron-vite

**Archivo:** `apps/desktop/`

### Pasos:
1. Inicializar proyecto Electron con `electron-vite` como template.
2. Configurar para importar `@dbcanvas/ui` y `@dbcanvas/parsers`.
3. Crear ventana principal con el mismo layout de EditorPage.

### Criterio de aceptación:
- `pnpm --filter @dbcanvas/desktop dev` abre una ventana Electron con el editor.

---

## Issue #25 · [Jefferson] Spawn del backend Go desde Electron main process

**Archivo:** `apps/desktop/src/main/go-bridge.ts`

### Pasos:
1. En el main process de Electron, usar `child_process.spawn` para lanzar el binary Go.
2. Leer stdout línea a línea hasta detectar `READY:{port}`.
3. Guardar el puerto y exponerlo al renderer via `contextBridge`.
4. Al cerrar la app, hacer `kill` del proceso hijo.
5. Reintentar spawn 3 veces si falla.

### Criterio de aceptación:
- El backend Go se levanta automáticamente al abrir la app Electron y responde a `GET /health`.

---

## Issue #26 · [Kiara] Pantalla de conexión a BD (Desktop)

**Archivo:** `packages/ui/src/ConnectionForm.tsx`, integración en Desktop

### Pasos:
1. Componente con: selector de motor (PG, MySQL, SQLite, MongoDB, SQL Server), campos de host, puerto, usuario, contraseña, nombre de BD.
2. Botón "Test Connection" que hace `POST /connect` al backend Go local.
3. Al conectar exitosamente, hacer `GET /tables` y mostrar el `TableSelector`.
4. Al seleccionar tablas y presionar "Generar", hacer `POST /generate` y mostrar el diagrama.

### Criterio de aceptación:
- Flujo completo: seleccionar motor → ingresar credenciales → test → generar diagrama funciona para PostgreSQL.

---

## Issue #27 · [Jefferson] Compilar binary Go para Windows/Mac/Linux

**Archivo:** CI/CD, `apps/backend/Makefile`

### Pasos:
1. Crear Makefile con targets:
   ```makefile
   build-win:   GOOS=windows GOARCH=amd64 go build -o dist/dbcanvas-backend.exe .
   build-mac:   GOOS=darwin GOARCH=arm64 go build -o dist/dbcanvas-backend .
   build-linux: GOOS=linux GOARCH=amd64 go build -o dist/dbcanvas-backend .
   ```
2. El binary resultante debe ser autocontenido (sin dependencias).
3. Configurar electron-builder para incluir el binary correcto según el SO.

### Criterio de aceptación:
- `make build-win` genera un `.exe` funcional que responde a `GET /health`.

---

## Issue #28 · [Kiara] Empaquetar Desktop App con electron-builder

**Archivo:** `apps/desktop/electron-builder.yml`

### Pasos:
1. Configurar electron-builder para generar: `.exe` (NSIS), `.dmg`, `.AppImage`.
2. Incluir el binary Go compilado en `extraResources`.
3. Probar instalación local en Windows.

### Criterio de aceptación:
- El instalador `.exe` genera una app funcional que conecta a una BD local.

---

## Issue #29 · [Jefferson] GitHub Actions CI/CD

**Archivo:** `.github/workflows/ci.yml`

### Pasos:
1. Pipeline con matrix: `ubuntu-latest`, `windows-latest`, `macos-latest`.
2. Steps: instalar pnpm, instalar Go, build parsers, build backend, build desktop, test.
3. En tags `v*`, crear GitHub Release y subir los instaladores.

### Criterio de aceptación:
- Push a `main` ejecuta tests. Tag `v1.0.0` genera release con assets descargables.

---

## Issue #30 · [ambos] Testing final y documentación

### Pasos:
1. Completar FD05 (Informe Final) con métricas reales.
2. Grabar video demo del flujo Web App y Desktop App.
3. Verificar que los 5 conectores funcionan (al menos PG y SQLite obligatorios, el resto con mock).
4. Actualizar README con screenshots del producto.

---

# Resumen de Issues por Integrante

| # | Issue | Asignado | Fase |
| :--: | :-- | :--: | :--: |
| 1 | Monorepo pnpm + Turborepo | Jefferson | v0.1 |
| 2 | SchemaModel interfaces | Jefferson | v0.1 |
| 3 | Generador SchemaModel → Mermaid | Jefferson | v0.1 |
| 4 | `packages/ui` setup | Kiara | v0.1 |
| 5 | `apps/web` setup | Kiara | v0.1 |
| 6 | Verificar migraciones DB nube | Jefferson | v0.1 |
| 7 | Parser SQL DDL (Tokenizer) | Jefferson | v0.2 |
| 8 | Parser SQL DDL (AST → SchemaModel) | Jefferson | v0.2 |
| 9 | Parser JSON Schema → SchemaModel | Jefferson | v0.2 |
| 10 | Backend Go — HTTP server | Jefferson | v0.2 |
| 11 | Backend Go — Conector PostgreSQL | Jefferson | v0.2 |
| 12 | Backend Go — Conectores MySQL, SQLite, MongoDB, SQL Server | Jefferson | v0.2 |
| 13 | Backend Go — Endpoints REST | Jefferson | v0.2 |
| 14 | Monaco Editor componente | Kiara | v0.2 |
| 15 | Mermaid.js DiagramViewer | Kiara | v0.2 |
| 16 | ExportMenu (PNG, SVG, MMD) | Kiara | v0.2 |
| 17 | Auth con @insforge/cli | Jefferson | v0.3 |
| 18 | Página Login / Register | Kiara | v0.3 |
| 19 | Página Workspace | Kiara | v0.3 |
| 20 | Página Editor (split view) | Kiara | v0.3 |
| 21 | CRUD proyectos/diagramas | Jefferson | v0.3 |
| 22 | Colaboración en tiempo real | Jefferson | v0.3 |
| 23 | Importar archivo | Kiara | v0.3 |
| 24 | Electron setup | Kiara | v1.0 |
| 25 | Spawn Go desde Electron | Jefferson | v1.0 |
| 26 | ConnectionForm (Desktop) | Kiara | v1.0 |
| 27 | Compilar binary Go multiplataforma | Jefferson | v1.0 |
| 28 | Empaquetar con electron-builder | Kiara | v1.0 |
| 29 | GitHub Actions CI/CD | Jefferson | v1.0 |
| 30 | Testing final + FD05 | ambos | v1.0 |

**Total: 30 issues · ~15 Jefferson · ~12 Kiara · 3 compartidos**
