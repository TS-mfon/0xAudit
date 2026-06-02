export type AgentName = "ADVERSARY" | "ARCHITECT" | "MATHEMATICIAN";
export type AuditVerdict = "Weak" | "Moderate" | "Strong";
export type FindingSeverity = "Critical" | "High" | "Medium" | "Low" | "Informational";

export type Finding = {
  id?: string;
  finding_id?: string;
  agent: AgentName;
  severity: FindingSeverity;
  title: string;
  root_cause: string;
  impact: string;
  exploit_vector: string;
  line_reference: string;
  vulnerable_code: string;
  secured_code: string;
};

export type AuditResult = {
  audit_id: string;
  contract_hash: string;
  submitter: string;
  verdict: AuditVerdict;
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
  findings: Finding[];
  invariants: string[];
  suggestions: string[];
};
