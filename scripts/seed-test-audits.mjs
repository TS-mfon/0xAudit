import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";
import { privateKeyToAccount } from "viem/accounts";
import { stressCases } from "./stress-cases.mjs";

const engine = process.env.GENLAYER_ENGINE_ADDRESS;
const privateKey = process.env.GENLAYER_PLATFORM_PRIVATE_KEY;
const rpc = process.env.GENLAYER_RPC_URL || "https://studio.genlayer.com/api";

if (!engine) throw new Error("GENLAYER_ENGINE_ADDRESS is required");
if (!privateKey) throw new Error("GENLAYER_PLATFORM_PRIVATE_KEY is required");

const chain = {
  ...studionet,
  rpcUrls: { ...studionet.rpcUrls, default: { http: [rpc] } },
};
const client = createClient({ chain, account: privateKeyToAccount(privateKey) });

const seedStart = Number(process.env.SEED_START || 0);
const seedLimit = Number(process.env.SEED_LIMIT || stressCases.length);
const cases = stressCases.slice(seedStart, seedStart + seedLimit);

function statValue(stats, key) {
  if (stats instanceof Map) return Number(stats.get(key) || 0n);
  return Number(stats?.[key] || 0);
}

async function getTotalAudits() {
  let lastError;
  for (let attempt = 1; attempt <= 10; attempt += 1) {
    try {
      const stats = await client.readContract({
        address: engine,
        functionName: "get_stats",
        args: [],
        jsonSafeReturn: true,
      });
      return statValue(stats, "total_audits");
    } catch (error) {
      lastError = error;
      console.log(`stats retry ${attempt}`);
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  throw lastError;
}

async function waitForCommit(before, txHash) {
  let lastError;
  for (let attempt = 1; attempt <= 90; attempt += 1) {
    try {
      const after = await getTotalAudits();
      if (after > before) return after;
    } catch (error) {
      lastError = error;
    }
    if (attempt % 10 === 0) console.log(`commit wait ${attempt} ${txHash}`);
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  throw lastError || new Error(`Audit did not commit before timeout: ${txHash}`);
}

for (const [label, code] of cases) {
  const before = await getTotalAudits();
  console.log(`submit ${label}`);
  const txHash = await client.writeContract({
    address: engine,
    functionName: "submit_audit",
    args: [code, label],
    value: 0n,
  });
  console.log(`tx ${txHash}`);
  await waitForCommit(before, txHash);
  console.log(`finalized ${label}`);
}

const ids = await client.readContract({
  address: engine,
  functionName: "get_recent_audit_ids",
  args: [],
  jsonSafeReturn: true,
});
console.log(`recent_count ${Array.isArray(ids) ? ids.length : 0}`);
