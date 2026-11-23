import { adminToken } from "@/lib/auth";
export async function POST(req) {
  const { password } = await req.json();
  if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD)
    return Response.json({ error: "Wrong password" }, { status: 401 });
  const res = Response.json({ ok: true });
  res.headers.append("Set-Cookie", `admin=${adminToken()}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${60 * 60 * 24 * 30}`);
  return res;
}
