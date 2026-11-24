"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import { Loading } from "@/components/Spinner";
import { EVENT } from "@/lib/config";
import { saved } from "@/lib/saved";

const naira = n => "₦" + n.toLocaleString("en-NG");
const LABEL = { held: "Awaiting payment", pending: "Pending approval", approved: "Approved", used: "Checked in", rejected: "Rejected" };

export default function MyTickets() {
  const router = useRouter();
  const [list, setList] = useState(null);
  useEffect(() => {
    (async () => {
      const all = await Promise.all(saved().map(async token => {
        const r = await fetch(`/api/tickets/${token}`, { cache: "no-store" });
        return r.ok ? { token, ...(await r.json()) } : null;
      }));
      const mine = all.filter(t => t && t.status !== "expired");
      if (mine.length === 1) return router.replace(`/t/${mine[0].token}`);
      setList(mine);
    })().catch(() => setList([]));
  }, []);

  return (
    <>
      <Nav />
      <main className="wrap">
        <h1 className="h-md">My tickets</h1>
        {list === null && <Loading />}
        {list && !list.length && <div className="card"><p>No tickets saved on this device yet.</p><p className="small" style={{ marginTop: 8 }}>Bought one on another phone? Open the ticket link you were given.</p><p style={{ marginTop: 14 }}><Link href="/tickets" className="btn berry">Get ticket</Link></p></div>}
        {list?.map(t => (
          <Link key={t.token} href={`/t/${t.token}`} className="item" style={{ textDecoration: "none", color: "inherit" }}>
            <div className="row">
              <span><b>{t.name}</b> · {naira(t.price)}<br /><span className="small">{EVENT.tiers[t.tier]?.label} · {EVENT.date}</span></span>
              <span className={`chip ${t.status}`}>{LABEL[t.status]}</span>
            </div>
          </Link>
        ))}
      </main>
    </>
  );
}
