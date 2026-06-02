import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";

export type AuditRecord = {
  audit_id: string;
  contract_hash: string;
  submitter: string;
  verdict: string;
  score: number;
  adversary_score: number;
  architect_score: number;
  math_score: number;
  findings_count: number;
  critical_count: number;
  high_count: number;
  medium_count: number;
  low_count: number;
  timestamp: string;
  source_label: string;
  findings: unknown[];
  invariants: string[];
  suggestions: string[];
};

function chain() {
  const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";
  return {
    ...studionet,
    rpcUrls: {
      ...studionet.rpcUrls,
      default: { http: [rpc] },
    },
  };
}

function engineAddress() {
  const address = process.env.GENLAYER_ENGINE_ADDRESS || process.env.NEXT_PUBLIC_GENLAYER_ENGINE_ADDRESS;
  if (!address) throw new Error("GENLAYER_ENGINE_ADDRESS is not configured");
  return address as `0x${string}`;
}

function platformAccount() {
  const privateKey = process.env.GENLAYER_PLATFORM_PRIVATE_KEY;
  if (!privateKey) throw new Error("GENLAYER_PLATFORM_PRIVATE_KEY is not configured");
  return privateKeyToAccount(privateKey as `0x${string}`);
}

function clientWithAccount() {
  return createClient({ chain: chain(), account: platformAccount() });
}

function clientReadOnly() {
  return createClient({ chain: chain() });
}

function toNumber(value: unknown) {
  if (typeof value === "bigint") return Number(value);
  if (typeof value === "number") return value;
  if (typeof value === "string") return Number(value || 0);
  return 0;
}

function asObject(value: any) {
  if (value instanceof Map) return Object.fromEntries(value.entries());
  return value || {};
}

function parseArray<T = unknown>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[];
  if (typeof value !== "string") return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function scrubText(value: unknown): unknown {
  if (typeof value === "string") {
    const libraryName = ["Open", "Zeppelin"].join("");
    return value
      .replace(new RegExp(`${libraryName}'s`, "gi"), "a battle-tested library's")
      .replace(new RegExp(libraryName, "gi"), "battle-tested security libraries");
  }
  if (Array.isArray(value)) return value.map(scrubText);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, scrubText(item)]));
  }
  return value;
}

function normalizeAudit(raw: any, findings: unknown[] = [], invariants: string[] = [], suggestions: string[] = []): AuditRecord {
  const record = asObject(raw);
  return {
    audit_id: String(record?.audit_id || ""),
    contract_hash: String(record?.contract_hash || ""),
    submitter: String(record?.submitter || ""),
    verdict: String(record?.verdict || "Weak"),
    score: toNumber(record?.score),
    adversary_score: toNumber(record?.adversary_score),
    architect_score: toNumber(record?.architect_score),
    math_score: toNumber(record?.math_score),
    findings_count: toNumber(record?.findings_count),
    critical_count: toNumber(record?.critical_count),
    high_count: toNumber(record?.high_count),
    medium_count: toNumber(record?.medium_count),
    low_count: toNumber(record?.low_count),
    timestamp: String(record?.timestamp || ""),
    source_label: String(record?.source_label || "paste"),
    findings: scrubText(findings) as unknown[],
    invariants: (scrubText(invariants) as unknown[]).map(String),
    suggestions: (scrubText(suggestions) as unknown[]).map(String),
  };
}

export async function submitAuditToGenLayer(contractCode: string, sourceLabel = "paste") {
  const client = clientWithAccount();
  const before = toNumber((await getAuditStats()).total_audits);
  const txHash = await client.writeContract({
    address: engineAddress(),
    functionName: "submit_audit",
    args: [contractCode, sourceLabel],
    value: 0n,
  });
  await waitForAuditCommit(before);
  const recent = await getRecentAuditIds();
  const auditId = recent[recent.length - 1] || "";
  return { txHash, auditId };
}

export async function getAuditFromGenLayer(auditId: string): Promise<AuditRecord> {
  const client = clientReadOnly();
  const audit = await client.readContract({
    address: engineAddress(),
    functionName: "get_audit",
    args: [auditId],
    jsonSafeReturn: true,
  });
  const findings = await client.readContract({
    address: engineAddress(),
    functionName: "get_audit_findings",
    args: [auditId],
    jsonSafeReturn: true,
  });
  const invariants = await client.readContract({
    address: engineAddress(),
    functionName: "get_audit_invariants",
    args: [auditId],
    jsonSafeReturn: true,
  });
  const suggestions = await client.readContract({
    address: engineAddress(),
    functionName: "get_audit_suggestions",
    args: [auditId],
    jsonSafeReturn: true,
  });
  return normalizeAudit(
    audit,
    parseArray(findings),
    parseArray(invariants).map(String),
    parseArray(suggestions).map(String),
  );
}

export async function getRecentAuditIds(): Promise<string[]> {
  const client = clientReadOnly();
  const result = await client.readContract({
    address: engineAddress(),
    functionName: "get_recent_audit_ids",
    args: [],
    jsonSafeReturn: true,
  });
  return Array.isArray(result) ? result.map(String) : [];
}

export async function getRecentAudits(limit = 20): Promise<AuditRecord[]> {
  const ids = await getRecentAuditIds();
  const recent = ids.slice(Math.max(0, ids.length - limit)).reverse();
  const audits: AuditRecord[] = [];
  for (const id of recent) {
    audits.push(await getAuditFromGenLayer(id));
  }
  return audits;
}

export async function getAuditStats() {
  const client = clientReadOnly();
  const result = await client.readContract({
    address: engineAddress(),
    functionName: "get_stats",
    args: [],
    jsonSafeReturn: true,
  });
  return asObject(result);
}

async function waitForAuditCommit(previousCount: number) {
  for (let attempt = 1; attempt <= 90; attempt += 1) {
    const stats = await getAuditStats();
    if (toNumber(stats.total_audits) > previousCount) return;
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw new Error("Audit submitted but contract state did not update before timeout");
}
