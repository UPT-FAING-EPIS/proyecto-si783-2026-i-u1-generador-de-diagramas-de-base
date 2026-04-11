# Informe de Especificación de Requerimientos de Software (FD03)

**Sistema *DBCanvas — Database Diagram Generator***

| CONTROL DE VERSIONES | | | | | |
| :-: | :- | :- | :- | :- | :- |
| Versión | Hecha por | Revisada por | Aprobada por | Fecha | Motivo |
| 1.0 | KHZM / JAVE | | | Abril 2026 | Versión Original |

***

## 1. Introducción

### 1.1 Propósito
El presente documento describe los requisitos funcionales, no funcionales y las restricciones técnicas del sistema **DBCanvas — Generador de Diagramas de Base de Datos**. Su objetivo es servir como contrato funcional entre los desarrolladores del sistema y los interesados, delineando el comportamiento exacto que tendrán las diferentes superficies del software (Web App y Desktop App) y sus integraciones con la infraestructura en nube para la persistencia.

### 1.2 Alcance del Sistema
DBCanvas es una herramienta diseñada para solucionar la falta de documentación actual de los esquemas de bases de datos de forma rápida. 
La solución abarca dos frentes:
1. **Web App:** Capaz de recibir instrucciones SQL DDL y JSON y generar diagramas interactivos. Esta versión cuenta con **alojamiento persistente en la nube** utilizando una base de datos PostgreSQL respaldada por `@insforge/cli`. Incluye capacidades de guardado de diagramas en nube, funciones colaborativas en tiempo real y una autenticación basada en una tabla personalizada de `usuarios` para prevenir el *vendor lock-in*.
2. **Desktop App:** Aplicación instalable (Windows, macOS, Linux) que funciona 100% de manera local ejecutando rutinas Go embebidas dentro de Electron, para concectarse directamente a motores como PostgreSQL, MySQL, SQLite y MongoDB sin exposición de datos a la web.

***

## 2. Descripción General

### 2.1 Perspectiva del Producto
DBCanvas interactúa con cuatro componentes principales en su arquitectura general:
- El hardware/sistema operativo del usuario en su aplicación Desktop.
- El servidor de bases de datos local del usuario (para extracción del schema).
- El servidor Cloud gestionado con `@insforge/cli` (que provee la base de datos PostgreSQL remota y real-time para la persistencia de diagramas en la Web).
- El motor de renderizado de esquemas proporcionado por `mermaid.js`.

### 2.2 Funciones del Producto
A alto nivel, el software permite:
1. Inferir y parsear modelos de base de datos desde código o conexiones activas.
2. Renderizar automáticamente diagramas Entidad-Relación (ERD) en pantalla.
3. Guardar, editar y colaborar en tiempo real sobre los diagramas generados (Exclusivo entorno Web).
4. Exportar el render final a formatos visuales (SVG, PNG) u otros (MD, DDL).
5. Gestionar la autenticación de miembros usando infraestructura personalizable en PostgreSQL.

### 2.3 Características de los Usuarios
- **Usuario Técnico (Desarrollador / Devops):** Necesita conectar bases de datos complejas sin instalar clientes pesados y requiere privacidad para datos sensibles en el uso de la versión de escritorio de DBCanvas.
- **Usuario Colaborativo / Arquitecto:** Necesita proponer modelos rápidos desde su entorno web, guardarlos en el servidor y ver en tiempo real si algún otro arquitecto aplica un cambio. 

### 2.4 Restricciones
- La inferencia de la base de datos en la versión Desktop lee permisos de solo lectura (DQL/Schema); no modifica la base de datos de origen.
- Los clientes deben soportar WebSockets para el uso correcto del motor de tiempo real que habilita el módulo de `@insforge/cli`.

***

## 3. Requerimientos Específicos

### 3.1 Requisitos Funcionales (RF)

| ID | Nombre | Descripción | Superficie |
| :-- | :-- | :-- | :-- |
| **RF01** | Parsing de Sintaxis SQL | El sistema debe recibir formato estándar DDL (CREATE TABLE...) y parsear su árbol abstracto en un ERD utilizando TypeScript en tiempo real. | Web / Desktop |
| **RF02** | Conectividad a Motores BD | El sistema debe poder establecer una sesión con PostgreSQL, MySQL, SQLite y MongoDB mediante credenciales en formularios. | Desktop |
| **RF03** | Inferencia de Esquema | El backend Go debe retornar la lista de colecciones, atributos y dependencias foráneas detectadas. | Desktop |
| **RF04** | Registro In-House | El sistema debe permitir la creación de cuentas almacenando credenciales y contraseñas (hasheadas) en una tabla propia llamada `usuarios`, independientemente del flujo default de BaaS. | Web |
| **RF05** | Guardado de Diagramas | Los usuarios autenticados podrán almacenar, nombrar y listar sus diagramas dentro de la base de datos PostgreSQL de nube. | Web |
| **RF06** | Edición Colaborativa RT | El editor debe transmitir los cambios DDL de un usuario sobre un diagrama a otros usuarios conectados utilizando el motor *real-time* en milisegundos. | Web |
| **RF07** | Exportación de Diagramas | El usuario visualizará botones para exportar su trabajo al instante como `.PNG`, `.SVG` y `.MMD`. | Web / Desktop |

### 3.2 Requisitos No Funcionales (RNF)

| ID | Categoría | Descripción |
| :-- | :-- | :-- |
| **RNF01** | Desempeño | El parseo del DDL y la regeneración del SVG de Mermaid debe tener un retraso por *debounce* no mayor a 300 ms respecto al tipeo. |
| **RNF02** | Privacidad (Desktop) | La aplicación de escritorio bajo ninguna circunstancia debe poseer telemetría sobre el formato de los esquemas parseados. |
| **RNF03** | Portabilidad | El backend cloud para la plataforma Web debe estar acoplado libremente de manera que la migración total hacia otro clúster PostgreSQL sea nativo usando un simple _pg_dump_. |
| **RNF04** | Usabilidad | La interfaz utilizará convenciones de *Dark Theme / Light Theme* aplicando Shadcn/UI y no requerirá más de 3 clics para guardar o exportar un diagrama tras su terminación. |

### 3.3 Requisitos de Interfaces

- **Interfaces de Usuario (UI):** Interfaces construidas mediante librerías de React (Vite). Pantallas planificadas: `Login/Signup`, `Workspace / Project Directory` (Web), `Connection Modal` (Desktop), `Code Editor View`, `Diagram Canvas View`.
- **Interfaces de Hardware:** N/A (Se utiliza hardware estándar del agente).
- **Interfaces de Software:** 
  - Drivers para Go (`lib/pq`, `go-sqlite3`, etc).
  - SDK de agentes y base de datos con `@insforge/cli` (para WebSocket Sync y queries nativos).
  - Web Workers para separar el procesamiento de código de alto hilo.

### 3.4 Modelo Lógico de Datos (App Web)
Se requerirán las siguientes entidades para cumplir con la propuesta de no-dependencia:
- `usuarios`: `id (UUID)`, `email`, `password_hash`, `nombre`, `created_at`
- `diagramas`: `id (UUID)`, `usuario_id (FK)`, `nombre`, `contenido_ddl`, `mermaid_cache`, `created_at`, `updated_at`
- `colaboradores`: `diagrama_id (FK)`, `usuario_id (FK)`, `permiso_type`
