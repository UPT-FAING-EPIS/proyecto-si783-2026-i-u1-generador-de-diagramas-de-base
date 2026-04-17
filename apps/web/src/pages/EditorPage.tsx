import React from "react";
import { CodeEditor, DiagramViewer } from "@dbcanvas/ui";

const DEFAULT_SQL = `-- Pega tu SQL DDL aquí
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name TEXT
);`;

const DEFAULT_MERMAID = `erDiagram
  USERS {
    int id PK
    string email
    string name
  }`;

export function EditorPage() {
    const [value, setValue] = React.useState(DEFAULT_SQL);

    return (
        <div className="h-full min-h-screen flex flex-col bg-white text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
            <header className="h-12 shrink-0 px-4 flex items-center border-b border-neutral-200 dark:border-neutral-800">
                <div className="text-sm font-semibold">DBCanvas Editor</div>
            </header>

            <main className="flex-1 min-h-0 flex">
                <section className="w-1/2 min-w-0 p-4 border-r border-neutral-200 dark:border-neutral-800">
                    <CodeEditor value={value} onChange={setValue} language="sql" />
                </section>

                <section className="w-1/2 min-w-0 p-4">
                    <DiagramViewer mermaidCode={DEFAULT_MERMAID} />
                </section>
            </main>
        </div>
    );
}

