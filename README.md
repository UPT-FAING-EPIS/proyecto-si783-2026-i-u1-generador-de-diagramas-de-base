[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/O8I-PXKI)
[![Open in Codespaces](https://classroom.github.com/assets/launch-codespace-2972f46106e565e64193e422d61a12cf1da4916b45550586e14ef0a7c637dd04.svg)](https://classroom.github.com/open-in-codespaces?assignment_repo_id=23223057)
# Proyecto DBCanvas — Generador de Diagramas de Base de Datos

DBCanvas es una herramienta "Zero Config" creada para solucionar la falta de documentación de los esquemas de bases de datos, combinando las ventajas de privacidad del entorno local con capacidades de tiempo real en la Nube.

## Arquitectura

El ecosistema (Monorepo conformado en `apps` y `packages`) presenta dos modos principales de operación:
1. **Web App (`apps/web`):** Un cliente React interactivo donde puedes escribir sentencias DDL y obtener diagramaje en vivo. Está conectado a una **Nube de PostgreSQL** administrada por `@insforge/cli` que permite a los desarrolladores guardar sus resultados, gestionar sus credenciales propietarias (mediante una tabla de usuarios sin vendor lock-in) y compartir por **WebSockets The Real-time Sync** su trabajo con compañeros de equipo.
2. **Desktop App (`apps/desktop`):** Aplicación en *Electron* que engendra un proceso puente en `Go` totalmente local. Permite la conexión a PostgreSQL, MySQL, SQLite y MongoDB para inferir su esquema, modelarlo visualmente y exportarlo **sin fuga de información** hacia internet.

## Estructura de Documentación

Todos los documentos relacionados a la asignatura requeridos como pre-requisito y planeamiento se encuentran en la carpeta `doc/`, en formato DOCX original y transformados/completados a Markdown.

- `doc/FD01-Informe-Factibilidad.md`
- `doc/FD02-Informe-Vision.md`
- `doc/FD03-Informe-Especificacion-Requerimientos.md`
- `doc/FD04-Informe-Arquitectura-Software.md`
- `doc/FD05-Informe-ProyectoFinal.md`
- `doc/FD06-PropuestaProyecto.md`

## Stack Principal

- **Gestión:** pnpm & Turborepo
- **Cliente:** React, Vite, Tailwind CSS, Monaco Editor, Mermaid.js
- **Desktop:** Electron, electron-vite, electron-builder
- **Local Bridge / Parseo:** Go (net/http y drivers estáticos)
- **Persistencia Web:** Base de Datos PostgreSQL provisionada vía `@insforge/cli` (Con real-time Websockets).