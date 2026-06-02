"use client";

export function AgentTag({ agent }: { agent: string }) {
  const label = agent === "MATHEMATICIAN" ? "MATH" : agent;
  return <span className="rounded border border-panel-border bg-panel px-2 py-1 font-mono text-xs text-foreground-muted">{label}</span>;
}
