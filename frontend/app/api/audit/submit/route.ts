import { NextResponse } from "next/server";
import { errorResponse } from "../../../../lib/errors";
import { submitAuditToGenLayer } from "../../../../lib/genlayer";
import { submitAuditSchema } from "../../../../lib/validators";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = submitAuditSchema.safeParse(body);
    if (!parsed.success) {
      const { code, status } = errorResponse("ERR_MISSING_CONTRACT", 400);
      return NextResponse.json({ error: code, details: parsed.error.format() }, { status });
    }
    const result = await submitAuditToGenLayer(parsed.data.contract_code, parsed.data.source_label);
    return NextResponse.json({
      audit_id: result.auditId,
      tx_hash: result.txHash,
      status: "completed",
      next_poll: `/api/audit/status/${result.auditId}`,
    });
  } catch (err) {
    const { code, status } = errorResponse("ERR_INTERNAL", 500);
    return NextResponse.json({ error: code, message: err instanceof Error ? err.message : code }, { status });
  }
}
