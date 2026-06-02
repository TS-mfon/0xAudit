import Link from "next/link";
import { getAuditStats, getRecentAudits } from "../lib/genlayer";
import { verdictTone } from "../lib/theme";

export const dynamic = "force-dynamic";

async function loadData() {
  try {
    const [stats, audits] = await Promise.all([getAuditStats(), getRecentAudits(6)]);
    return { stats: stats as any, audits };
  } catch {
    return { stats: null, audits: [] };
  }
}

export default async function HomePage() {
  const { stats, audits } = await loadData();
  return (
    <main className="bg-obsidian">
      <section className="matrix-bg terminal-scan relative overflow-hidden border-b border-panel-border">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 lg:grid-cols-[1.08fr_0.92fr] lg:py-20">
          <div>
            <p className="font-mono text-sm uppercase tracking-widest text-strong">$ ./0xaudit --mode decentralized</p>
            <h1 className="mt-5 max-w-4xl font-mono text-5xl font-black leading-tight text-foreground md:text-7xl">Paste Contract. Execute Audit. Read Consensus.</h1>
            <p className="mt-6 max-w-2xl text-lg text-foreground-muted">
              0xAudit is a GenLayer-native security console for Solidity contracts. Three reasoning agents attack the code, inspect architecture, test invariants, and return a validator-backed verdict from StudioNet.
            </p>
            <p className="mt-4 max-w-2xl text-lg text-foreground-muted">
              No sales call. No static checklist theater. Just contract code, adversarial reasoning, and a traceable audit result.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/audit" className="rounded border border-strong bg-strong px-5 py-3 font-mono font-bold text-obsidian">Run paste audit</Link>
              <Link href="/dashboard" className="rounded border border-panel-border px-5 py-3 font-mono text-foreground">View activity</Link>
            </div>
          </div>
          <div className="terminal-window p-0">
            <div className="border-b border-panel-border px-4 py-3 font-mono text-xs text-foreground-muted">root@0xaudit:~/scan</div>
            <div className="space-y-4 p-5 font-mono text-sm">
              <p className="text-strong">$ boot agent panel</p>
              <p className="text-foreground-muted">ADVERSARY .... exploit surface mapped</p>
              <p className="text-foreground-muted">ARCHITECT .... protocol topology checked</p>
              <p className="text-foreground-muted">MATH ........ invariants extracted</p>
              <p className="text-strong">$ studio stats</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded border border-panel-border bg-obsidian p-3">audits<br /><span className="text-strong">{String(stats?.total_audits ?? 0)}</span></div>
                <div className="rounded border border-panel-border bg-obsidian p-3">findings<br /><span className="text-strong">{String(stats?.total_findings ?? 0)}</span></div>
              </div>
              <p className="text-strong">$ compare --target traditional-audit</p>
              {[
                ["Turnaround", "weeks", "minutes"],
                ["Reasoning", "single reviewer", "3-agent panel"],
                ["Provenance", "private report", "contract-backed state"],
                ["Workflow", "engagement queue", "paste and run"],
              ].map(([k, oldWay, newWay]) => (
                <div key={k} className="grid grid-cols-3 gap-2 border-t border-panel-border pt-2 text-xs">
                  <span className="text-foreground">{k}</span><span className="text-foreground-muted">{oldWay}</span><span className="text-strong">{newWay}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 className="font-mono text-2xl font-black">Live StudioNet Activity</h2>
          <Link href="/audit" className="font-mono text-sm text-strong">submit new audit</Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {audits.map((audit) => (
            <Link key={audit.audit_id} href={`/audit/${audit.audit_id}`} className="panel block p-5 hover:border-strong/50">
              <div className="flex items-center justify-between gap-3">
                <span className={`rounded border px-2 py-1 font-mono text-xs ${verdictTone(audit.verdict)}`}>{audit.verdict} {audit.score}</span>
                <span className="font-mono text-xs text-foreground-muted">{audit.findings_count} findings</span>
              </div>
              <p className="mt-4 break-all font-mono text-xs text-foreground-muted">{audit.contract_hash}</p>
              <p className="mt-3 text-sm text-foreground-muted">{audit.suggestions[0] || "No tightening suggestions recorded."}</p>
            </Link>
          ))}
          {!audits.length && (
            <div className="panel p-5 font-mono text-sm text-foreground-muted">No StudioNet audits are readable yet. Deploy and seed the contract to populate this terminal.</div>
          )}
        </div>
      </section>
    </main>
  );
}
