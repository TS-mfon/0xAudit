import Link from "next/link";
import { getAuditStats, getRecentAuditSummaries } from "../../lib/genlayer";
import { verdictTone } from "../../lib/theme";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [stats, audits] = await Promise.all([
    getAuditStats().catch(() => null),
    getRecentAuditSummaries(12).catch(() => []),
  ]);

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-6">
      <section className="terminal-card p-5">
        <p className="terminal-label">$ tail -f /var/log/0xaudit/studionet.activity</p>
        <h1 className="terminal-title mt-2 text-3xl">GLOBAL_MONITOR</h1>
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          {[
            ["RPC", "[READY]"],
            ["ENGINE", "[READY]"],
            ["AGENTS", "[READY]"],
            ["FEED", "[LIVE]"],
          ].map(([label, value]) => (
            <div key={label} className="border border-[#00FF41]/40 bg-black p-3">
              <p className="terminal-label">{label}</p>
              <p className="mt-2 text-sm font-bold">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <div className="terminal-card p-4">
            <p className="terminal-title text-sm">PERFORMANCE_HUD</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-[#00FF41]/35 bg-black p-3">
                <p className="terminal-label">AUDITS</p>
                <p className="mt-2 text-3xl font-black">{String((stats as any)?.total_audits ?? "--")}</p>
              </div>
              <div className="border border-[#00FF41]/35 bg-black p-3">
                <p className="terminal-label">FINDINGS</p>
                <p className="critical-text mt-2 text-3xl font-black">{String((stats as any)?.total_findings ?? "--")}</p>
              </div>
            </div>
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-[10px] text-[#00FF41]/60">
                <span>COMPUTE_LOAD</span>
                <span>71%</span>
              </div>
              <div className="compute-load">{Array.from({ length: 24 }).map((_, index) => <span key={index} />)}</div>
            </div>
          </div>
          <div className="terminal-card p-4 text-xs text-[#00FF41]/65">
            <p className="terminal-title text-sm">ENGINE_ADDRESS</p>
            <p className="mt-3 break-all">{process.env.NEXT_PUBLIC_GENLAYER_ENGINE_ADDRESS || "UNCONFIGURED"}</p>
          </div>
        </aside>

        <div className="terminal-card p-4">
          <div className="flex items-center justify-between border-b border-[#00FF41]/40 pb-3">
            <p className="terminal-title text-sm">ACTIVITY_STREAM</p>
            <span className="status-pill">[SCROLLING]</span>
          </div>
          <div className="mt-3 max-h-[640px] space-y-3 overflow-y-auto pr-1">
            {audits.map((audit) => (
              <Link key={audit.audit_id} href={`/audit/${audit.audit_id}`} className="block border border-[#00FF41]/30 bg-black p-3 hover:border-[#00FF41]">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`status-pill ${verdictTone(audit.verdict)}`}>{audit.verdict || "PENDING"}:{audit.score}</span>
                  <span className="text-xs text-[#00FF41]/55">tx::{audit.audit_id.slice(0, 10)}...</span>
                </div>
                <p className="mt-3 break-all text-xs text-[#00FF41]/70">{audit.contract_hash}</p>
                <p className="mt-2 text-xs text-[#00FF41]/55">findings={audit.findings_count} critical={audit.critical_count} high={audit.high_count}</p>
              </Link>
            ))}
            {!audits.length && <p className="text-sm text-[#00FF41]/60">NO_ACTIVITY_READABLE // STUDIO_BUSY_RETRY</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
