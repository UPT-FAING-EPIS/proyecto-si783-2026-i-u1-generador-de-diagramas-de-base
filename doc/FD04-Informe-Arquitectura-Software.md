<center>

![logo UPT](./media/logo-upt.png)

**UNIVERSIDAD PRIVADA DE TACNA**

**FACULTAD DE INGENIERÍA**

**Escuela Profesional de Ingeniería de Sistemas**

**Proyecto *DBCanvas — Generador de Diagramas de Base de Datos***

Curso: *Base de Datos II*

Docente: *Mag. Patrick Cuadros Quiroga*

Integrantes:

***Zapana Murillo, Kiara Holly (2023077087)***

***Vargas Espinoza, Jefferson Alfonso (2023076820)***

**Tacna – Perú**

***2026***

</center>

***

Sistema *DBCanvas — Database Diagram Generator*

Informe de Arquitectura de Software

Versión *1.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |

***

## ÍNDICE GENERAL

1. Introducción
2. Representación Arquitectónica
3. Metas y Restricciones Arquitectónicas
4. Vista Lógica
5. Vista de Procesos
6. Vista de Despliegue

***

## 1. Introducción

### 1.1 Propósito

Este documento proporciona una visión completa de la arquitectura del sistema **DBCanvas — Generador de Diagramas de Base de Datos**. Describe las decisiones de diseño que permiten al sistema recibir esquemas de **9 categorías distintas de bases de datos** y producir diagramas visuales de forma rápida, segura y extensible.

### 1.2 Alcance

Se describen la arquitectura de transformación de datos (pipeline `Entrada → SchemaModel → Diagrama`), la estructura del monorepo, la separación entre parsers client-side y conectores server-side, y la infraestructura de persistencia en la nube para la Web App.

***

## 2. Representación Arquitectónica

### 2.1 Patrón Central: Pipeline de Transformación Unidireccional

La decisión arquitectónica más importante del sistema es que **toda fuente de entrada se convierte a un modelo intermedio universal (`SchemaModel`)** antes de renderizar el diagrama. Esto desacopla completamente las entradas (parsers, conectores) de la salida (Mermaid.js).

```mermaid
graph LR
    subgraph Entradas
        A[SQL DDL Text]
        B[JSON Schema]
        C[Conector PG/MySQL/SQLite]
        D[Conector MongoDB]
        E[Conector SQL Server]
        F[Archivo .sql/.json]
    end

    subgraph Core
        G[SchemaModel]
    end

    subgraph Salida
        H[Mermaid ERD String]
        I[SVG Interactivo]
        J[Export PNG/SVG/MMD]
    end

    A --> G
    B --> G
    C --> G
    D --> G
    E --> G
    F --> G
    G --> H --> I --> J
```

**¿Por qué este patrón?**
- **Extensibilidad:** Para soportar un nuevo tipo de BD, solo se agrega un nuevo parser o conector que produzca un `SchemaModel`. **No se toca el renderer.**
- **Testabilidad:** Cada parser se prueba de forma aislada: entrada conocida → `SchemaModel` esperado.
- **Reutilización:** El mismo `SchemaModel` sirve para Web App y Desktop App.

### 2.2 Estilo Arquitectónico: Monorepo con Packages Compartidos

```mermaid
graph TD
    A["Monorepo DBCanvas"] --> B["apps/"]
    A --> C["packages/"]
    A --> D["doc/"]
    A --> E["skills/"]

    B --> B1["web (React + Vite)"]
    B --> B2["desktop (Electron)"]
    B --> B3["backend (Go)"]

    C --> C1["@dbcanvas/parsers"]
    C --> C2["@dbcanvas/ui"]

    B1 -.->|importa| C1
    B1 -.->|importa| C2
    B2 -.->|importa| C1
    B2 -.->|importa| C2
    B2 -.->|spawn child process| B3
```

| Paquete | Responsabilidad | Lenguaje |
| :-- | :-- | :-- |
| `packages/parsers` | Parsers puros: SQL DDL → SchemaModel, JSON Schema → SchemaModel. Sin dependencias de browser ni Node.js. | TypeScript |
| `packages/ui` | Componentes React compartidos: `DiagramViewer`, `CodeEditor`, `TableSelector`, `ConnectionForm` | TypeScript / React |
| `apps/web` | Web App React. Usa parsers client-side. Persiste diagramas en PostgreSQL vía `@insforge/cli`. | TypeScript |
| `apps/desktop` | Electron shell. Usa los mismos componentes UI. Se comunica con `apps/backend` vía HTTP local. | TypeScript |
| `apps/backend` | Servidor HTTP Go. Conectores nativos para PG, MySQL, SQLite, MongoDB, SQL Server. Retorna `SchemaModel` como JSON. | Go |

***

## 3. Metas y Restricciones Arquitectónicas

| Meta / Restricción | Descripción |
| :-- | :-- |
| **Solo lectura** | El sistema NUNCA modifica la base de datos del usuario. Solo lee metadatos (`information_schema`, `PRAGMA`, aggregations). |
| **Privacidad local (Desktop)** | Ningún dato del esquema del usuario sale de su máquina en la versión Desktop. El backend Go corre como proceso local. |
| **Sin vendor lock-in (Web)** | La tabla `usuarios` con credenciales propias permite migrar de `@insforge/cli` a cualquier PostgreSQL con un `pg_dump`. |
| **Extensibilidad por plugins** | Agregar soporte para un nuevo motor de BD = implementar la interfaz `Connector` en Go (Desktop) o un nuevo parser en TypeScript (Web). |
| **9 categorías de BD** | Cubrir Relacional, Document, Key-Value, Graph, Columnar, Time-Series, NewSQL, Spatial y Object-Oriented mediante la combinación de parsers SQL DDL + JSON Schema + conectores. |

