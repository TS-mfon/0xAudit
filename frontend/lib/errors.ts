export type ErrorCode =
  | "ERR_INTERNAL"
  | "ERR_MISSING_CONTRACT"
  | "ERR_INVALID_PAYMENT"
  | "ERR_GITHUB"
  | "ERR_MISSING_REPO"
  | "ERR_MISSING_PARAMS"
  | "ERR_REPORT"
  | "ERR_CERT"
  | "ERR_WEBHOOK";

export function errorResponse(code: ErrorCode, status = 400) {
  return { code, status };
}
