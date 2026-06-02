"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CodeEditor } from "../../components/audit/CodeEditor";

const starter = `pragma solidity ^0.8.20;

contract Vault {
    mapping(address => uint256) public balances;

    function deposit() external payable {
        balances[msg.sender] += msg.value;
    }

    function withdraw() external {
        uint256 amount = balances[msg.sender];
        (bool ok,) = payable(msg.sender).call{value: amount}("");
        require(ok, "transfer failed");
        balances[msg.sender] = 0;
    }
}`;

export default function AuditPage() {
  const router = useRouter();
  const [code, setCode] = useState(starter);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function submit() {
    setStatus("running");
    setError("");
    const res = await fetch("/api/audit/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contract_code: code, source_label: "paste" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setStatus("idle");
      setError(data.message || data.error || "Audit failed");
      return;
    }
    router.push(`/audit/${data.audit_id}`);
  }

  return (
    <main className="matrix-bg min-h-[calc(100vh-57px)] px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6">
          <p className="font-mono text-sm uppercase tracking-widest text-strong">$ 0xaudit submit --source paste</p>
          <h1 className="mt-2 font-mono text-3xl font-black">Paste Solidity into the console</h1>
          <p className="mt-3 max-w-3xl text-foreground-muted">The server signs the audit with the platform key, submits it to GenLayer StudioNet, waits for finalization, and stores the result in the deployed contract.</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          <CodeEditor value={code} onChange={setCode} />
          <aside className="terminal-window p-5">
            <p className="font-mono text-sm text-strong">$ audit status</p>
            <p className="mt-3 font-mono text-sm text-foreground-muted">{status === "running" ? "running multi-agent consensus..." : "waiting for code input"}</p>
            <button disabled={status === "running"} onClick={submit} className="mt-6 w-full rounded border border-strong bg-strong px-4 py-3 font-mono font-bold text-obsidian disabled:opacity-50">
              {status === "running" ? "Executing..." : "Run GenLayer audit"}
            </button>
            {error && <p className="mt-4 break-words font-mono text-sm text-critical">{error}</p>}
            <div className="mt-6 space-y-2 border-t border-panel-border pt-4 font-mono text-xs text-foreground-muted">
              <p>ADVERSARY: exploit search</p>
              <p>ARCHITECT: system review</p>
              <p>MATHEMATICIAN: invariant pass</p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
