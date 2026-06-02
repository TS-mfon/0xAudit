# 0xAudit V1 Build Checklist

## V1 Scope
- [x] Paste-code audit only.
- [x] Remove payment flow from active app.
- [x] Remove certificate/badge/verifier flow from active app.
- [x] Remove GitHub repo scanning from active app.
- [x] Remove follow-up hardening loop from active app.
- [x] Move dropped features to `V2.md`.

## Contract
- [x] Build single `AuditEngine.py`.
- [x] Store audit results, findings, invariants, and suggestions.
- [x] Add recent audit IDs for activity UI.
- [x] Require tightening suggestions unless score is exceptional.
- [x] Run `genvm-lint check contracts/AuditEngine.py` static lint.
- [x] Deploy to GenLayer StudioNet.
- [x] Verify write, contract counter increment, and readback.

## Frontend/API
- [x] Replace mock API with GenLayer server API.
- [x] Add paste-code audit submit route.
- [x] Add audit status route.
- [x] Add recent activity route.
- [x] Add stats route.
- [x] Add hacker terminal/matrix styling.
- [x] Generate fresh platform key.
- [x] Configure local and Vercel env.
- [x] Seed at least 20 real StudioNet audits.
- [x] Build and smoke test.

## Deployment
- [x] Deploy frontend to Vercel.
- [x] Push repo to GitHub.
- [x] Verify production app pulls contract state.

## Live Deployment
- GenLayer StudioNet engine: `0x44bD99017b81B2FC044f3b4DD24C0bfA9715301D`
- Vercel production alias: `https://frontend-alpha-pied-17.vercel.app`
- Verified contract state: `22` audits and `193` findings.
- GenVM note: static lint passed; SDK validation substep still returns `HTTP Error 404: Not Found` from the validator tooling.
