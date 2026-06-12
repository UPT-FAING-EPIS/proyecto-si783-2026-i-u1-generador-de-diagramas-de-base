# FluxSQL Desktop

FluxSQL Desktop es una aplicacion local para inspeccionar bases de datos, generar diagramas desde su esquema real, producir datos y analizar consultas.

## Arquitectura

- `frontend-app/`: interfaz Next.js exportada como archivos estaticos.
- `frontend-app/src-tauri/`: contenedor nativo Tauri y administrador del backend local.
- `backend-python/`: sidecar FastAPI para conectores, diagramas, generacion y analisis.

En desarrollo, `localhost:3000` se usa solamente para hot reload. El instalador final carga el frontend estatico desde `out/` y no inicia un servidor Next.js.

Tauri inicia el backend en un puerto local dinamico, espera su endpoint `/health` y lo termina al cerrar FluxSQL. SQLite, logs y exportaciones se guardan bajo `%APPDATA%\com.fluxsql.desktop`.

## Desarrollo

Requisitos: Node.js, pnpm, Rust y Python.

```powershell
cd frontend-app
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Tauri ejecuta directamente `backend-python/main.py`; no es necesario reconstruir PyInstaller en cada inicio.

## Instalador Windows

```powershell
cd frontend-app
pnpm desktop:build
```

Este comando instala las dependencias de build Python, reconstruye el sidecar con PyInstaller, exporta Next.js y genera exclusivamente un instalador NSIS:

```text
frontend-app/src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe
```

El instalador final incluye el backend y no requiere Node.js, pnpm ni Python.

## Pruebas manuales

Consulta el checklist en `frontend-app/README.md`. Para validar el flujo principal, conecta la base local `cienciasnet`, genera su diagrama y usa la opcion de refrescar desde la base de datos.
