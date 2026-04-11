[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/O8I-PXKI)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23223057)

# DBCanvas — Generador de Diagramas de Base de Datos

**DBCanvas** genera diagramas de base de datos automáticamente. Recibe un esquema (vía texto DDL, archivo JSON o conexión directa) y produce un diagrama visual interactivo exportable a PNG, SVG y Mermaid.

## ¿Qué tipos de BD soporta?

Cubre **9 categorías** de bases de datos mediante 3 mecanismos de entrada:

| Mecanismo | Categorías cubiertas |
| :-- | :-- |
| Parser SQL DDL | Relacional, NewSQL, Columnar, Spatial, Time-Series |
| Parser JSON Schema | Document, Key-Value, Object-Oriented |
| Conectores Go (Desktop) | PostgreSQL, MySQL, SQLite, MongoDB, SQL Server |

## Arquitectura

```
[Fuente de Entrada] → [SchemaModel] → [Mermaid ERD] → [Diagrama Visual]
```

- **Web App** (`apps/web`): Parsea texto en el navegador. Guarda diagramas en PostgreSQL (nube).
- **Desktop App** (`apps/desktop`): Se conecta directamente a tu BD local via Go. Nada sale de tu máquina.
- **Backend Go** (`apps/backend`): Servidor HTTP local para extracción de esquemas desde BDs reales.

## Estructura del Proyecto

```
├── apps/
│   ├── web/          # React + Vite (Web App)
│   ├── desktop/      # Electron (Desktop App)
│   └── backend/      # Go HTTP server (conectores BD)
├── packages/
│   ├── parsers/      # SQL DDL → SchemaModel, JSON → SchemaModel
│   └── ui/           # Componentes React compartidos
├── doc/              # Documentación universitaria (FD01-FD06)
│   └── migrations/   # SQL para la BD cloud
├── skills/           # Instrucciones para agentes de desarrollo
└── project/          # Plan maestro del proyecto y issues
```

## Stack

| Capa | Tecnología |
| :-- | :-- |
| Monorepo | pnpm + Turborepo |
| Frontend | React 18, Vite, TypeScript, TailwindCSS, Shadcn/UI |
| Editor | Monaco Editor |
| Diagramas | Mermaid.js |
| Backend local | Go 1.22 (drivers nativos para PG, MySQL, SQLite, MongoDB, SQL Server) |
| Desktop | Electron 29 |
| Persistencia Web | PostgreSQL via @insforge/cli |

## Equipo

- **Vargas Espinoza, Jefferson Alfonso** — Backend Go, parsers, monorepo, DB
- **Zapana Murillo, Kiara Holly** — Frontend React, UI, Desktop, tests E2E