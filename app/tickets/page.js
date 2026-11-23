"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav";
import Spinner, { Loading } from "@/components/Spinner";
import { EVENT } from "@/lib/config";

const naira = n => "₦" + n.toLocaleString("en-NG");

export default function Tickets() {
  const router = useRouter();
  const [tiers, setTiers] = useState(null);
  const [sel, setSel] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const load = () => fetch("/api/tickets", { cache: "no-store" }).then(r => r.json()).then(setTiers).catch(() => setTiers(p => p || []));
  useEffect(() => { load(); const i = setInterval(load, 15000); return () => clearInterval(i); }, []);

  async function reserve(e) {
    e.preventDefault(); setErr(""); setBusy(true);
    const r = await fetch("/api/tickets", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ tier: sel, name, phone }) });
    const j = await r.json();
    if (!r.ok) { setBusy(false); setErr(j.error); load(); return; }
    router.push("/t/" + j.token); // keep spinner while the next page opens
  }

  const chosen = tiers?.find(t => t.tier === sel);
  return (
    <>
      <Nav cta={false} />
      <main className="wrap">
        <h1 className="h-md">Choose your ticket</h1>
        <p className="sub">{EVENT.date} · {EVENT.venue}</p>

        {tiers === null && <Loading />}
        {tiers && !tiers.length && <p className="card err">We couldn't load tickets. Refresh the page to try again.</p>}
        <div className="tiers">
          {tiers?.map(t => (
            <button key={t.tier} className="tier" data-c={t.tier} aria-pressed={sel === t.tier} disabled={t.left < 1} onClick={() => setSel(t.tier)}>
              <p className="lab">{EVENT.tiers[t.tier].label}</p>
              <div className="row">
                <span className="price">{naira(t.price)}</span>
                <span className="left">{t.left < 1 ? "Sold out" : `${t.left}/${t.capacity} tickets left`}</span>
              </div>
              <div className="dots" aria-hidden>{Array.from({ length: t.capacity }, (_, i) => <i key={i} className={i < t.capacity - t.left ? "on" : ""} />)}</div>
              {EVENT.tiers[t.tier].note && <p className="note">{EVENT.tiers[t.tier].note}</p>}
            </button>
          ))}
        </div>

        {chosen && (
          <div className="formcard">
            <h2>Your details</h2>
            <form onSubmit={reserve}>
              <label>Full name<input type="text" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" /></label>
              <label>Phone number<input type="tel" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" /></label>
              {err && <p className="err" role="alert">{err}</p>}
              <button className="btn berry" disabled={busy}>{busy && <Spinner sm light />}{busy ? "Reserving your seat…" : `Reserve ${naira(chosen.price)} ticket`}</button>
              <p className="small">Your seat is held for {EVENT.holdMinutes} minutes while you pay.</p>
            </form>
          </div>
        )}
      </main>
    </>
  );
}
