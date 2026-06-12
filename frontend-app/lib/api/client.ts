import { invoke } from '@tauri-apps/api/core';
import type { DatabaseConnection } from '@/lib/store/useConnectionStore';
import type { FlowJson } from '@/lib/flow-types';
import type { EditorDialect } from '@/lib/editor-schema';

let API_ROOT = 'http://localhost:8000';
let API_BASE = `${API_ROOT}/api/v1`;

type JsonObject = Record<string, unknown>;

export interface ProjectResponse {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_public: boolean;
  share_access: 'view' | 'edit';
}

interface DiagramResponse {
  id: number;
  project_id: number;
  name: string;
  schema_json: string | null;
  sql_content: string;
  active_dialect: EditorDialect;
}

export interface DiagramData {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  flowJson: FlowJson;
  sourceCode: string;
  dialect: EditorDialect;
  isPublic: boolean;
  shareAccess: 'view' | 'edit';
}

export interface VersionSummary {
  id: string;
  versionNumber: number;
  message: string;
  userId: string;
  createdAt: string;
  authorName: string;
}

export interface VersionDetail extends VersionSummary {
  flowJson: FlowJson;
  sqlContent: string;
  activeDialect: EditorDialect;
  snapshots: Record<EditorDialect, string>;
}

interface VersionWire {
  id: number;
  version_number: number;
  message: string;
  created_at: string;
  flow_json?: FlowJson;
  sql_content?: string;
  active_dialect?: EditorDialect;
  snapshots?: Record<EditorDialect, string>;
}

export async function initApiClient() {
  try {
    const port = await invoke<number>('get_sidecar_port');
    API_ROOT = `http://localhost:${port}`;
    API_BASE = `${API_ROOT}/api/v1`;
  } catch {
    // Browser development uses the conventional local backend port.
  }
}

export async function healthCheck() {
  const response = await fetch(`${API_ROOT}/health`);
  if (!response.ok) {
    throw new Error(`Backend health check failed (${response.status})`);
  }
  return response.json() as Promise<{ status: string; message?: string }>;
}

async function apiCall<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  if (!response.ok) {
    let message = `API request failed (${response.status})`;
    try {
      const body = await response.json() as { detail?: string; message?: string };
      message = body.detail || body.message || message;
    } catch {
      // Keep the status-based message for non-JSON responses.
    }
    throw new Error(message);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

function parseFlow(value: string | null): FlowJson {
  if (!value) return { nodes: [], edges: [] };
  try {
    return JSON.parse(value) as FlowJson;
  } catch {
    return { nodes: [], edges: [] };
  }
}

function mapVersion(version: VersionWire): VersionSummary {
  return {
    id: String(version.id),
    versionNumber: version.version_number,
    message: version.message,
    userId: 'local-user',
    createdAt: version.created_at,
    authorName: 'Usuario Local',
  };
}

function mapVersionDetail(version: VersionWire): VersionDetail {
  return {
    ...mapVersion(version),
    flowJson: version.flow_json ?? { nodes: [], edges: [] },
    sqlContent: version.sql_content ?? '',
    activeDialect: version.active_dialect ?? 'postgresql',
    snapshots: version.snapshots ?? {
      postgresql: '',
      mysql: '',
      sqlserver: '',
      json: '',
    },
  };
}

export const projectsAPI = {
  list: () => apiCall<ProjectResponse[]>('/projects'),
  get: (id: string) => apiCall<ProjectResponse>(`/projects/${id}`),
  create: (data: { name: string; description?: string }) =>
    apiCall<ProjectResponse>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: { name?: string; description?: string }) =>
    apiCall<ProjectResponse>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) => apiCall<{ ok: boolean }>(`/projects/${id}`, { method: 'DELETE' }),
  restore: (id: string) => apiCall<ProjectResponse>(`/projects/${id}/restore`, { method: 'POST' }),
  permanentlyDelete: (id: string) =>
    apiCall<{ ok: boolean }>(`/projects/${id}/permanent`, { method: 'DELETE' }),
  togglePublic: (id: string, isPublic: boolean, access = 'view') =>
    apiCall<ProjectResponse>(
      `/projects/${id}/sharing?is_public=${isPublic}&access=${encodeURIComponent(access)}`,
      { method: 'PATCH' },
    ),
};

