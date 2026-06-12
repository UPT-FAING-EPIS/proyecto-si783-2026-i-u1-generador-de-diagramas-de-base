# FluxSQL Desktop

FluxSQL Desktop usa Next.js como frontend exportado estaticamente y Tauri como contenedor nativo.

## Desarrollo

```powershell
pnpm install
pnpm desktop:dev
```

Durante desarrollo, Next.js usa `http://localhost:3000` exclusivamente para hot reload. Tauri ejecuta `backend-python/main.py` con el Python local y administra su ciclo de vida.

## Instalador Windows

```powershell
pnpm desktop:build
```

El comando reconstruye el sidecar PyInstaller, exporta Next.js a `out/` y genera el instalador NSIS `.exe`.

El instalador final no requiere Node.js, pnpm ni Python y no levanta un servidor Next.js. Los datos locales se guardan en AppData bajo `com.fluxsql.desktop`.

## Pruebas manuales

1. Ejecuta `pnpm desktop:dev`, conecta una base de datos y cierra la ventana varias veces.
2. Confirma en el Administrador de tareas que no queden procesos `python`, `cdcart-backend` o `fluxsql-desktop` iniciados por FluxSQL.
3. Ejecuta `pnpm desktop:build`.
4. Instala `src-tauri/target/release/bundle/nsis/FluxSQL Desktop_0.1.0_x64-setup.exe`.
5. Abre la app instalada y confirma que no necesita Node.js, pnpm, Python ni `localhost:3000`.
6. Verifica conexión, generación y refresco del diagrama usando la base local `cienciasnet`.
7. Confirma que los datos sobreviven al reinicio y están bajo `%APPDATA%\com.fluxsql.desktop`.
