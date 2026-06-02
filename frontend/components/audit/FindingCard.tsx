"use client";

import type { Finding } from "../../types/audit";
import { AgentTag } from "../shared/AgentTag";
import { SeverityBadge } from "../shared/SeverityBadge";

export function FindingCard({ finding }: { finding: Finding }) {
  return (
    <article className="panel mb-4 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <SeverityBadge severity={finding.severity} />
            <AgentTag agent={finding.agent} />
            <span className="font-mono text-xs text-foreground-muted">{finding.id || finding.finding_id}</span>
          </div>
          <h3 className="mt-3 text-lg font-semibold text-foreground">{finding.title}</h3>
        </div>
        <span className="font-mono text-xs text-foreground-muted">{finding.line_reference}</span>
      </div>
      <div className="mt-4 grid gap-3 text-sm text-foreground-muted md:grid-cols-2">
        <p><span className="text-foreground">Root cause:</span> {finding.root_cause}</p>
        <p><span className="text-foreground">Impact:</span> {finding.impact}</p>
      </div>
      <p className="mt-3 text-sm text-foreground-muted"><span className="text-foreground">Exploit:</span> {finding.exploit_vector}</p>
      <details className="mt-4">
        <summary className="cursor-pointer font-mono text-sm text-strong">View vulnerable code and secured patch</summary>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <pre className="overflow-auto rounded border border-critical/30 bg-critical/5 p-3 text-xs text-foreground-muted">{finding.vulnerable_code}</pre>
          <pre className="overflow-auto rounded border border-strong/30 bg-strong/5 p-3 text-xs text-foreground-muted">{finding.secured_code}</pre>
        </div>
      </details>
    </article>
  );
}
