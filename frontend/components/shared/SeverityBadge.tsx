"use client";

import { severityTone } from "../../lib/theme";

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`rounded border px-2 py-1 font-mono text-xs ${severityTone(severity)}`}>{severity}</span>;
}
