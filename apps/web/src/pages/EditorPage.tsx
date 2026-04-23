import React from "react";
import { CodeEditor, DiagramViewer } from "@dbcanvas/ui";

const DEFAULT_MERMAID = `erDiagram
  USERS {
    int id PK
    string email
    string name
  }
  ORDERS {
    int id PK
    int user_id FK
    float total
  }
  USERS ||--o{ ORDERS : "tiene"`;

export function EditorPage() {
    const [mermaidCode, setMermaidCode] = React.useState(DEFAULT_MERMAID);

    return (
        <div className="h-full min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            <header className="h-12 shrink-0 px-4 flex items-center border-b border-neutral-200 dark:border-neutral-800">
                <div className="text-sm font-semibold">DBCanvas Editor</div>
            </header>

            <main className="flex-1 min-h-0 flex">
                <section className="w-1/2 min-w-0 p-4 border-r border-neutral-200 dark:border-neutral-800">
                    {/* Editor recibe y actualiza mermaidCode directamente */}
                    <CodeEditor
                        value={mermaidCode}
                        onChange={setMermaidCode}
                        language="sql"
                    />
                </section>

                <section className="w-1/2 min-w-0 p-4">
                    {/* Viewer recibe el mismo estado mermaidCode */}
                    <DiagramViewer mermaidCode={mermaidCode} />
                </section>
            </main>
        </div>
    );
}