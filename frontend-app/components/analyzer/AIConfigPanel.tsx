'use client';

import { useState } from 'react';
import { Bot, Settings2 } from 'lucide-react';

interface AIConfigPanelProps {
  onSaveConfig: (config: any) => void;
  onAnalyzeWithAI: () => void;
  isAnalyzingAI: boolean;
  disabled: boolean;
}

export function AIConfigPanel({ onSaveConfig, onAnalyzeWithAI, isAnalyzingAI, disabled }: AIConfigPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({
    provider: 'openai',
    apiKey: '',
    model: 'gpt-4o'
  });

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div 
        className="flex items-center justify-between p-4 bg-gray-800/50 cursor-pointer hover:bg-gray-800 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-blue-400" />
          <h2 className="font-semibold text-white">Asistente IA</h2>
        </div>
        <Settings2 className="w-4 h-4 text-gray-400" />
      </div>

      {isOpen && (
        <div className="p-4 border-t border-gray-800 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Proveedor</label>
            <select 
              value={config.provider}
              onChange={(e) => setConfig({...config, provider: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
              <option value="gemini">Google Gemini</option>
              <option value="ollama">Ollama (Local)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">API Key</label>
            <input 
              type="password"
              value={config.apiKey}
              onChange={(e) => setConfig({...config, apiKey: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              placeholder="sk-..."
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Modelo</label>
            <input 
              type="text"
              value={config.model}
              onChange={(e) => setConfig({...config, model: e.target.value})}
              className="w-full bg-gray-950 border border-gray-700 rounded px-3 py-1.5 text-sm text-white focus:border-blue-500 focus:outline-none"
              placeholder="gpt-4o"
            />
          </div>

          <button
            onClick={() => onSaveConfig(config)}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white py-1.5 rounded text-sm font-medium transition-colors"
          >
            Guardar Configuración
          </button>
        </div>
      )}

      <div className="p-4 bg-gray-900 border-t border-gray-800">
        <button 
          onClick={onAnalyzeWithAI}
          disabled={disabled || isAnalyzingAI}
          className="w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isAnalyzingAI ? (
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Bot className="w-4 h-4" />
          )}
          Explicar con IA
        </button>
      </div>
    </div>
  );
}
