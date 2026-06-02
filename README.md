# 0xAudit

Decentralized Smart Contract Auditing Infrastructure.

0xAudit V1 is a paste-code Solidity audit console backed by a live GenLayer StudioNet intelligent contract. The server submits audits with a platform key, the contract stores results, and the frontend reads activity from contract state.

## Structure

```
0xaudit/
├── contracts/                          # GenLayer Intelligent Contracts
│   ├── AuditEngine.py
│   └── tests/
├── frontend/                           # Next.js App
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── types/
├── scripts/
│   ├── seed-test-audits.mjs
│   └── stress-cases.mjs
└── README.md
```

## What Is Implemented

- GenLayer intelligent contracts:
  - `AuditEngine.py`
- Next.js frontend:
  - Landing page
  - Paste-code audit page
  - Audit result page
  - Dashboard
- API route layer:
  - Audit submit/status
  - Recent audits
  - Audit stats

## Local Development

```bash
cd frontend
npm install
npm run build
npm run dev
```

```bash
cd frontend
npm install
npm run typecheck
npm run build
```

## Verification Notes

The frontend is designed to read from the deployed GenLayer contract. Configure `GENLAYER_ENGINE_ADDRESS`, `GENLAYER_RPC_URL`, and `GENLAYER_PLATFORM_PRIVATE_KEY` before running live audits.

For GenLayer deployment, use GenLayer-native CLI/RPC flows and verify more than deploy success:

```bash
genlayer write <address> submit_audit --args ...
genlayer receipt <tx_hash> --retries 50 --interval 3000
genlayer call <address> get_audit --args <audit_id>
```

StudioNet schema inspection is currently network-dependent; direct write/readback and `get_stats` are the verification source of truth for this build.
