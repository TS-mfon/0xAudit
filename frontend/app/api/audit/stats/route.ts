import { NextResponse } from "next/server";
import { errorResponse } from "../../../../lib/errors";
import { getAuditStats } from "../../../../lib/genlayer";

export const runtime = "nodejs";

export async function GET() {
  try {
    const stats = await getAuditStats();
    return NextResponse.json({ stats });
  } catch (err) {
    const { code, status } = errorResponse("ERR_INTERNAL", 500);
    return NextResponse.json({ error: code, message: err instanceof Error ? err.message : code }, { status });
  }
}
