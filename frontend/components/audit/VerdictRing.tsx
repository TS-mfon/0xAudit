"use client";

import { verdictTone } from "../../lib/theme";

export function VerdictRing({ score, verdict }: { score: number; verdict?: string }) {
  const pct = Math.max(0, Math.min(score, 100));
  const resolved = verdict || (pct >= 70 ? "Strong" : pct >= 40 ? "Moderate" : "Weak");
  return (
    <div className="flex items-center gap-4">
      <div
        className="grid h-32 w-32 place-items-center border border-[#00FF41]/60 bg-black"
        style={{ background: `conic-gradient(#00FF41 ${pct * 3.6}deg, #061006 0deg)` }}
      >
        <div className="grid h-24 w-24 place-items-center border border-black bg-black">
          <span className="text-4xl font-black">{pct}</span>
        </div>
      </div>
      <div>
        <p className="terminal-label">SECURITY_SCORE</p>
        <p className={`status-pill mt-2 ${verdictTone(resolved)}`}>{resolved}</p>
      </div>
    </div>
  );
}
