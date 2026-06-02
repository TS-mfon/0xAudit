import Link from "next/link";
import { FindingsList } from "../../../components/audit/FindingsList";
import { VerdictRing } from "../../../components/audit/VerdictRing";
import { getAuditFromGenLayer } from "../../../lib/genlayer";

export const dynamic = "force-dynamic";

export default async function AuditResultPage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params;
  const audit = await getAuditFromGenLayer(session_id);
  return (
    <main className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-sm uppercase tracking-widest text-strong">$ cat audit/{session_id}</p>
          <h1 className="mt-2 font-mono text-3xl font-black">Consensus audit result</h1>
        </div>
        <Link href="/audit" className="rounded border border-strong px-3 py-2 font-mono text-sm text-strong">Run another</Link>
      </div>
      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <aside className="space-y-4">
          <div className="terminal-window p-5"><VerdictRing score={audit.score} verdict={audit.verdict} /></div>
          <div className="panel p-4 font-mono text-xs text-foreground-muted">
            <p>audit_id: {audit.audit_id}</p>
            <p className="mt-2 break-all">hash: {audit.contract_hash}</p>
            <p className="mt-2">findings: {audit.findings_count}</p>
            <p className="mt-2">source: {audit.source_label}</p>
          </div>
          <div className="panel p-4">
            <h2 className="font-mono text-sm uppercase tracking-widest text-foreground-muted">Tightening suggestions</h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              {audit.suggestions.map((item) => <li key={item}>$ {item}</li>)}
            </ul>
          </div>
        </aside>
        <section className="space-y-4">
          <div className="panel p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-foreground-muted">Agent scores</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded border border-panel-border bg-obsidian p-4">Adversary risk: {audit.adversary_score}</div>
              <div className="rounded border border-panel-border bg-obsidian p-4">Architect risk: {audit.architect_score}</div>
              <div className="rounded border border-panel-border bg-obsidian p-4">Math safety: {audit.math_score}</div>
            </div>
          </div>
          <FindingsList findings={audit.findings as any} />
          <div className="panel p-5">
            <h2 className="font-mono text-sm uppercase tracking-widest text-foreground-muted">Invariants</h2>
            <ul className="mt-3 space-y-2 text-sm text-foreground-muted">
              {audit.invariants.map((item) => <li key={item}>$ assert {item}</li>)}
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
