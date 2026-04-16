import React from "react";

interface CodeEditorProps {
    /** Contenido actual del editor */
    value: string;
    /** Callback que se dispara cuando el contenido cambia */
    onChange: (value: string) => void;
    /** Lenguaje para syntax hint y placeholder */
    language?: "sql" | "json";
}

const PLACEHOLDERS: Record<string, string> = {
    sql: `-- Pega tu SQL DDL aquí
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name TEXT
);

CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INT REFERENCES users(id),
  total DECIMAL(10, 2)
);`,
    json: `{
  "$schema": "http://json-schema.org/draft-07/schema",
  "type": "object",
  "properties": {
    "name": { "type": "string" },
    "email": { "type": "string" }
  }
}`,
};

/**
 * Placeholder: Textarea simple con estilos básicos.
 * La integración real con Monaco Editor se implementa en Issue #20.
 */
export function CodeEditor({
    value,
    onChange,
    language = "sql",
}: CodeEditorProps) {
    return (
        <div className="w-full h-full flex flex-col rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
            {/* Barra superior con indicador de lenguaje */}
            <div className="px-3 py-1.5 flex items-center gap-2 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700">
                <span className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
                    {language}
                </span>
            </div>

            {/* Área de texto */}
            <textarea
                className="flex-1 w-full p-4 font-mono text-sm leading-relaxed bg-white dark:bg-neutral-900 text-neutral-800 dark:text-neutral-200 resize-none focus:outline-none focus:ring-2 focus:ring-inset focus:ring-teal-500"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={PLACEHOLDERS[language]}
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
            />
        </div>
    );
}
