import { NextResponse } from "next/server";
import { ApiError, handleRoute } from "@/lib/api";
import { requirePastor } from "@/lib/auth";

export const runtime = "nodejs";

/** GET /api/church-qr — the church-wide static check-in code (pastor only),
 *  for rendering the printable QR. The code itself lives in the server-only
 *  CHURCH_CHECKIN_CODE env var. */
export const GET = handleRoute(async () => {
  await requirePastor();
  const checkinCode = process.env.CHURCH_CHECKIN_CODE;
  if (!checkinCode) {
    throw new ApiError(
      500,
      "CHURCH_CHECKIN_CODE is not configured",
      "not_configured",
    );
  }
  return NextResponse.json({ checkinCode });
});
