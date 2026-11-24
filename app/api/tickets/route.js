import crypto from "crypto";
import { db, releaseExpired } from "@/lib/db";
import { EVENT } from "@/lib/config";

export const dynamic = "force-dynamic";

// a tier is locked while the tier it depends on still has seats
const lockedBy = (by, id) => {
  const need = EVENT.unlockAfter?.[id];
  return need && by[need] && by[need].sold < by[need].capacity ? by[need] : null;
};
const byId = tiers => Object.fromEntries(tiers.map(t => [t._id, t]));

export async function GET() {
  const d = await db();
  await releaseExpired(d);
  const tiers = await d.collection("tiers").find().sort({ price: 1 }).toArray();
  const by = byId(tiers);
  return Response.json(tiers.map(t => ({ tier: t._id, price: t.price, capacity: t.capacity, left: t.capacity - t.sold, locked: !!lockedBy(by, t._id) })));
}

export async function POST(req) {
  const { tier, name, phone } = await req.json();
  const n = String(name || "").trim().slice(0, 80);
  const p = String(phone || "").trim();
  if (n.length < 2) return Response.json({ error: "Enter your full name" }, { status: 400 });
  if (!/^\+?\d[\d\s-]{8,14}$/.test(p)) return Response.json({ error: "Enter a valid phone number" }, { status: 400 });
  const d = await db();
  await releaseExpired(d);
  const holds = await d.collection("tickets").countDocuments({ phone: p, status: "held" });
  if (holds >= 2) return Response.json({ error: "You already have 2 unpaid reservations. Finish those first." }, { status: 429 });
  const need = lockedBy(byId(await d.collection("tiers").find().toArray()), tier);
  if (need) return Response.json({ error: `That ticket opens once the ₦${need.price.toLocaleString("en-NG")} tickets are sold out.` }, { status: 403 });
  const got = await d.collection("tiers").findOneAndUpdate(
    { _id: tier, $expr: { $lt: ["$sold", "$capacity"] } },
    { $inc: { sold: 1 } }
  );
  if (!got) return Response.json({ error: "That ticket is sold out" }, { status: 409 });
  const token = crypto.randomBytes(16).toString("hex");
  await d.collection("tickets").insertOne({
    token, tier, name: n, phone: p, status: "held",
    holdExpires: new Date(Date.now() + EVENT.holdMinutes * 60000), createdAt: new Date(),
  });
  return Response.json({ token });
}
