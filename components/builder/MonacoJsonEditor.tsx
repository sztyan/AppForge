"use client";

/**
 * MonacoJsonEditor — wraps @monaco-editor/react with:
 *  - Dark theme (vs-dark)
 *  - JSON language + schema validation
 *  - Auto-format on mount
 *  - SSR-safe (this file is always "use client", caller uses next/dynamic)
 */

import Editor, { type OnMount } from "@monaco-editor/react";

interface MonacoJsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
}

export default function MonacoJsonEditor({
  value,
  onChange,
  height = "100%",
}: MonacoJsonEditorProps) {
  const handleMount: OnMount = (editor, monaco) => {
    // Configure JSON validation / diagnostics
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: false,
      schemas: [],
      enableSchemaRequest: false,
    });

    // Auto-format on mount (after a tick so the model is ready)
    setTimeout(() => {
      editor.getAction("editor.action.formatDocument")?.run();
    }, 100);

    // Focus the editor
    editor.focus();
  };

  return (
    <Editor
      height={height}
      defaultLanguage="json"
      value={value}
      theme="vs-dark"
      onChange={(v) => onChange(v ?? "")}
      onMount={handleMount}
      options={{
        fontSize: 13,
        fontFamily: "var(--font-geist-mono), 'Fira Code', monospace",
        lineNumbers: "on",
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        wordWrap: "on",
        tabSize: 2,
        formatOnPaste: true,
        formatOnType: true,
        automaticLayout: true,
        padding: { top: 16, bottom: 16 },
        renderLineHighlight: "all",
        smoothScrolling: true,
        cursorBlinking: "phase",
        bracketPairColorization: { enabled: true },
      }}
    />
  );
}
