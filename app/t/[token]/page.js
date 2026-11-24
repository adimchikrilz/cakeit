"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import Nav from "@/components/Nav";
import Spinner, { Loading } from "@/components/Spinner";
import { EVENT } from "@/lib/config";
import { save } from "@/lib/saved";

const naira = n => "₦" + n.toLocaleString("en-NG");
const LABEL = { held: "Awaiting payment", pending: "Pending approval", approved: "Approved", used: "Checked in", rejected: "Rejected", expired: "Expired" };

export default function Ticket() {
  const { token } = useParams();
  const [t, setT] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [file, setFile] = useState(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const load = () => fetch(`/api/tickets/${token}`, { cache: "no-store" })
    .then(async r => { if (r.ok) { save(token); setT(await r.json()); } else setT({ status: "missing" }); }).catch(() => {});
  useEffect(() => {
    load();
    const a = setInterval(load, 8000), b = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(a); clearInterval(b); };
  }, [token]);

  async function send(e) {
    e.preventDefault();
    if (!file) return setErr("Choose your payment screenshot first");
    setBusy(true); setErr("");
    const f = new FormData(); f.append("proof", file);
    const r = await fetch(`/api/tickets/${token}/proof`, { method: "POST", body: f });
    const j = await r.json();
    if (!r.ok) { setBusy(false); return setErr(j.error); }
    await load(); setBusy(false);
  }

  if (!t) return <><Nav /><Loading /></>;
  if (t.status === "missing") return <><Nav /><main className="wrap"><h2>Ticket not found</h2><p className="sub">Check the link, or <a href="/tickets">get a new ticket</a>.</p></main></>;

  const secs = t.holdExpires ? Math.max(0, Math.ceil((new Date(t.holdExpires) - now) / 1000)) : 0;
  const mmss = `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`;
  const showQR = ["pending", "approved", "used"].includes(t.status);

  return (
    <>
      <Nav />
      <main className="wrap">
        <div className="stub">
          <div className="stub-h">
            <div>
              <span className="t">{EVENT.title} · {EVENT.tiers[t.tier]?.label}</span>
              <h2>{t.name}</h2>
              <span className="t">{naira(t.price)} · {EVENT.date}</span>
            </div>
            <span className={`chip ${t.status}`}>{LABEL[t.status]}</span>
          </div>

          <div className="stub-b">
            {t.status === "held" && <>
              <div className="row"><h2>Pay {naira(t.price)}</h2><span className="timer">{mmss}</span></div>
              <p className="small">Transfer the exact amount, then upload your screenshot.</p>
              <div className="acct">
                <div><span className="small">{t.bank}</span><br /><b>{t.accountNumber}</b><br /><span className="small">{t.accountName}</span></div>
                <button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(t.accountNumber); setCopied(true); setTimeout(() => setCopied(false), 1500); }}>{copied ? "Copied" : "Copy"}</button>
              </div>
              <form onSubmit={send} style={{ marginTop: 0 }}>
                <label>Payment screenshot<input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></label>
                {err && <p className="err" role="alert">{err}</p>}
                <button className="btn berry" disabled={busy}>{busy && <Spinner sm light />}{busy ? "Sending…" : "Send proof of payment"}</button>
              </form>
            </>}

            {showQR && <>
              <div className={`qr ${t.status === "pending" ? "dim" : ""}`}><QRCodeSVG value={`${location.origin}/verify/${token}`} size={230} /></div>
              <p className="sub" style={{ textAlign: "center" }}>
                {t.status === "pending" && "We're checking your payment. This page updates on its own once it's approved. Keep this page or screenshot it."}
                {t.status === "approved" && "You're in. Show this QR at the gate on the day."}
                {t.status === "used" && "This ticket has been used."}
              </p>
              <p style={{ textAlign: "center", marginTop: 14 }}>
                <button className="btn ghost sm" onClick={() => { navigator.clipboard?.writeText(location.href); setLinkCopied(true); setTimeout(() => setLinkCopied(false), 1800); }}>{linkCopied ? "Link copied" : "Copy ticket link"}</button>
              </p>
              <p className="small" style={{ textAlign: "center", marginTop: 8 }}>Saved on this device. Open the link on any phone to see your QR again.</p>
            </>}

            {t.status === "rejected" && <p>We couldn't confirm this payment, so the ticket was cancelled. Contact the host if you've paid, or <a href="/tickets">get a new ticket</a>.</p>}
            {t.status === "expired" && <p>Your {EVENT.holdMinutes} minutes ran out and the seat was released. <a href="/tickets">Reserve again</a> if tickets are left.</p>}
          </div>
        </div>
      </main>
    </>
  );
}
