import { NextResponse } from "next/server";
import { listUsers } from "@/lib/db";
import { dc } from "@/lib/dataconnect";
import { handleRoute } from "@/lib/api";
import { requirePastor } from "@/lib/auth";

export const runtime = "nodejs";

/** GET /api/users — list all members (pastor only). */
export const GET = handleRoute(async () => {
  await requirePastor();
  const { data } = await listUsers(dc);
  return NextResponse.json({ users: data.users });
});
