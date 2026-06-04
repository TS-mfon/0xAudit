"use client";

import { useEffect, useMemo, useState } from "react";
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

type SubmitState = {
  status: "idle" | "submitted" | "polling" | "error";
  txHash: string;
  previousTotal: number;
  message: string;
};

export default function AuditPage() {
  const router = useRouter();
  const [code, setCode] = useState(starter);
  const [state, setState] = useState<SubmitState>({
    status: "idle",
    txHash: "",
    previousTotal: 0,
    message: "WAITING_FOR_SOURCE",
  });
  const [ticks, setTicks] = useState(0);

  const logLines = useMemo(() => {
    const base = [
      "$ cd /contracts/paste-buffer",
      "$ chmod +x audit_payload.sol",
      "ADVERSARY.service queued",
      "ARCHITECT.service queued",
      "MATH.service queued",
    ];
    if (state.txHash) base.push(`tx_hash=${state.txHash.slice(0, 18)}...`);
    if (state.status === "polling") base.push(`poll_contract_state attempt=${ticks}`);
    if (state.status === "error") base.push(`ERR ${state.message}`);
    return base;
  }, [state.message, state.status, state.txHash, ticks]);

  async function pollForAudit(previousTotal: number) {
    setState((current) => ({ ...current, status: "polling", message: "PULLING_CONTRACT_STATE" }));
    for (let attempt = 1; attempt <= 90; attempt += 1) {
      setTicks(attempt);
      const res = await fetch(`/api/audit/status/latest?previous_total=${previousTotal}`, { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const audit = data.result;
        if (data.status === "completed" && audit?.audit_id) {
          router.push(`/audit/${audit.audit_id}`);
          return;
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 4500));
    }
    setState((current) => ({ ...current, status: "error", message: "CONTRACT_STATE_TIMEOUT_RETRY" }));
  }

  async function submit() {
    setTicks(0);
    setState({ status: "submitted", txHash: "", previousTotal: 0, message: "SUBMITTING_TO_STUDIONET" });
    const res = await fetch("/api/audit/submit", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ contract_code: code, source_label: "paste" }),
    });
    const data = await res.json();
    if (!res.ok) {
      setState({ status: "error", txHash: "", previousTotal: 0, message: data.message || data.error || "SUBMIT_FAILED" });
      return;
    }
    if (data.audit_id) {
      router.push(`/audit/${data.audit_id}`);
      return;
    }
    const previousTotal = Number(data.previous_total || 0);
    setState({ status: "polling", txHash: data.tx_hash, previousTotal, message: "TX_ACCEPTED_PULLING_CONTRACT_STATE" });
    void pollForAudit(previousTotal);
  }

  useEffect(() => {
    if (state.status !== "idle") return;
    setTicks(0);
  }, [state.status]);

  const running = state.status === "submitted" || state.status === "polling";

  return (
    <main className="relative z-10 mx-auto max-w-7xl px-4 py-6">
      <div className="mb-5 terminal-card p-4">
        <p className="terminal-label">$ 0xaudit submit --source paste --watch contract_state</p>
        <h1 className="terminal-title mt-2 text-2xl md:text-4xl">EXECUTE_PASTE_AUDIT</h1>
        <p className="mt-3 text-sm text-[#00FF41]/65">
          The API returns after the platform signer submits the transaction. This console immediately polls GenLayer contract state until the audit appears.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <CodeEditor value={code} onChange={setCode} />
        <aside className="terminal-card p-4">
          <div className="flex items-center justify-between border-b border-[#00FF41]/40 pb-3">
            <p className="terminal-title text-sm">SCAN_CONTROLLER</p>
            <span className="status-pill">{running ? "[RUNNING]" : state.status === "error" ? "[ERROR]" : "[READY]"}</span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            {logLines.map((line, index) => (
              <p key={`${line}-${index}`} className="boot-row text-[#00FF41]/75">{line}</p>
            ))}
          </div>

          <button
            disabled={running}
            onClick={submit}
            data-text={running ? "POLLING_CONTRACT" : "RUN_PASTE_AUDIT"}
            className="glitch-button mt-6 w-full disabled:cursor-not-allowed disabled:opacity-50"
          >
            {running ? "POLLING_CONTRACT" : "RUN_PASTE_AUDIT"}
          </button>

          {state.txHash && (
            <div className="mt-5 border border-[#00FF41]/35 bg-black p-3 text-xs">
              <p className="terminal-label">TX_ACCEPTED</p>
              <p className="mt-2 break-all text-[#00FF41]/80">{state.txHash}</p>
            </div>
          )}

          <div className="mt-5">
            <div className="mb-2 flex justify-between text-[10px] text-[#00FF41]/60">
              <span>COMPUTE_LOAD</span>
              <span>{running ? "71%" : "03%"}</span>
            </div>
            <div className="compute-load">{Array.from({ length: 24 }).map((_, index) => <span key={index} />)}</div>
          </div>
        </aside>
      </div>
    </main>
  );
}
