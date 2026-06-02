import { NextResponse } from "next/server";
import { errorResponse } from "../../../../../lib/errors";
import { getAuditFromGenLayer } from "../../../../../lib/genlayer";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await getAuditFromGenLayer(id);
    return NextResponse.json({ id, status: result.audit_id ? "completed" : "missing", result });
  } catch (err) {
    const { code, status } = errorResponse("ERR_INTERNAL", 500);
    return NextResponse.json({ error: code, message: err instanceof Error ? err.message : code }, { status });
  }
}
