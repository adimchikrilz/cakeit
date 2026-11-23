import { MongoClient } from "mongodb";

const TIERS = [
  { _id: "15k", price: 15000, capacity: 15 },
  { _id: "20k", price: 20000, capacity: 5 },
];

let ready;

function connect() {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set");
  if (!global._mongo) {
    global._mongo = new MongoClient(process.env.MONGODB_URI).connect();
    // if the connection fails, forget it so the next request retries
    global._mongo.catch(() => { global._mongo = null; ready = null; });
  }
  return global._mongo;
}

export async function db() {
  const d = (await connect()).db("cake");
  ready ||= (async () => {
    for (const t of TIERS)
      await d.collection("tiers").updateOne({ _id: t._id }, { $setOnInsert: { sold: 0 }, $set: { price: t.price, capacity: t.capacity } }, { upsert: true });
    await d.collection("tickets").createIndex({ token: 1 }, { unique: true });
  })();
  await ready;
  return d;
}

export const freeSeat = (d, tier) => d.collection("tiers").updateOne({ _id: tier }, { $inc: { sold: -1 } });

// release seats whose hold ran out without proof
export async function releaseExpired(d) {
  const old = await d.collection("tickets").find({ status: "held", holdExpires: { $lt: new Date() } }).toArray();
  for (const t of old) {
    const r = await d.collection("tickets").updateOne({ _id: t._id, status: "held" }, { $set: { status: "expired" } });
    if (r.modifiedCount) await freeSeat(d, t.tier);
  }
}