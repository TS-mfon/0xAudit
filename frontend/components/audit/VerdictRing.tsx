"use client";

import { verdictTone } from "../../lib/theme";

export function VerdictRing({ score, verdict }: { score: number; verdict?: string }) {
  const pct = Math.max(0, Math.min(score, 100));
  const resolved = verdict || (pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : "Weak");
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-32 w-32 place-items-center rounded-full border border-panel-border bg-panel font-mono"
        style={{ background: `conic-gradient(#00FF88 ${pct * 3.6}deg, #1D2A24 0deg)` }}
      >
        <div className="grid h-24 w-24 place-items-center rounded-full bg-obsidian">
          <span className="text-4xl font-black">{pct}</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-xs uppercase tracking-widest text-foreground-muted">Security score</p>
        <p className={`mt-2 inline-flex rounded border px-3 py-1 font-mono text-sm ${verdictTone(resolved)}`}>{resolved}</p>
      </div>
    </div>
  );
}
