import { db, releaseExpired } from "@/lib/db";
import { VENUE } from "@/lib/venue";
export const dynamic = "force-dynamic";

// the long random token in the link is the ticket's secret
export async function GET(_, { params }) {
  const { token } = await params;
  const d = await db();
  await releaseExpired(d);
  const t = await d.collection("tickets").findOne({ token });
  if (!t) return Response.json({ error: "Not found" }, { status: 404 });
  const tier = await d.collection("tiers").findOne({ _id: t.tier });
  const out = { status: t.status, name: t.name, tier: t.tier, price: tier?.price ?? 0 };
  // venue is revealed on the ticket once payment proof is in
  if (["pending", "approved", "used"].includes(t.status)) out.venue = VENUE;
  if (t.status === "held") Object.assign(out, {
    holdExpires: t.holdExpires,
    bank: process.env.BANK_NAME, accountNumber: process.env.ACCOUNT_NUMBER, accountName: process.env.ACCOUNT_NAME,
  });
  return Response.json(out);
}
