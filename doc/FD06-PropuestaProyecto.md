# Propuesta de Proyecto (FD06)

**Sistema *DBCanvas — Database Diagram Generator***

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |

***

## 1. Identificación del Proyecto

**Nombre del Proyecto:** DBCanvas — Generador de Diagramas de Base de Datos
**Estudiantes:** Zapana Murillo, Kiara Holly y Vargas Espinoza, Jefferson Alfonso
**Curso:** Base de Datos II
**Docente:** Mag. Patrick Cuadros Quiroga

## 2. Descripción Breve

DBCanvas nace con la intención de proporcionar una utilidad unificada para visualizar automáticamente esquemas de base de datos a partir de código (DDL/JSON) o conexiones vivas. Frente a opciones corporativas pesadas, el proyecto ofrecerá una aplicación web con guardado de diagramas en la nube (PostgreSQL gestionado) mediante flujos colaborativos en tiempo real, junto con una contraparte de Escritorio que trabaja exclusivamente en offline, protegiendo las credenciales corporativas o productivas del usuario mientras levanta y dibuja las relaciones y entidades en segundos.

## 3. Relevancia y Justificación

La documentación es a menudo el eslabón más débil y costoso en el desarrollo de software. Esta herramienta impacta directamente en la productividad al automatizar procesos tediosos.
Desde el punto de vista académico, es un desafío de alta exigencia que demanda conocimientos teóricos profundos de Base de Datos (Extracción de `information_schema`/metadatos SQL) y desarrollo de parsers sintácticos en herramientas modernas (TypeScript, Go), a su vez aplicando arquitecturas escalables o estrategias "vendor-free" para mantener la dueñez de la infraestructura alojada gracias a `@insforge/cli`.

## 4. Perfil Tecnológico

El stack propuesto para superar los requisitos de conectividad, agilidad y asincronía es:
- **Gestión:** Monorepo con `Turborepo` / `pnpm`.
- **Backend / Puente Desktop:** Go (`net/http`) para conexión directa a motores y manipulación de AST sin dependencias pesadas.
- **Frontend y Render:** `React` v18, `Vite`, UI `TailwindCSS/Shadcn`, `Monaco Editor` y `Mermaid.js` para visualización por nodos.
- **Servidor Cloud Web:** PostgreSQL, con sistema Auth y sincronización manejado por el servicio de terminal de `@insforge/cli`.

## 5. Cronograma Hitos (Milestones)

1. **v0.1 - Foundation:** Creación de Monorepo, definición de UI, contratos de APIs y carpetas `skills/`, `apps/` y `packages/`.
2. **v0.2 - Persistencia DB Nube y Backend Go:** Habilitar conexión con local Go y también estructura para DB PostgreSQL (Logins sin _vendor lock-in_) a ser usado en Web.
3. **v0.3 - Web App (React):** Despliegue del cliente web que se conecta al DB, usa el parser local de AST para inyectar código plano y permite colaboración. 
4. **v1.0 - Desktop Packaging:** Fusión del frontend interactivo y el servidor de inferencias en Go dentro de un empaquetado nativo `.exe` o `.dmg` con soporte de exportación local en `Electron`.
