"use client";

import { severityTone } from "../../lib/theme";

export function SeverityBadge({ severity }: { severity: string }) {
  return <span className={`status-pill ${severityTone(severity)}`}>{severity}</span>;
}
