import React, { useCallback, useRef } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

interface CodeEditorProps {
    value: string;
    onChange: (value: string) => void;
    language?: "sql" | "json";
}

export function CodeEditor({ value, onChange, language = "sql" }: CodeEditorProps) {
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const handleChange = useCallback(
        (val: string | undefined) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                onChange(val ?? "");
            }, 300);
        },
        [onChange]
    );

    const handleEditorMount: OnMount = (editor, monaco) => {
        const domNode = editor.getDomNode();
        if (!domNode) return;

        domNode.addEventListener("dragover", (e) => e.preventDefault());

        domNode.addEventListener("drop", (e) => {
            e.preventDefault();
            const file = e.dataTransfer?.files[0];
            if (!file) return;
            const ext = file.name.split(".").pop()?.toLowerCase();
            if (ext !== "sql" && ext !== "json") return;
            const reader = new FileReader();
            reader.onload = (event) => {
                const content = event.target?.result as string;
                editor.setValue(content);
                onChange(content);
            };
            reader.readAsText(file);
        });

        monaco.languages.register({ id: "mermaid" });
        monaco.languages.setMonarchTokensProvider("mermaid", {
            tokenizer: {
                root: [
                    [/erDiagram|classDiagram|sequenceDiagram|flowchart/, "keyword"],
                    [/\{|\}/, "delimiter.bracket"],
                    [/PK|FK|UK/, "type"],
                    [/".*?"/, "string"],
                    [/--/, "comment"],
                ],
            },
        });
    };

    return (
        <div className="w-full h-full flex flex-col rounded-md overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 shrink-0">
                <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    {language === "sql" ? "SQL DDL" : "JSON Schema"}
                </span>
                <span className="text-xs text-neutral-400 dark:text-neutral-500 ml-auto">
                    Arrastra un archivo .{language} aquí
                </span>
            </div>
            <div className="flex-1 overflow-hidden">
                <Editor
                    height="100%"
                    language={language}
                    value={value}
                    onChange={handleChange}
                    onMount={handleEditorMount}
                    theme="vs-dark"
                    options={{
                        fontSize: 13,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        lineNumbers: "on",
                        renderLineHighlight: "line",
                        tabSize: 2,
                        wordWrap: "on",
                        padding: { top: 12, bottom: 12 },
                        smoothScrolling: true,
                        cursorBlinking: "smooth",
                    }}
                />
            </div>
        </div>
    );
}