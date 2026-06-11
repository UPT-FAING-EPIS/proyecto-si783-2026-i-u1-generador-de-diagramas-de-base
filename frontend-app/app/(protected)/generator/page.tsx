'use client';

import { useState, useEffect } from 'react';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { SchemaViewer } from '@/components/generator/SchemaViewer';
import { DataPreview } from '@/components/generator/DataPreview';
import { ExportPanel } from '@/components/generator/ExportPanel';
import { Database } from 'lucide-react';
import { generatorAPI } from '@/lib/api/client';
import { useConnectionStore } from '@/lib/store/useConnectionStore';

export default function GeneratorPage() {
  const { activeConnection } = useConnectionStore();
  
  const [tables, setTables] = useState<{name: string, rowCount: number}[]>([]);
  const [selectedTables, setSelectedTables] = useState<string[]>([]);
  
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  
  const [isExporting, setIsExporting] = useState(false);
  const [isInserting, setIsInserting] = useState(false);
  const [isLoadingSchema, setIsLoadingSchema] = useState(false);

  useEffect(() => {
    if (activeConnection) {
      loadSchema();
    }
  }, [activeConnection]);

  const loadSchema = async () => {
    setIsLoadingSchema(true);
    try {
      const schemaData = await generatorAPI.getSchema(activeConnection);
      if ((schemaData as any).tables) {
        setTables((schemaData as any).tables.map((t: any) => ({ name: typeof t === 'string' ? t : t.name, rowCount: 100 })));
      }
    } catch (error) {
      console.warn("Backend falló. Usando MOCK DATA para el UI.");
      setTimeout(() => {
        setTables([
          { name: 'users', rowCount: 100 },
          { name: 'posts', rowCount: 500 },
          { name: 'comments', rowCount: 1500 },
          { name: 'categories', rowCount: 15 }
        ]);
        setSelectedTables(['users', 'posts']);
        setIsLoadingSchema(false);
      }, 800);
      return;
    }
    setIsLoadingSchema(false);
  };

  const handleToggleTable = (tableName: string) => {
    setSelectedTables(prev => 
      prev.includes(tableName) 
        ? prev.filter(t => t !== tableName)
        : [...prev, tableName]
    );
  };

  const handleSelectAll = () => setSelectedTables(tables.map(t => t.name));
  const handleDeselectAll = () => setSelectedTables([]);

  const handleRowCountChange = (tableName: string, count: number) => {
    setTables(prev => prev.map(t => t.name === tableName ? { ...t, rowCount: count } : t));
  };

  const handleGeneratePreview = async () => {
    setIsPreviewing(true);
    try {
      // Create schema object and table configs
      const fullSchema = await generatorAPI.getSchema(activeConnection);
      
      const payload = {
        schema: fullSchema,
        table_configs: tables.filter(t => selectedTables.includes(t.name)).map(t => ({
          table_name: t.name,
          record_count: t.rowCount,
          selected: true
        })),
        preview_rows: 10,
        locale: 'es_ES'
      };
      
      const result = await generatorAPI.generatePreview({ ...payload, connection: activeConnection });
      setPreviewData(result);
    } catch (error) {
      console.warn("Backend falló. Usando MOCK DATA para preview.");
      setTimeout(() => {
        setPreviewData({
          users: [
            { id: 1, name: 'Alice', email: 'alice@example.com' },
            { id: 2, name: 'Bob', email: 'bob@example.com' }
          ],
          posts: [
            { id: 1, user_id: 1, title: 'Hello World', content: '...' }
          ]
        });
        setIsPreviewing(false);
      }, 600);
      return;
    }
    setIsPreviewing(false);
  };

  const handleExport = async (format: string) => {
    setIsExporting(true);
    try {
      const fullSchema = await generatorAPI.getSchema(activeConnection);
      await generatorAPI.exportData({
        connection: activeConnection,
        schema: fullSchema,
        table_configs: tables.filter(t => selectedTables.includes(t.name)).map(t => ({
          table_name: t.name,
          record_count: t.rowCount,
          selected: true
        })),
        format,
        locale: 'es_ES'
      });
      alert(`Exportación a ${format.toUpperCase()} iniciada.`);
    } catch (error) {
      alert(`Error exportando: Asegúrate de tener conexión al backend.`);
    } finally {
      setIsExporting(false);
    }
  };

  const handleInsertDirectly = async () => {
    setIsInserting(true);
    try {
      const fullSchema = await generatorAPI.getSchema(activeConnection);
      await generatorAPI.insertData({
        connection: activeConnection,
        schema: fullSchema,
        table_configs: tables.filter(t => selectedTables.includes(t.name)).map(t => ({
          table_name: t.name,
          record_count: t.rowCount,
          selected: true
        })),
        locale: 'es_ES'
      });
      alert('Datos insertados exitosamente.');
    } catch (error) {
      alert(`Error insertando datos: Asegúrate de tener conexión al backend.`);
    } finally {
      setIsInserting(false);
    }
  };

  const isConfigured = selectedTables.length > 0;

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#0A0F1E' }}>
      <DashboardSidebar
        userName="Usuario Local"
        activeSection=""
        onSectionChange={() => {}}
      />
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="border-b border-[#1E2A45] bg-[#111827] sticky top-0 z-10 shadow-sm flex-shrink-0">
          <div className="container mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Database className="w-5 h-5 text-blue-500 mr-3" />
              <span className="text-base font-semibold text-white">Generador de Datos Ficticios</span>
            </div>
            {isLoadingSchema && (
              <div className="text-xs text-blue-400 flex items-center gap-2">
                <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                Cargando esquema...
              </div>
            )}
          </div>
        </header>
        
        <div className="flex-1 overflow-auto">
          <div className="container mx-auto px-6 py-8 max-w-5xl flex flex-col gap-8 pb-20">
            
            <div className={`transition-all duration-500 ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <SchemaViewer 
                tables={tables}
                selectedTables={selectedTables}
                onToggleTable={handleToggleTable}
                onSelectAll={handleSelectAll}
                onDeselectAll={handleDeselectAll}
                onRowCountChange={handleRowCountChange}
              />
            </div>

            <div className={`grid grid-cols-1 xl:grid-cols-2 gap-8 transition-all duration-500 ${!isLoadingSchema ? 'opacity-100 translate-y-0' : 'opacity-50 pointer-events-none translate-y-4'}`}>
              <DataPreview 
                previewData={previewData}
                isLoading={isPreviewing}
                onGeneratePreview={handleGeneratePreview}
                disabled={!isConfigured}
              />
              <ExportPanel 
                onExport={handleExport}
                onInsertDirectly={handleInsertDirectly}
                isExporting={isExporting}
                isInserting={isInserting}
                disabled={!isConfigured}
              />
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
