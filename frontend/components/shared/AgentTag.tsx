"use client";

export function AgentTag({ agent }: { agent: string }) {
  const label = agent === "MATHEMATICIAN" ? "MATH" : agent;
  return <span className="status-pill text-[#00FF41]/70">{label}</span>;
}
