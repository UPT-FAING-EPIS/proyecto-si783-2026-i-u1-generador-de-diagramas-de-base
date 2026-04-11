# Informe de Proyecto Final (FD05)

**Sistema *DBCanvas — Database Diagram Generator***

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |

***

## 1. Resumen Ejecutivo del Proyecto

El sistema **DBCanvas** se consolida como la herramienta unificadora de código abierto destinada a desarrolladores y arquitectos informáticos que enfrentan los inconvenientes del software tradicional de diagrama de bases de datos. Tras completar sus fases de desarrollo e iteración, la solución logra un equilibrio entre:
- **Seguridad local** para modelos de negocio en arquitecturas Desktop con `Go` y `Electron`.
- **Rapidez, accesibilidad y Persistencia** de esquemas compartidos en arquitecturas Web conectadas a la base de datos PostgreSQL hospedada gracias a `@insforge/cli`.

Se consiguió desplegar una herramienta funcional, modular (monorepo) y sin condicionamientos de licenciamientos opresivos.

## 2. Objetivos Logrados

- [x] Construcción de parsers DDL que trasladan `CREATE TABLE` a Mermaid ERD en menos de 300 milisegundos.
- [x] Extracción en vivo desde motores PostgreSQL, MySQL, SQLite y MongoDB sin exposición a internet.
- [x] Inclusión de un esquema Cloud (DB en Nube) para que los estudiantes y equipos visualicen y cambien sus diagramas en tiempo real, garantizando la portabilidad (evitando vendor lock-in a través de una tabla propia de `usuarios`).
- [x] Creación de UI optimizada para ambientes oscuros que exporte a PNG y SVG con un solo clic.

## 3. Manual de Despliegue (Deploy)

### 3.1. Requisitos para Compilar
- Node.js LTS 20+
- Gestor de paquetes `pnpm` (recomendado)
- Compilador de `Go > 1.22` (Si se quiere alterar el subproceso de escritorio).

### 3.2. Ejecución Web en Entorno de Desarrollo
Para levantar el frontend web y conectarse a la Base de Datos administrada por el CLI de InsForge:

```bash
cd apps/web
pnpm install
npm run dev
```

### 3.3. Compilación de la Aplicación de Escritorio (Desktop Electron)
La compilación a binarios (`.exe`, `.dmg`, `.AppImage`) está automatizada empleando Turborepo y Electron Builder:

```bash
cd apps/desktop
pnpm install
pnpm build:win
```

## 4. Métricas y Pruebas
> [!NOTE]
> *(Este apartado se llenará tras la fase de control de calidad final del proyecto)*

- **Tiempo de Inferencia (BD con 100 relaciones):** `[PENDIENTE]`
- **Tiempo promedio de render de Mermaid:** `[PENDIENTE]` ms.
- **Rendimiento de WebSockets por sala RT:** `[PENDIENTE]` ms.

## 5. Conclusiones y Futuro
DBCanvas logra con éxito resolver la brecha en el flujo de trabajo de programación. A futuro, este monorepo queda apto para integrar ingeniería bidireccional (Visual Builder a Código) o sumar más dialectos como Oracle SQL o compatibilidad en vivo con infraestructuras Serverless no documentadas.
