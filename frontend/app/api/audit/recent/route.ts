import { NextResponse } from "next/server";
import { errorResponse } from "../../../../lib/errors";
import { getRecentAuditSummaries, getRecentAudits } from "../../../../lib/genlayer";

export const runtime = "nodejs";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedLimit = Number(searchParams.get("limit") || 6);
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 10) : 6;
    const deep = searchParams.get("deep") === "1";
    const audits = deep ? await getRecentAudits(limit) : await getRecentAuditSummaries(limit);
    return NextResponse.json({ audits });
  } catch (err) {
    const { code, status } = errorResponse("ERR_INTERNAL", 500);
    return NextResponse.json({ error: code, message: err instanceof Error ? err.message : code }, { status });
  }
}
