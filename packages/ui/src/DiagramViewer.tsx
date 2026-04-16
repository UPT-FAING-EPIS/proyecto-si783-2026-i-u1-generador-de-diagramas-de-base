import React from "react";

interface DiagramViewerProps {
    /** Código Mermaid ERD a visualizar */
    mermaidCode: string;
}

/**
 * Placeholder: Renderiza el código Mermaid como texto preformateado.
 * La integración real con mermaid.js se implementa en Issue #21.
 */
export function DiagramViewer({ mermaidCode }: DiagramViewerProps) {
    return (
        <div className="w-full h-full flex items-center justify-center bg-neutral-50 dark:bg-neutral-900 rounded-md border border-neutral-200 dark:border-neutral-700">
            {mermaidCode ? (
                <pre className="text-xs text-neutral-600 dark:text-neutral-300 p-4 whitespace-pre-wrap font-mono max-w-full overflow-auto">
                    {mermaidCode}
                </pre>
            ) : (
                <span className="text-sm text-neutral-400 dark:text-neutral-500 italic">
                    El diagrama aparecerá aquí...
                </span>
            )}
        </div>
    );
}
