"use client";

import Editor from "@monaco-editor/react";

export function CodeEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  return (
    <div className="terminal-card overflow-hidden">
      <div className="flex items-center justify-between border-b border-[#00FF41]/40 px-3 py-2 text-xs text-[#00FF41]/65">
        <span>SOLIDITY_SOURCE_BUFFER</span>
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
          fontFamily: "JetBrains Mono, SFMono-Regular, Consolas, monospace",
          wordWrap: "on",
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 },
          lineNumbers: "on",
          glyphMargin: false,
          renderLineHighlight: "line",
        }}
      />
    </div>
  );
}
