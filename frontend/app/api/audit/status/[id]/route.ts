import { NextResponse } from "next/server";
import { errorResponse } from "../../../../../lib/errors";
import { getAuditFromGenLayer, getRecentAuditSummaries } from "../../../../../lib/genlayer";

export const runtime = "nodejs";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const previousTotal = Number(searchParams.get("previous_total") || 0);
    if (id === "latest") {
      const [latest] = await getRecentAuditSummaries(1);
      const latestIndex = Number(latest?.timestamp || 0);
      return NextResponse.json({
        id,
        status: latest?.audit_id && latestIndex > previousTotal ? "completed" : "pending",
        result: latest || null,
      });
    }
    const result = await getAuditFromGenLayer(id);
    return NextResponse.json({ id, status: result.audit_id ? "completed" : "missing", result });
  } catch (err) {
    const { code, status } = errorResponse("ERR_INTERNAL", 500);
    return NextResponse.json({ error: code, message: err instanceof Error ? err.message : code }, { status });
  }
}
