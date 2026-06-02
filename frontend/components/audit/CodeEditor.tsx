"use client";

import Editor from "@monaco-editor/react";

export function CodeEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="overflow-hidden rounded border border-panel-border bg-code">
      <div className="flex items-center justify-between border-b border-panel-border px-3 py-2 font-mono text-xs text-foreground-muted">
        <span>Solidity source</span>
        <span>{value.length.toLocaleString()} bytes</span>
      </div>
      <Editor
        height="520px"
        defaultLanguage="sol"
        value={value}
        onChange={(v) => onChange(v || "")}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 13,
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
        }}
      />
    </div>
  );
}
