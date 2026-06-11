# FluxSQL Local - Arquitectura y Desarrollo

FluxSQL Local es una aplicación de escritorio de alto rendimiento enfocada en el diseño, análisis y generación de datos para bases de datos de múltiples motores (PostgreSQL, MySQL, SQL Server, MongoDB, Cassandra, Neo4j, etc.). 

El proyecto abandonó la web tradicional para migrar a una arquitectura Desktop + Sidecar mediante Tauri v2.

---

## 🏛️ Arquitectura del Proyecto

La aplicación utiliza un flujo moderno donde el renderizado visual y el procesamiento pesado de base de datos están estrictamente separados en dos procesos que corren localmente en la máquina del usuario:

1. **Frontend UI (`frontend-app/`)**: 
   Aplicación React compilada como Single Page Application estática (Next.js Export). Se encarga puramente de la vista, los componentes (Tailwind/Lucide) y la recolección de configuraciones. Implementa un estado global con **Zustand** para almacenar temporalmente la conexión a la Base de Datos activa.

2. **Desktop Contenedor (`frontend-app/src-tauri/`)**: 
   Capa escrita en Rust (Tauri) que levanta la ventana nativa del sistema operativo. Al iniciar, Tauri escanea el sistema buscando un puerto de red local que esté 100% libre (evitando puertos de desarrollo comunes). Una vez encuentra el puerto, arranca "invisiblemente" el backend de Python pasándole este puerto dinámico.

3. **Sidecar Backend (`backend-python/`)**: 
   Servidor API unificado escrito en **FastAPI**. Carece de estado (*Stateless*); todas las peticiones que recibe desde el Frontend ya incluyen el "string de conexión" a la base de datos de turno. Está separado lógicamente en tres submódulos:
   - `backend/` (Generador de Datos): Construido por Mariela. Realiza conexiones mediante conectores abstractos para extraer esquemas y usar `Faker` para llenado masivo y exportación (SQL, CSV).
   - `query_analyzer/`: Construido por André. Se encarga de hacer el EXPLAIN de las consultas y analizar cuellos de botella utilizando IA.
   - `diagrams/`: *(Próximamente)* Ingeniería Inversa para graficar el ER.

---

## ⚙️ Requisitos y Entorno (`.env`)

En la carpeta `backend-python/` el sistema utiliza `pydantic-settings` para cargar configuraciones. Puedes crear un archivo `.env` en esa carpeta si deseas alterar los valores por defecto:

```env
# ── Base de Datos Interna y Seguridad ──
# (SQLite local para uso del sidecar, historial, caché)
DATABASE_PATH=./cdcart_data.db
ENCRYPTION_KEY=cdcart_local_secret_key_change_me

# ── Generador de Datos ──
FAKER_LOCALE=es_ES
TEMP_DIR=./tmp_exports

# ── Configuración de IA (Analizador de Consultas) ──
# Necesario para el análisis avanzado con LLMs
OPENAI_API_KEY=tu_token_de_openai_aqui
```

---

## 🚀 ¿Cómo ejecutar el entorno de desarrollo?

Para trabajar en el código y probar tanto el diseño en React como el Backend en Python simultáneamente de forma local, utiliza el CLI de Tauri:

### Prerrequisitos
Asegúrate de haber instalado NodeJS (`pnpm`), Rust y Python 3.10+.

### Ejecución
Abre una terminal y ejecuta:
```bash
cd frontend-app
pnpm install
pnpm tauri dev
```

**¿Qué hace este comando automáticamente?**
1. Inicia el servidor de desarrollo de Next.js.
2. Compila el código de Rust.
3. Abre la Ventana Nativa.
4. Intenta lanzar el ejecutable Sidecar. *(Nota: En etapa de desarrollo, si no tienes el `.exe` del sidecar generado aún, el UI usará "Mock Data" por defecto. Para usar el backend real en desarrollo sin compilar el `.exe`, levanta el servidor de Python manualmente en otra terminal con `uvicorn main:app --port 8000` y abre el frontend en el navegador `localhost:3000`)*.

---

## 📦 ¿Cómo compilar la App Final (.exe)?

Para entregar la aplicación final al cliente, debes empaquetar tanto el backend de Python como la ventana de React en un único instalador `.msi` o ejecutable `.exe` independiente.

### Paso 1: Compilar el Sidecar (Python)
No queremos que el usuario final tenga que instalar Python. Por ende, lo empaquetamos con PyInstaller:

```bash
cd backend-python
# Instala las dependencias
pip install -r requirements.txt
pip install pyinstaller

# Genera el ejecutable único (tardará unos minutos)
pyinstaller --onefile --name cdcart-backend main.py
```
Una vez terminado, copia el archivo generado `dist/cdcart-backend.exe`.
Pégalo en la carpeta del frontend y **renómbralo exactamente así**:
`frontend-app/src-tauri/binaries/cdcart-backend-x86_64-pc-windows-msvc.exe`

### Paso 2: Compilar Tauri (Release)
Ahora que Tauri ya tiene el binario del Sidecar listo para incrustarlo, construye la aplicación completa:

```bash
cd frontend-app
pnpm tauri build
```

Al terminar, Tauri habrá generado los instaladores finales (listos para distribuir) en:
`frontend-app/src-tauri/target/release/bundle/msi/`