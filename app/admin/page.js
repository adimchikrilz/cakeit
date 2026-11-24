"use client";
import { useEffect, useState } from "react";
import { Loading } from "@/components/Spinner";

const naira = n => "₦" + n.toLocaleString("en-NG");
const ago = d => new Date(d).toLocaleString("en-NG", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default function Admin() {
  const [d, setD] = useState(null);
  const [auth, setAuth] = useState(null);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const load = async () => {
    const r = await fetch("/api/admin/tickets", { cache: "no-store" });
    if (r.status === 401) return setAuth(false);
    setD(await r.json()); setAuth(true);
  };
  useEffect(() => { load(); const i = setInterval(load, 10000); return () => clearInterval(i); }, []);

  async function login(e) {
    e.preventDefault(); setErr("");
    const r = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: pw }) });
    if (!r.ok) return setErr("Wrong password");
    load();
  }
  async function act(token, action) {
    if (action === "reject" && !confirm("Reject this ticket and free the seat?")) return;
    await fetch(`/api/admin/tickets/${token}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action }) });
    load();
  }

  if (auth === null) return <Loading />;
  if (!auth) return (
    <main className="wrap">
      <h1 style={{ fontSize: "2.4rem" }}>Host login</h1>
      <form onSubmit={login}>
        <label>Password<input type="password" value={pw} onChange={e => setPw(e.target.value)} autoFocus /></label>
        {err && <p className="err" role="alert">{err}</p>}
        <button className="btn">Log in</button>
      </form>
    </main>
  );

  const by = s => d.tickets.filter(t => (Array.isArray(s) ? s : [s]).includes(t.status));
  const pending = by("pending"), guests = by(["approved", "used"]), other = by(["held", "rejected"]);
  const total = guests.length;

  return (
    <main className="wrap wide">
      <h1 style={{ fontSize: "2.4rem" }}>Tickets</h1>
      <div className="stats">
        {d.tiers.map(t => <div className="stat" key={t.tier}><span className="small">{naira(t.price)} seats taken</span><br /><b>{t.sold}/{t.capacity}</b></div>)}
        <div className="stat"><span className="small">Approved</span><br /><b>{total}</b></div>
        <div className="stat"><span className="small">Checked in</span><br /><b>{by("used").length}/{total}</b></div>
      </div>

      <h2>Needs approval ({pending.length})</h2>
      {!pending.length && <p className="sub">No payments waiting. New proofs appear here automatically.</p>}
      {pending.map(t => (
        <div className="item has" key={t.token}>
          <div>
            <b>{t.name}</b> · {naira(t.tier === "15k" ? 15000 : 20000)}
            <p className="small">{t.phone} · sent {ago(t.proofAt || t.createdAt)}</p>
            <p className="small">Match the amount and time with your bank alert before approving.</p>
            <div className="actions" style={{ marginTop: 12 }}>
              <button className="btn ok" onClick={() => act(t.token, "approve")}>Approve</button>
              <button className="btn bad" onClick={() => act(t.token, "reject")}>Reject</button>
            </div>
          </div>
          <a href={`/api/admin/proof/${t.token}`} target="_blank" rel="noreferrer"><img src={`/api/admin/proof/${t.token}`} alt={`Payment proof from ${t.name}`} /></a>
        </div>
      ))}

      <h2 style={{ marginTop: 36 }}>Guests ({guests.length})</h2>
      {guests.map(t => (
        <div className="item" key={t.token}>
          <div className="row">
            <span><b>{t.name}</b> · {naira(t.tier === "15k" ? 15000 : 20000)}<br /><span className="small">{t.phone}</span></span>
            <span className={`chip ${t.status}`}>{t.status === "used" ? "Checked in" : "Approved"}</span>
          </div>
          <div className="actions"><button className="btn ghost" onClick={() => { navigator.clipboard?.writeText(`${location.origin}/t/${t.token}`); alert("Ticket link copied. Send it to the guest."); }}>Copy ticket link</button>{t.status === "approved" && <button className="btn bad" onClick={() => act(t.token, "reject")}>Cancel ticket</button>}</div>
        </div>
      ))}

      {!!other.length && <>
        <h2 style={{ marginTop: 36 }}>Unpaid and rejected ({other.length})</h2>
        {other.map(t => <div className="item" key={t.token}><div className="row"><span>{t.name} · <span className="small">{t.phone}</span></span><span className={`chip ${t.status}`}>{t.status === "held" ? "Unpaid" : "Rejected"}</span></div></div>)}
      </>}
    </main>
  );
}
