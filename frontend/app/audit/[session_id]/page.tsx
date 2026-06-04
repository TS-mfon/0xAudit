import Link from "next/link";
import { getAuditFromGenLayer } from "../../../lib/genlayer";
import { severityTone, verdictTone } from "../../../lib/theme";

export const dynamic = "force-dynamic";

function asFinding(value: any) {
  return {
    id: value?.id || value?.finding_id || "FINDING",
    agent: value?.agent || "AGENT",
    severity: value?.severity || "Informational",
    title: value?.title || "Untitled finding",
    root_cause: value?.root_cause || "No root cause text returned.",
    impact: value?.impact || "No impact text returned.",
    exploit_vector: value?.exploit_vector || "No exploit vector returned.",
    line_reference: value?.line_reference || "L?",
    vulnerable_code: value?.vulnerable_code || "// no vulnerable snippet returned",
    secured_code: value?.secured_code || "// no hardening patch returned",
  };
}

export default async function AuditResultPage({ params }: { params: Promise<{ session_id: string }> }) {
  const { session_id } = await params;
  const audit = await getAuditFromGenLayer(session_id);
  const findings = (audit.findings as any[]).map(asFinding);
  const primary = findings[0];

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-6">
      <div className="terminal-card p-4">
        <p className="terminal-label">$ cd audits/{audit.audit_id.slice(0, 8)}</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="terminal-title text-3xl md:text-5xl">Finding #{primary?.id || "NONE"}</h1>
            <p className="mt-2 text-sm text-[#00FF41]/65">contract_hash={audit.contract_hash}</p>
          </div>
          <Link href="/audit" className="ghost-button">RUN_ANOTHER</Link>
        </div>
      </div>

      <section className="mt-5 grid gap-5 lg:grid-cols-[1fr_360px]">
        <div className="space-y-5">
          <article className="terminal-card overflow-hidden">
            <div className="flex items-center justify-between border-b border-[#00FF41]/40 px-4 py-3">
              <p className="terminal-title text-sm">VULNERABILITY_WINDOW</p>
              <span className="critical-text text-sm">● ● ×</span>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`status-pill ${severityTone(primary?.severity || "")}`}>{primary?.severity || "INFO"}</span>
                <span className="status-pill">{primary?.agent || "AGENT"}</span>
                <span className="text-xs text-[#00FF41]/55">{primary?.line_reference}</span>
              </div>
              <h2 className="mt-4 text-2xl font-black uppercase">{primary?.title || "No findings returned"}</h2>
              <p className="mt-4 text-sm leading-7 text-[#00FF41]/70">{primary?.root_cause}</p>
              <div className="mt-4 border border-red-500/70 bg-red-950/20 p-3">
                <p className="terminal-label critical-text">IMPACT_STATEMENT</p>
                <p className="mt-2 text-sm text-red-100">{primary?.impact}</p>
              </div>
            </div>
          </article>

          <article className="terminal-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="terminal-title text-sm">CODE_EXPLORER_READ_ONLY</p>
              <span className="status-pill">[ANNOTATED]</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <pre className="code-terminal overflow-auto p-4 text-xs leading-6"><code>{primary?.vulnerable_code}</code></pre>
              <pre className="code-terminal overflow-auto border-red-500/50 p-4 text-xs leading-6"><code>{primary?.secured_code}</code></pre>
            </div>
          </article>

          <article className="terminal-card p-4">
            <p className="terminal-title text-sm">REASONING_PANEL</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {[
                ["ADVERSARY", audit.adversary_score, "0.12ms", "exploit surface"],
                ["ARCHITECT", audit.architect_score, "0.18ms", "system topology"],
                ["MATH", audit.math_score, "0.09ms", "invariant pass"],
              ].map(([agent, score, latency, note]) => (
                <div key={agent} className="border border-[#00FF41]/35 bg-black p-3">
                  <p className="terminal-label">{agent}.agent</p>
                  <p className="mt-2 text-2xl font-black">{String(score)}</p>
                  <p className="mt-2 text-xs text-[#00FF41]/55">{latency} // {note}</p>
                </div>
              ))}
            </div>
          </article>
        </div>

        <aside className="space-y-5">
          <div className="terminal-card p-4">
            <p className="terminal-title text-sm">STUDIONET_CONSENSUS_REACHED</p>
            <div className={`mt-4 border p-4 text-center ${verdictTone(audit.verdict)}`}>
              <p className="text-5xl font-black">{audit.score}</p>
              <p className="mt-2 text-xl font-black uppercase">{audit.verdict}</p>
            </div>
            <button data-text="SIGN_VERDICT" className="glitch-button mt-4 w-full">SIGN_VERDICT</button>
            <div className="mt-4 flex justify-center gap-2">
              {["V1", "V2", "V3", "V4", "V5"].map((validator) => (
                <span key={validator} className="grid h-8 w-8 place-items-center border border-[#00FF41]/60 bg-black text-[10px]">{validator}</span>
              ))}
            </div>
          </div>

          <div className="terminal-card p-4">
            <p className="terminal-title text-sm">ALL_FINDINGS</p>
            <div className="mt-3 space-y-2">
              {findings.map((finding) => (
                <div key={`${finding.id}-${finding.title}`} className="border border-[#00FF41]/25 bg-black p-2">
                  <span className={`status-pill ${severityTone(finding.severity)}`}>{finding.severity}</span>
                  <p className="mt-2 text-xs text-[#00FF41]/70">{finding.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="terminal-card p-4">
            <p className="terminal-title text-sm">TIGHTENING_PATCHES</p>
            <ul className="mt-3 space-y-2 text-xs text-[#00FF41]/65">
              {audit.suggestions.slice(0, 8).map((item) => <li key={item}>$ {item}</li>)}
            </ul>
          </div>
        </aside>
      </section>
    </main>
  );
}
