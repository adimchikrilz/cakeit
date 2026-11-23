import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

const describe = t => !t ? { result: "invalid" }
  : t.status === "approved" ? { result: "valid", name: t.name, tier: t.tier }
  : t.status === "used" ? { result: "used", name: t.name, tier: t.tier, usedAt: t.usedAt }
  : t.status === "pending" ? { result: "pending", name: t.name, tier: t.tier }
  : { result: "invalid" };

// anyone can look a ticket up; this never changes anything
export async function GET(_, { params }) {
  const { token } = await params;
  return Response.json(describe(await (await db()).collection("tickets").findOne({ token })));
}

// host only: first scan checks the guest in, later scans show "used"
export async function POST(_, { params }) {
  if (!(await isAdmin())) return new Response("No", { status: 401 });
  const { token } = await params;
  const c = (await db()).collection("tickets");
  const hit = await c.findOneAndUpdate({ token, status: "approved" }, { $set: { status: "used", usedAt: new Date() } });
  if (hit) return Response.json({ result: "ok", name: hit.name, tier: hit.tier });
  return Response.json(describe(await c.findOne({ token })));
}
