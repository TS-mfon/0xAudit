"use client";

import { severityOrder } from "../../lib/theme";
import type { Finding } from "../../types/audit";
import { FindingCard } from "./FindingCard";

export function FindingsList({ findings }: { findings: Finding[] }) {
  if (!findings?.length) {
    return <p className="panel p-4 text-foreground-muted">No findings yet. The three-agent panel will stream results here.</p>;
  }

  const sorted = [...findings].sort((a, b) => severityOrder.indexOf(a.severity) - severityOrder.indexOf(b.severity));
  return (
    <div>
      {sorted.map((f, index) => (
        <FindingCard key={f.id || f.finding_id || index} finding={f} />
      ))}
    </div>
  );
}
