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

Informe de Proyecto Final

Versión *1.0*

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original — Borrador |

***

## 1. Resumen Ejecutivo

**DBCanvas** es un generador de diagramas de base de datos que visualiza automáticamente la estructura de bases de datos de **9 categorías** (Relacional, Document, Key-Value, Graph, Columnar, Time-Series, NewSQL, Spatial y Object-Oriented) a partir de código DDL, archivos JSON o conexiones directas.

El sistema opera bajo un pipeline unidireccional: **Entrada → SchemaModel → Diagrama**, donde el `SchemaModel` es un modelo intermedio universal que permite desacoplar las fuentes de entrada del renderizado visual.

## 2. Objetivos Logrados

> *Esta sección se completará al finalizar el desarrollo.*

- [ ] Parsers SQL DDL y JSON Schema funcionales con cobertura de las 9 categorías de BD.
- [ ] Conectores Go directos para PostgreSQL, MySQL, SQLite, MongoDB y SQL Server.
- [ ] Web App con guardado en la nube (PostgreSQL vía `@insforge/cli`).
- [ ] Desktop App con conexión local a BDs del usuario sin exposición a internet.
- [ ] Exportación a PNG, SVG, `.mmd` y SQL DDL formateado.

## 3. Manual de Despliegue

### 3.1 Requisitos Previos (Desarrollo)

- Node.js 20 LTS
- pnpm 8+
- Go 1.22+ (para compilar `apps/backend`)

### 3.2 Web App (Desarrollo)

```bash
pnpm install                  # Instala dependencias del monorepo
pnpm --filter @dbcanvas/web dev  # Levanta la Web App en localhost
```

### 3.3 Desktop App (Desarrollo)

```bash
pnpm --filter @dbcanvas/desktop dev  # Levanta Electron con HMR
```

### 3.4 Backend Go (Desarrollo)

```bash
cd apps/backend
go run .                      # Levanta servidor HTTP en puerto dinámico
```

### 3.5 Compilación de Instaladores

```bash
pnpm --filter @dbcanvas/desktop build:win    # .exe
pnpm --filter @dbcanvas/desktop build:mac    # .dmg
pnpm --filter @dbcanvas/desktop build:linux  # .AppImage
```

## 4. Métricas

> *Esta sección se completará tras la fase de testing.*

| Métrica | Objetivo | Resultado |
| :-- | :-- | :-- |
| Tiempo de parseo DDL (50 tablas) | ≤ 500 ms | `[PENDIENTE]` |
| Tiempo de render Mermaid SVG | ≤ 300 ms | `[PENDIENTE]` |
| Tiempo de conexión + extracción de schema (PG, 100 tablas) | ≤ 3 s | `[PENDIENTE]` |
| Cobertura de tests unitarios (parsers) | ≥ 80% | `[PENDIENTE]` |

## 5. Conclusiones

> *Esta sección se completará al finalizar el proyecto.*
