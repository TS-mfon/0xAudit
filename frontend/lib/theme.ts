export const severityOrder = ["Critical", "High", "Medium", "Low", "Informational"] as const;

export function verdictTone(verdict: string) {
  if (verdict === "Strong") return "text-strong border-strong/50 bg-strong/10";
  if (verdict === "Moderate") return "text-moderate border-moderate/50 bg-moderate/10";
  return "text-critical border-critical/50 bg-critical/10";
}

export function severityTone(severity: string) {
  if (severity === "Critical") return "text-critical border-critical/50 bg-critical/10";
  if (severity === "High") return "text-critical border-critical/40 bg-critical/5";
  if (severity === "Medium") return "text-moderate border-moderate/50 bg-moderate/10";
  if (severity === "Low") return "text-info border-info/50 bg-info/10";
  return "text-foreground-muted border-panel-border bg-panel";
}
