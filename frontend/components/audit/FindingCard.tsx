"use client";

import type { Finding } from "../../types/audit";
import { AgentTag } from "../shared/AgentTag";
import { SeverityBadge } from "../shared/SeverityBadge";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className="terminal-card mb-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <AgentTag agent={finding.agent} />
            <span className="text-xs text-[#00FF41]/55">{finding.id || finding.finding_id}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{finding.title}</h3>
        </div>
        <span className="text-xs text-[#00FF41]/55">{finding.line_reference}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-[#00FF41]/65 md:grid-cols-2">
        <p><span className="text-[#00FF41]">ROOT_CAUSE:</span> {finding.root_cause}</p>
        <p><span className="critical-text">IMPACT:</span> {finding.impact}</p>
      </div>
      <p className="mt-3 text-sm text-[#00FF41]/65"><span className="text-[#00FF41]">EXPLOIT:</span> {finding.exploit_vector}</p>
      <details className="mt-4">
        <summary className="cursor-pointer text-sm text-[#00FF41]">VIEW_CODE_AND_PATCH</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <pre className="code-terminal overflow-auto border-red-500/50 p-3 text-xs">{finding.vulnerable_code}</pre>
          <pre className="code-terminal overflow-auto p-3 text-xs">{finding.secured_code}</pre>
        </div>
      </details>
    </article>
  );
}