***

## 4. Vista Lógica

### 4.1 Vista de Interacción — Web App (Parsing Client-Side)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant Editor as Monaco Editor
    participant Parser as @dbcanvas/parsers
    participant Viewer as DiagramViewer (Mermaid)
    participant Cloud as PostgreSQL (@insforge)

    U->>Editor: Escribe/pega SQL DDL
    Editor->>Parser: Texto DDL (debounce 300ms)
    Parser->>Parser: Tokenizar → AST → SchemaModel
    Parser->>Viewer: SchemaModel
    Viewer->>Viewer: SchemaModel → Mermaid string → SVG
    Viewer->>U: Diagrama ERD renderizado

    U->>Cloud: Click "Guardar" (autenticado)
    Cloud->>Cloud: Inserta en tabla diagramas
    Cloud-->>U: Confirmación + sync RT
```

**Punto clave:** En la Web App, **todo el parseo ocurre en el navegador del usuario**. El servidor solo se usa para guardar/compartir diagramas, no para procesar esquemas.

### 4.2 Vista de Interacción — Desktop App (Conexión Directa a BD)

```mermaid
sequenceDiagram
    participant U as Usuario
    participant Electron as Electron UI
    participant Go as Backend Go (Child Process)
    participant DB as BD del Usuario

    U->>Electron: Ingresa credenciales en ConnectionForm
    Electron->>Go: POST /connect {engine, host, port, user, pass, db}
    Go->>DB: Handshake via driver nativo
    DB-->>Go: Connected
    Go->>DB: SELECT * FROM information_schema.tables / columns / key_column_usage
    DB-->>Go: Metadatos crudos
    Go->>Go: Normalizar a SchemaModel
    Go-->>Electron: JSON SchemaModel
    Electron->>Electron: SchemaModel → Mermaid → SVG
    Electron->>U: Diagrama ERD renderizado
```

**Punto clave:** El backend Go SOLO extrae metadatos (estructura). **Nunca lee datos de las tablas del usuario.** Las credenciales viven en memoria RAM y se descartan al cerrar.

***

## 5. Vista de Procesos

### 5.1 Cobertura de 9 Categorías de Base de Datos

| Categoría | Mecanismo de entrada | Cómo genera el diagrama |
| :-- | :-- | :-- |
| **Relational** (MySQL, PG, Oracle, SQL Server, SQLite) | Conector directo (Desktop) + Parser DDL (Web) | ERD clásico: tablas, columnas, PKs, FKs |
| **NewSQL** (CockroachDB, TiDB, YugaByte) | Usan protocolo PG o MySQL → mismos conectores | ERD idéntico al relacional |
| **Spatial** (PostGIS) | Extensión de PostgreSQL → mismo conector PG | ERD + columnas de tipo geometry |
| **Time-Series** (TimescaleDB) | Extensión de PostgreSQL → mismo conector PG | ERD con hypertables como entidades |
| **Columnar** (Cassandra, ClickHouse) | Parser CQL/SQL (≈ SQL estándar) vía parser DDL | ERD con column families |
| **Document** (MongoDB, CouchDB) | Conector MongoDB (Desktop) + Parser JSON Schema (Web) | ERD inferido: colecciones como entidades, campos como atributos |
| **Key-Value** (Redis, DynamoDB) | Parser JSON Schema (formato de definición) | Diagrama simple: stores con key/value types |
| **Graph** (Neo4j) | Parser Cypher `CREATE` (extensión futura) o JSON de nodos/aristas | Diagrama de nodos y relaciones |
| **Object-Oriented** (ZODB, db4o) | Parser JSON/YAML de definición de clases | Diagrama de clases: herencia y composición |

***

## 6. Vista de Despliegue

### 6.1 Web App

```
Usuario (Navegador)
  └── React SPA (Vite build estático)
        ├── @dbcanvas/parsers (ejecuta en browser)
        ├── @dbcanvas/ui (componentes React)
        └── SDK @insforge/cli → PostgreSQL Cloud
              ├── tabla: usuarios
              ├── tabla: proyectos
              ├── tabla: diagramas
              └── tabla: colaboradores
```

### 6.2 Desktop App

```
Usuario (Windows / macOS / Linux)
  └── Electron App (instalador nativo)
        ├── React UI (mismos componentes @dbcanvas/ui)
        ├── @dbcanvas/parsers (para DDL pegado manualmente)
        └── Go Backend (child process, puerto dinámico)
              ├── Conector PostgreSQL
              ├── Conector MySQL
              ├── Conector SQLite
              ├── Conector MongoDB
              └── Conector SQL Server
```

No se requiere servidor dedicado, infraestructura cloud ni hardware especializado para el uso del Desktop. La Web App utiliza PostgreSQL gestionado por `@insforge/cli` exclusivamente para persistencia de diagramas y autenticación.
