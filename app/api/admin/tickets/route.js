import { db, releaseExpired } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await isAdmin())) return new Response("No", { status: 401 });
  const d = await db();
  await releaseExpired(d);
  const tiers = await d.collection("tiers").find().sort({ price: 1 }).toArray();
  const tickets = await d.collection("tickets").find({ status: { $ne: "expired" } }, { projection: { _id: 0 } }).sort({ createdAt: -1 }).toArray();
  return Response.json({ tiers: tiers.map(t => ({ tier: t._id, price: t.price, capacity: t.capacity, sold: t.sold })), tickets });
}
