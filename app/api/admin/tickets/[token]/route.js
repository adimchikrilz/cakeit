import { db, freeSeat } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

export async function POST(req, { params }) {
  if (!(await isAdmin())) return new Response("No", { status: 401 });
  const { token } = await params;
  const { action } = await req.json();
  const d = await db(), c = d.collection("tickets");
  if (action === "approve") {
    const r = await c.updateOne({ token, status: "pending" }, { $set: { status: "approved", approvedAt: new Date() } });
    return Response.json({ ok: !!r.modifiedCount });
  }
  if (action === "reject") {
    const t = await c.findOneAndUpdate({ token, status: { $in: ["pending", "approved"] } }, { $set: { status: "rejected" } });
    if (t) await freeSeat(d, t.tier); // seat goes back on sale
    return Response.json({ ok: !!t });
  }
  return Response.json({ error: "Bad action" }, { status: 400 });
}
