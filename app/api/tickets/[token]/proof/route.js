import { db } from "@/lib/db";

export async function POST(req, { params }) {
  const { token } = await params;
  const file = (await req.formData()).get("proof");
  if (!file || !file.type?.startsWith("image/")) return Response.json({ error: "Upload the screenshot as an image" }, { status: 400 });
  if (file.size > 4_000_000) return Response.json({ error: "Image is too large. Keep it under 4MB" }, { status: 400 });
  const d = await db();
  const r = await d.collection("tickets").updateOne(
    { token, status: "held", holdExpires: { $gt: new Date() } },
    { $set: { status: "pending", proofAt: new Date() }, $unset: { holdExpires: 1 } }
  );
  if (!r.modifiedCount) return Response.json({ error: "This reservation has expired. Start again from the home page." }, { status: 410 });
  await d.collection("proofs").replaceOne({ _id: token }, { _id: token, type: file.type, data: Buffer.from(await file.arrayBuffer()) }, { upsert: true });
  return Response.json({ ok: true });
}
