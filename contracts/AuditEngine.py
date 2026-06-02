# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }

from dataclasses import dataclass
import hashlib
import json
from genlayer import *

ERROR_EXPECTED = "[EXPECTED]"
ERROR_EXTERNAL = "[EXTERNAL]"
ERROR_TRANSIENT = "[TRANSIENT]"
ERROR_LLM = "[LLM_ERROR]"


@allow_storage
@dataclass
class Finding:
    finding_id: str
    agent: str
    severity: str
    title: str
    root_cause: str
    impact: str
    exploit_vector: str
    line_reference: str
    vulnerable_code: str
    secured_code: str


@allow_storage
@dataclass
class AuditResult:
    audit_id: str
    contract_hash: str
    submitter: str
    verdict: str
    score: u256
    adversary_score: u256
    architect_score: u256
    math_score: u256
    findings_count: u256
    critical_count: u256
    high_count: u256
    medium_count: u256
    low_count: u256
    timestamp: str
    source_label: str


class AuditEngine(gl.Contract):
    owner: Address
    audits: TreeMap[str, AuditResult]
    audit_findings: TreeMap[str, str]
    audit_invariants: TreeMap[str, str]
    audit_suggestions: TreeMap[str, str]
    recent_audits: DynArray[str]
    contract_hash_to_latest_audit: TreeMap[str, str]
    total_audits: u256
    total_findings: u256
    paused: bool

    def __init__(self):
        self.owner = gl.message.sender_address
        self.total_audits = 0
        self.total_findings = 0
        self.paused = False

    def _require_owner(self) -> None:
        if gl.message.sender_address != self.owner:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Only owner")

    @gl.public.write
    def pause(self) -> None:
        self._require_owner()
        self.paused = True

    @gl.public.write
    def unpause(self) -> None:
        self._require_owner()
        self.paused = False

    @gl.public.write
    def submit_audit(self, contract_code: str, source_label: str) -> str:
        if self.paused:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Audit engine paused")
        if len(contract_code.strip()) == 0:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Empty contract")
        if len(contract_code) > 50000:
            raise gl.vm.UserError(f"{ERROR_EXPECTED} Contract too large")

        submitter = str(gl.message.sender_address)
        sequence = int(self.total_audits) + 1
        audit_id = self._generate_audit_id(contract_code, submitter, sequence)
        contract_hash = self._hash_contract(contract_code)
        audit_result = self._run_audit_engine(contract_code)
        findings = audit_result.get("all_findings", [])
        suggestions = audit_result.get("all_suggestions", [])
        invariants = audit_result.get("mathematician", {}).get("invariants", [])
        counts = self._count_severities(findings)
        score = self._apply_severity_caps(int(audit_result["score"]), findings)
        verdict = self._verdict_for_score(score)

        if len(suggestions) == 0 and score < 95:
            suggestions = [
                "Add explicit access-control boundaries for every privileged function.",
                "Add invariant tests for accounting, solvency, and authorization paths.",
                "Prefer checks-effects-interactions around all external calls.",
            ]

        result = AuditResult(
            audit_id=audit_id,
            contract_hash=contract_hash,
            submitter=submitter,
            verdict=verdict,
            score=u256(score),
            adversary_score=u256(self._bounded_int(audit_result["adversary"].get("attack_surface_score", 0), 0, 100)),
            architect_score=u256(self._bounded_int(audit_result["architect"].get("systemic_risk_score", 0), 0, 100)),
            math_score=u256(self._bounded_int(audit_result["mathematician"].get("math_safety_score", 0), 0, 100)),
            findings_count=u256(len(findings)),
            critical_count=u256(counts["Critical"]),
            high_count=u256(counts["High"]),
            medium_count=u256(counts["Medium"]),
            low_count=u256(counts["Low"]),
            timestamp=str(sequence),
            source_label=source_label,
        )

        self.audits[audit_id] = result
        self._store_findings(audit_id, findings)
        self._store_invariants(audit_id, invariants)
        self._store_suggestions(audit_id, suggestions)
        self.recent_audits.append(audit_id)
        self.contract_hash_to_latest_audit[contract_hash] = audit_id
        self.total_audits += 1
        self.total_findings += u256(len(findings))
        return audit_id

    @gl.public.view
    def get_audit(self, audit_id: str) -> dict:
        if audit_id not in self.audits:
            return {}
        return self.audits[audit_id]

    @gl.public.view
    def get_audit_findings(self, audit_id: str) -> str:
        if audit_id not in self.audit_findings:
            return "[]"
        return self.audit_findings[audit_id]

    @gl.public.view
    def get_audit_invariants(self, audit_id: str) -> str:
        if audit_id not in self.audit_invariants:
            return "[]"
        return self.audit_invariants[audit_id]

    @gl.public.view
    def get_audit_suggestions(self, audit_id: str) -> str:
        if audit_id not in self.audit_suggestions:
            return "[]"
        return self.audit_suggestions[audit_id]

    @gl.public.view
    def get_recent_audit_ids(self) -> list:
        return self.recent_audits

    @gl.public.view
    def get_latest_audit_for_contract(self, contract_hash: str) -> dict:
        if contract_hash not in self.contract_hash_to_latest_audit:
            return {}
        return self.get_audit(self.contract_hash_to_latest_audit[contract_hash])

    @gl.public.view
    def get_stats(self) -> dict:
        return {
            "total_audits": self.total_audits,
            "total_findings": self.total_findings,
            "owner": str(self.owner),
            "paused": self.paused,
        }

    def _run_audit_engine(self, contract_code: str) -> dict:
        def leader_fn():
            adversary_result = self._run_adversary_agent(contract_code)
            architect_result = self._run_architect_agent(contract_code)
            math_result = self._run_mathematician_agent(contract_code)
            verdict, score = self._compute_consensus(adversary_result, architect_result, math_result)
            return {
                "verdict": verdict,
                "score": score,
                "adversary": adversary_result,
                "architect": architect_result,
                "mathematician": math_result,
                "all_findings": adversary_result.get("findings", [])
                + architect_result.get("findings", [])
                + math_result.get("findings", []),
                "all_suggestions": adversary_result.get("suggestions", [])
                + architect_result.get("suggestions", [])
                + math_result.get("suggestions", []),
            }

        def validator_fn(leaders_res: gl.vm.Result) -> bool:
            if not isinstance(leaders_res, gl.vm.Return):
                return False
            leader_verdict = leaders_res.calldata.get("verdict", "")
            leader_score = self._bounded_int(leaders_res.calldata.get("score", 0), 0, 100)
            if leader_verdict not in ["Weak", "Moderate", "Strong"]:
                return False
            if "adversary" not in leaders_res.calldata:
                return False
            if "architect" not in leaders_res.calldata:
                return False
            if "mathematician" not in leaders_res.calldata:
                return False
            if "all_findings" not in leaders_res.calldata:
                return False
            if leader_score < 0 or leader_score > 100:
                return False
            return True

        return gl.vm.run_nondet_unsafe(leader_fn, validator_fn)

    def _run_adversary_agent(self, contract_code: str) -> dict:
        result = gl.nondet.exec_prompt(self._adversary_prompt(contract_code), response_format="json")
        return self._parse_agent_response(result, "ADVERSARY")

    def _run_architect_agent(self, contract_code: str) -> dict:
        result = gl.nondet.exec_prompt(self._architect_prompt(contract_code), response_format="json")
        return self._parse_agent_response(result, "ARCHITECT")

    def _run_mathematician_agent(self, contract_code: str) -> dict:
        result = gl.nondet.exec_prompt(self._mathematician_prompt(contract_code), response_format="json")
        return self._parse_agent_response(result, "MATHEMATICIAN")

    def _compute_consensus(self, adv: dict, arch: dict, math: dict) -> tuple:
        adv_score = 100 - self._bounded_int(adv.get("attack_surface_score", 0), 0, 100)
        arch_score = 100 - self._bounded_int(arch.get("systemic_risk_score", 0), 0, 100)
        math_score = self._bounded_int(math.get("math_safety_score", 0), 0, 100)
        final_score = int((adv_score * 45 + arch_score * 35 + math_score * 20) / 100)
        findings = adv.get("findings", []) + arch.get("findings", []) + math.get("findings", [])
        final_score = self._apply_severity_caps(final_score, findings)
        return self._verdict_for_score(final_score), final_score

    def _parse_agent_response(self, raw_json: dict, agent: str) -> dict:
        if not isinstance(raw_json, dict):
            raise gl.vm.UserError(f"{ERROR_LLM} Non-dict response")
        raw_json["agent"] = agent
        if "findings" not in raw_json or not isinstance(raw_json["findings"], list):
            raw_json["findings"] = []
        if "suggestions" not in raw_json or not isinstance(raw_json["suggestions"], list):
            raw_json["suggestions"] = []
        normalized = []
        for idx, finding in enumerate(raw_json["findings"][:20]):
            if isinstance(finding, dict):
                normalized.append(self._normalize_finding(finding, agent, idx))
        raw_json["findings"] = normalized
        normalized_suggestions = []
        for suggestion in raw_json["suggestions"][:10]:
            normalized_suggestions.append(str(suggestion))
        raw_json["suggestions"] = normalized_suggestions
        if agent == "ADVERSARY":
            raw_json["attack_surface_score"] = self._bounded_int(raw_json.get("attack_surface_score", 50), 0, 100)
        if agent == "ARCHITECT":
            raw_json["systemic_risk_score"] = self._bounded_int(raw_json.get("systemic_risk_score", 50), 0, 100)
        if agent == "MATHEMATICIAN":
            raw_json["math_safety_score"] = self._bounded_int(raw_json.get("math_safety_score", 50), 0, 100)
            if "invariants" not in raw_json or not isinstance(raw_json["invariants"], list):
                raw_json["invariants"] = []
        return raw_json

    def _normalize_finding(self, finding: dict, agent: str, idx: int) -> dict:
        prefix = "ADV" if agent == "ADVERSARY" else "ARCH" if agent == "ARCHITECT" else "MATH"
        severity = str(finding.get("severity", "Informational"))
        if severity not in ["Critical", "High", "Medium", "Low", "Informational"]:
            severity = "Informational"
        return {
            "id": str(finding.get("id", f"{prefix}-{idx + 1:03d}")),
            "agent": agent,
            "severity": severity,
            "title": str(finding.get("title", "Untitled finding")),
            "root_cause": str(finding.get("root_cause", "")),
            "impact": str(finding.get("impact", "")),
            "exploit_vector": str(finding.get("exploit_vector", "")),
            "line_reference": str(finding.get("line_reference", "")),
            "vulnerable_code": str(finding.get("vulnerable_code", "")),
            "secured_code": str(finding.get("secured_code", "")),
        }

    def _bounded_int(self, raw, minimum: int, maximum: int) -> int:
        if isinstance(raw, str):
            label = raw.strip().lower()
            if label in ["critical", "severe", "very high"]:
                value = 95
            elif label == "high":
                value = 80
            elif label == "medium" or label == "moderate":
                value = 50
            elif label == "low":
                value = 20
            elif label == "informational" or label == "info":
                value = 5
            else:
                try:
                    value = int(raw)
                except Exception:
                    value = minimum
        else:
            try:
                value = int(raw)
            except Exception:
                value = minimum
        if value < minimum:
            return minimum
        if value > maximum:
            return maximum
        return value

    def _apply_severity_caps(self, score: int, findings: list) -> int:
        has_critical = False
        has_high = False
        for finding in findings:
            severity = finding.get("severity", "")
            if severity == "Critical":
                has_critical = True
            if severity == "High":
                has_high = True
        if has_critical and score > 39:
            return 39
        if has_high and score > 59:
            return 59
        return self._bounded_int(score, 0, 100)

    def _verdict_for_score(self, score: int) -> str:
        if score >= 70:
            return "Strong"
        if score >= 40:
            return "Moderate"
        return "Weak"

    def _count_severities(self, findings: list) -> dict:
        counts = {"Critical": 0, "High": 0, "Medium": 0, "Low": 0}
        for finding in findings:
            severity = finding.get("severity", "")
            if severity in counts:
                counts[severity] += 1
        return counts

    def _store_findings(self, audit_id: str, findings: list) -> None:
        normalized = []
        for f in findings[:60]:
            normalized.append(
                {
                    "finding_id": str(f.get("id", "")),
                    "agent": str(f.get("agent", "")),
                    "severity": str(f.get("severity", "")),
                    "title": str(f.get("title", "")),
                    "root_cause": str(f.get("root_cause", "")),
                    "impact": str(f.get("impact", "")),
                    "exploit_vector": str(f.get("exploit_vector", "")),
                    "line_reference": str(f.get("line_reference", "")),
                    "vulnerable_code": str(f.get("vulnerable_code", "")),
                    "secured_code": str(f.get("secured_code", "")),
                }
            )
        self.audit_findings[audit_id] = json.dumps(normalized)

    def _store_invariants(self, audit_id: str, invariants: list) -> None:
        normalized = []
        for invariant in invariants[:10]:
            normalized.append(str(invariant))
        self.audit_invariants[audit_id] = json.dumps(normalized)

    def _store_suggestions(self, audit_id: str, suggestions: list) -> None:
        normalized = []
        for suggestion in suggestions[:20]:
            normalized.append(str(suggestion))
        self.audit_suggestions[audit_id] = json.dumps(normalized)

    def _generate_audit_id(self, contract_code: str, submitter: str, sequence: int) -> str:
        payload = (contract_code + submitter + str(sequence)).encode()
        return hashlib.sha256(payload).hexdigest()

    def _hash_contract(self, contract_code: str) -> str:
        return hashlib.sha256(contract_code.encode()).hexdigest()

    def _handle_leader_error(self, leaders_res, leader_fn) -> bool:
        leader_msg = leaders_res.message if hasattr(leaders_res, "message") else ""
        try:
            leader_fn()
            return False
        except gl.vm.UserError as e:
            validator_msg = e.message if hasattr(e, "message") else str(e)
            if validator_msg.startswith(ERROR_EXPECTED) or validator_msg.startswith(ERROR_EXTERNAL):
                return validator_msg == leader_msg
            if validator_msg.startswith(ERROR_TRANSIENT) and leader_msg.startswith(ERROR_TRANSIENT):
                return True
            return False
        except Exception:
            return False

    def _adversary_prompt(self, contract_code: str) -> str:
        return f"""
You are the ADVERSARY agent inside 0xAudit. Think like a hostile attacker trying to steal funds, corrupt state, or create permanent protocol damage.

Analyze this Solidity contract for exploitable security weaknesses. Always include concrete suggestions to tighten security unless the contract is exceptional and no defensible improvement exists.

Return JSON only:
{{
  "findings": [
    {{
      "id": "ADV-001",
      "severity": "Critical|High|Medium|Low|Informational",
      "title": "...",
      "root_cause": "...",
      "impact": "...",
      "exploit_vector": "...",
      "line_reference": "L[start]-L[end]",
      "vulnerable_code": "...",
      "secured_code": "..."
    }}
  ],
  "suggestions": ["specific hardening change"],
  "attack_surface_score": 0
}}

Contract:
{contract_code}
"""

    def _architect_prompt(self, contract_code: str) -> str:
        return f"""
You are the ARCHITECT agent inside 0xAudit. Review systemic design risk, integration risk, governance risk, upgradeability, L2 assumptions, oracle dependencies, and emergency controls.

Always include concrete suggestions to tighten security unless the contract is exceptional and no defensible improvement exists.

Return JSON only with "findings", "suggestions", and "systemic_risk_score".

Contract:
{contract_code}
"""

    def _mathematician_prompt(self, contract_code: str) -> str:
        return f"""
You are the MATHEMATICIAN agent inside 0xAudit. Review invariants, accounting correctness, solvency, rounding, bounded loops, type safety, and timestamp assumptions.

Always include concrete suggestions to tighten security unless the contract is exceptional and no defensible improvement exists. Define up to 5 testable invariants.

Return JSON only with "findings", "suggestions", "invariants", and "math_safety_score".

Contract:
{contract_code}
"""
