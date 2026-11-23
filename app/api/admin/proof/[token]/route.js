import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
export async function GET(_, { params }) {
  if (!(await isAdmin())) return new Response("No", { status: 401 });
  const { token } = await params;
  const p = await (await db()).collection("proofs").findOne({ _id: token });
  if (!p) return new Response("Not found", { status: 404 });
  return new Response(p.data.buffer, { headers: { "Content-Type": p.type, "Cache-Control": "private, max-age=600" } });
}