export const diagramsAPI = {
  listByProject: (projectId: string) =>
    apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`),
  load: async (projectId: string): Promise<DiagramData | null> => {
    const [project, diagrams] = await Promise.all([
      projectsAPI.get(projectId),
      apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`),
    ]);
    const diagram = diagrams[0];
    if (!diagram) {
      return {
        id: projectId,
        projectId,
        projectName: project.name,
        name: 'Diagrama Principal',
        flowJson: { nodes: [], edges: [] },
        sourceCode: '',
        dialect: 'postgresql',
        isPublic: project.is_public,
        shareAccess: project.share_access,
      };
    }

    return {
      id: String(diagram.id),
      projectId: String(diagram.project_id),
      projectName: project.name,
      name: diagram.name,
      flowJson: parseFlow(diagram.schema_json),
      sourceCode: diagram.sql_content,
      dialect: diagram.active_dialect,
      isPublic: project.is_public,
      shareAccess: project.share_access,
    };
  },
  create: (data: JsonObject) =>
    apiCall<DiagramResponse>('/diagrams', { method: 'POST', body: JSON.stringify(data) }),
  generate: (projectId: string, payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<DiagramResponse>(`/diagrams/generate?projectId=${projectId}`, {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        connection: mapConnectionForGenerator(payload.connection),
      }),
    }),
  saveByProject: async (
    projectId: string,
    data: { schema_json: string; sql_content: string; active_dialect: string },
  ) => {
    const diagrams = await apiCall<DiagramResponse[]>(`/diagrams?projectId=${projectId}`);
    const diagram = diagrams[0];
    if (!diagram) {
      return apiCall<DiagramResponse>('/diagrams', {
        method: 'POST',
        body: JSON.stringify({
          project_id: Number(projectId),
          name: 'Diagrama Principal',
          ...data,
        }),
      });
    }

    return apiCall<DiagramResponse>(`/diagrams/${diagram.id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

export const versionsAPI = {
  listByProject: async (projectId: string) => {
    const versions = await apiCall<VersionWire[]>(`/versions?projectId=${projectId}`);
    return versions.map(mapVersion);
  },
  create: async (
    projectId: string,
    data: {
      message: string;
      flowJson: FlowJson;
      sqlContent: string;
      activeDialect: string;
      snapshots: Record<string, string>;
    },
  ) => {
    const version = await apiCall<VersionWire>('/versions', {
      method: 'POST',
      body: JSON.stringify({
        project_id: Number(projectId),
        message: data.message,
        flow_json: data.flowJson,
        sql_content: data.sqlContent,
        active_dialect: data.activeDialect,
        snapshots: data.snapshots,
      }),
    });
    return mapVersionDetail(version);
  },
  delete: (id: string) => apiCall<{ ok: boolean }>(`/versions/${id}`, { method: 'DELETE' }),
  detail: async (id: string) => mapVersionDetail(await apiCall<VersionWire>(`/versions/${id}`)),
  restore: async (id: string) =>
    mapVersionDetail(await apiCall<VersionWire>(`/versions/${id}/restore`, { method: 'POST' })),
};

const mapConnectionForGenerator = (config: DatabaseConnection) => ({
  host: config.host || 'localhost',
  puerto: Number.parseInt(config.port || '5432', 10),
  usuario: config.username || 'postgres',
  password: config.password || '',
  nombre_bd: config.database || '',
  motor: config.engine || 'postgresql',
});

export const generatorAPI = {
  testConnection: (config: DatabaseConnection) =>
    apiCall<JsonObject>('/connect/test', {
      method: 'POST',
      body: JSON.stringify(mapConnectionForGenerator(config)),
    }),
  getSchema: (config: DatabaseConnection) =>
    apiCall<{ tables: Array<string | { name: string }> }>('/connect/schema', {
      method: 'POST',
      body: JSON.stringify(mapConnectionForGenerator(config)),
    }),
  generatePreview: (payload: JsonObject) =>
    apiCall<JsonObject>('/generate/preview', { method: 'POST', body: JSON.stringify(payload) }),
  exportData: (payload: JsonObject) =>
    apiCall<JsonObject>('/generate/export', { method: 'POST', body: JSON.stringify(payload) }),
  insertData: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject>('/connect/insert', {
      method: 'POST',
      body: JSON.stringify({
        ...payload,
        connection: mapConnectionForGenerator(payload.connection),
      }),
    }),
};

const mapConnectionForAnalyzer = (config: DatabaseConnection) => ({
  engine: config.engine || 'postgresql',
  host: config.host || 'localhost',
  port: Number.parseInt(config.port || '5432', 10),
  username: config.username || 'postgres',
  password: config.password || '',
  database: config.database || '',
});

export const analyzerAPI = {
  getEngineInfo: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject>('/analyzer/metrics', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
  explain: (payload: { connection: DatabaseConnection; query: string }) =>
    apiCall<JsonObject>('/analyzer/explain', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
  aiAnalyze: (payload: JsonObject) =>
    apiCall<JsonObject>('/analyzer/ai', { method: 'POST', body: JSON.stringify(payload) }),
  getSlowQueries: (payload: JsonObject & { connection: DatabaseConnection }) =>
    apiCall<JsonObject[]>('/analyzer/slow-queries', {
      method: 'POST',
      body: JSON.stringify({ ...payload, connection: mapConnectionForAnalyzer(payload.connection) }),
    }),
};
