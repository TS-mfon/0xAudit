import Link from "next/link";
import { getAuditStats, getRecentAuditSummaries } from "../lib/genlayer";
import { verdictTone } from "../lib/theme";

export const dynamic = "force-dynamic";

async function loadData() {
  try {
    const [stats, audits] = await Promise.all([getAuditStats(), getRecentAuditSummaries(5)]);
    return { stats: stats as any, audits };
  } catch {
    return { stats: null, audits: [] };
  }
}

export default async function HomePage() {
  const { stats, audits } = await loadData();
  const totalAudits = String(stats?.total_audits ?? "--");
  const totalFindings = String(stats?.total_findings ?? "--");

  return (
    <main className="relative z-10">
      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
        <div className="terminal-card p-5 md:p-8">
          <p className="terminal-label">$ ./boot --target studionet --interface cyber_terminal</p>
          <h1 className="typewriter mt-6 max-w-5xl text-3xl font-black uppercase leading-tight text-[#00FF41] md:text-5xl">
            Paste Contract. Execute Audit. Read Consensus.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-7 text-[#00FF41]/70 md:text-base">
            0xAudit is a live GenLayer security console. Paste Solidity, trigger the platform signer, and watch the contract-backed audit feed surface consensus from Adversary, Architect, and Math agents.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link href="/audit" className="glitch-button" data-text="RUN_PASTE_AUDIT">RUN_PASTE_AUDIT</Link>
            <Link href="/dashboard" className="ghost-button">VIEW_ACTIVITY</Link>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            {[
              ["NETWORK", "STUDIONET", "[READY]"],
              ["ENGINE", "0x44bD...301D", "[LIVE]"],
              ["MODE", "PASTE_ONLY", "[ARMED]"],
            ].map(([label, value, state]) => (
              <div key={label} className="border border-[#00FF41]/45 bg-black/60 p-3">
                <p className="terminal-label">{label}</p>
                <p className="mt-2 break-all text-sm font-bold">{value}</p>
                <p className="mt-2 text-xs text-[#00FF41]/70">{state}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="terminal-card p-4">
            <div className="flex items-center justify-between border-b border-[#00FF41]/40 pb-3">
              <p className="terminal-title text-sm">STUDIONET_CONNECTIVITY</p>
              <span className="status-pill">[READY]</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="border border-[#00FF41]/35 bg-black p-4">
                <p className="terminal-label">AUDIT_COUNT</p>
                <p className="mt-2 text-4xl font-black">{totalAudits}</p>
              </div>
              <div className="border border-[#00FF41]/35 bg-black p-4">
                <p className="terminal-label">FINDINGS</p>
                <p className="mt-2 text-4xl font-black critical-text">{totalFindings}</p>
              </div>
            </div>
          </div>

          <div className="terminal-card p-4">
            <p className="terminal-title text-sm">$ systemctl status agent-panel</p>
            <div className="mt-4 space-y-3 text-sm">
              {[
                "ADVERSARY.service .... exploit_surface.loaded [0.12ms]",
                "ARCHITECT.service .... topology_graph.ready [0.18ms]",
                "MATH.service .... invariant_solver.ready [0.09ms]",
                "CONSENSUS.bus .... validator_quorum.synced [0.31ms]",
              ].map((line) => (
                <p key={line} className="boot-row text-[#00FF41]/75">{line}</p>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="terminal-title text-xl">LIVE_ACTIVITY_STREAM</h2>
          <Link href="/dashboard" className="text-xs font-bold text-[#00FF41]/70 hover:text-[#00FF41]">OPEN_FEED</Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {audits.map((audit) => (
            <Link key={audit.audit_id} href={`/audit/${audit.audit_id}`} className="terminal-card block p-4">
              <div className="flex items-center justify-between gap-2">
                <span className={`status-pill ${verdictTone(audit.verdict)}`}>{audit.verdict || "PENDING"}</span>
                <span className="text-xs text-[#00FF41]/55">#{audit.timestamp}</span>
              </div>
              <p className="mt-4 break-all text-xs text-[#00FF41]/70">{audit.audit_id.slice(0, 18)}...</p>
              <p className="mt-3 text-xs text-[#00FF41]/55">{audit.findings_count} findings // score {audit.score}</p>
            </Link>
          ))}
          {!audits.length && (
            <div className="terminal-card p-4 text-sm text-[#00FF41]/65">NO_READABLE_ACTIVITY // RETRYING_STUDIONET</div>
          )}
        </div>
      </section>
    </main>
  );
}
