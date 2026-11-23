import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import { MongoClient } from "mongodb";
const client = (global._mongo ||= new MongoClient(process.env.MONGODB_URI).connect());
const TIERS = [
  { _id: "15k", price: 15000, capacity: 15 },
  { _id: "20k", price: 20000, capacity: 5 },
];
let ready;
export async function db() {
  const d = (await client).db("cake");
  ready ||= (async () => {
    for (const t of TIERS)
      await d.collection("tiers").updateOne({ _id: t._id }, { $setOnInsert: { sold: 0 }, $set: { price: t.price, capacity: t.capacity } }, { upsert: true });
    await d.collection("tickets").createIndex({ token: 1 }, { unique: true });
  })();
  await ready;
  return d;
}
export const freeSeat = (d, tier) => d.collection("tiers").updateOne({ _id: tier }, { $inc: { sold: -1 } });
// release seats whose 30-minute hold ran out without proof
export async function releaseExpired(d) {
  const old = await d.collection("tickets").find({ status: "held", holdExpires: { $lt: new Date() } }).toArray();
  for (const t of old) {
    const r = await d.collection("tickets").updateOne({ _id: t._id, status: "held" }, { $set: { status: "expired" } });
    if (r.modifiedCount) await freeSeat(d, t.tier);
  }
}
