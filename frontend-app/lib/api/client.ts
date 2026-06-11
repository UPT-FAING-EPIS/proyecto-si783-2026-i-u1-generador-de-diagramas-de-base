import { invoke } from '@tauri-apps/api/core';

// Por defecto usamos el 8000 si no estamos en Tauri (ej. desarrollo web normal)
let API_BASE = 'http://localhost:8000/api/v1';

// Función para inicializar el puerto dinámico de Tauri
export async function initApiClient() {
  try {
    const port = await invoke<number>('get_sidecar_port');
    API_BASE = `http://localhost:${port}/api/v1`;
    console.log(`[API Client] Conectado al sidecar en el puerto ${port}`);
  } catch (error) {
    console.warn('[API Client] No se pudo obtener el puerto del sidecar de Tauri. Usando puerto por defecto 8000.', error);
  }
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!response.ok) {
    let errMessage = 'API Call Failed';
    try {
      const errBody = await response.json();
      errMessage = errBody.detail || errBody.message || errMessage;
    } catch {
      // Ignorar si no hay JSON
    }
    throw new Error(errMessage);
  }

  return response.json() as Promise<T>;
}

// ============================================================================
// ER DIAGRAMS (Supabase Replacement)
// ============================================================================
export const projectsAPI = {
  list: () => apiCall<any[]>('/projects'),
  get: (id: string) => apiCall<any>(`/projects/${id}`),
  create: (data: any) => apiCall<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: any) => apiCall<any>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<void>(`/projects/${id}`, { method: 'DELETE' }),
};

export const diagramsAPI = {
  listByProject: (projectId: string) => apiCall<any[]>(`/diagrams?projectId=${projectId}`),
  getById: (id: string) => apiCall<any>(`/diagrams/${id}`),
  load: async (projectId: string) => {
    const list = await diagramsAPI.listByProject(projectId)
    if (list.length > 0) return list[0]
    return null
  },
  create: (data: any) => apiCall<any>('/diagrams', { method: 'POST', body: JSON.stringify(data) }),
  generate: (projectId: string, payload: any) => apiCall<any>(`/diagrams/generate?projectId=${projectId}`, { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForGenerator(payload.connection) }) 
  }),
  update: (id: string, data: any) => apiCall<any>(`/diagrams/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<any>(`/diagrams/${id}`, { method: 'DELETE' }),
};

export const versionsAPI = {
  listByDiagram: (diagramId: string) => apiCall<any[]>(`/versions?diagramId=${diagramId}`),
  list: (diagramId: string) => apiCall<any[]>(`/versions?diagramId=${diagramId}`), // alias
  create: (data: any) => apiCall<any>('/versions', { method: 'POST', body: JSON.stringify(data) }),
  delete: async (id: string) => ({ success: true }), // Mock for now
  detail: async (id: string) => null, // Mock
  restore: async (id: string) => ({ success: true }), // Mock
};

// ============================================================================
// DATA GENERATOR & CONNECTION MAPPING
// ============================================================================

const mapConnectionForGenerator = (config: any) => ({
  host: config.host || 'localhost',
  puerto: parseInt(config.port || config.puerto || '5432', 10),
  usuario: config.username || config.usuario || 'postgres',
  password: config.password || config.password_db || '',
  nombre_bd: config.database || config.nombre_bd || '',
  motor: config.engine || config.motor || 'postgresql'
});

export const generatorAPI = {
  testConnection: (config: any) => apiCall<any>('/connect/test', { method: 'POST', body: JSON.stringify(mapConnectionForGenerator(config)) }),
  getSchema: (config: any) => apiCall<any>('/connect/schema', { method: 'POST', body: JSON.stringify(mapConnectionForGenerator(config)) }),
  generatePreview: (payload: any) => apiCall<any>('/generate/preview', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForGenerator(payload.connection) }) 
  }),
  exportData: (payload: any) => apiCall<any>('/generate/export', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForGenerator(payload.connection) }) 
  }),
  insertData: (payload: any) => apiCall<any>('/connect/insert', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForGenerator(payload.connection) }) 
  }),
};

// ============================================================================
// QUERY ANALYZER
// ============================================================================

const mapConnectionForAnalyzer = (config: any) => ({
  engine: config.engine || config.motor || 'postgresql',
  host: config.host || 'localhost',
  port: parseInt(config.port || config.puerto || '5432', 10),
  username: config.username || config.usuario || 'postgres',
  password: config.password || config.password_db || '',
  database: config.database || config.nombre_bd || ''
});

export const analyzerAPI = {
  getEngineInfo: (payload: any) => apiCall<any>('/analyzer/metrics', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }) 
  }),
  explain: (payload: { connection: any; query: string }) => apiCall<any>('/analyzer/explain', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }) 
  }),
  aiAnalyze: (payload: { ai_config: any; plan_json: any; query: string; engine: string }) => apiCall<any>('/analyzer/ai', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  }),
  getSlowQueries: (payload: any) => apiCall<any[]>('/analyzer/slow-queries', { 
    method: 'POST', 
    body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }) 
  }),
};

