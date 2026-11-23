import crypto from "crypto";
import { cookies } from "next/headers";
export const adminToken = () =>
  crypto.createHmac("sha256", process.env.ADMIN_PASSWORD || "unset").update("admin").digest("hex");
export async function isAdmin() {
  if (!process.env.ADMIN_PASSWORD) return false;
  return (await cookies()).get("admin")?.value === adminToken();
}
