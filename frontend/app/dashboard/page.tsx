import Link from "next/link";
import { getAuditStats, getRecentAudits } from "../../lib/genlayer";
import { verdictTone } from "../../lib/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, audits] = await Promise.all([getAuditStats().catch(() => null), getRecentAudits(30).catch(() => [])]);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <p className="font-mono text-sm uppercase tracking-widest text-strong">$ tail -f studionet/activity</p>
      <h1 className="mt-2 font-mono text-3xl font-black">Live audit activity</h1>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="panel p-4 font-mono text-sm text-foreground-muted">audits<br /><span className="text-3xl text-strong">{String((stats as any)?.total_audits ?? 0)}</span></div>
        <div className="panel p-4 font-mono text-sm text-foreground-muted">findings<br /><span className="text-3xl text-strong">{String((stats as any)?.total_findings ?? 0)}</span></div>
        <div className="panel p-4 font-mono text-sm text-foreground-muted">engine<br /><span className="text-xs text-strong">{process.env.NEXT_PUBLIC_GENLAYER_ENGINE_ADDRESS || "pending deploy"}</span></div>
      </div>
      <div className="mt-6 space-y-4">
        {audits.map((audit) => (
          <Link key={audit.audit_id} href={`/audit/${audit.audit_id}`} className="panel flex flex-wrap items-center justify-between gap-4 p-5 hover:border-strong/50">
            <div>
              <p className="font-mono text-sm text-foreground">{audit.audit_id}</p>
              <p className="mt-1 break-all font-mono text-xs text-foreground-muted">{audit.contract_hash}</p>
            </div>
            <span className={`rounded border px-3 py-1 font-mono text-sm ${verdictTone(audit.verdict)}`}>{audit.verdict} {audit.score}</span>
            <span className="font-mono text-sm text-foreground-muted">{audit.findings_count} findings</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
