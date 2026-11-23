"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Spinner from "@/components/Spinner";

const VIEW = {
  ok:      { bg: "#1E8E4E", h: "Approved", p: "Let them in" },
  valid:   { bg: "#1E8E4E", h: "Approved", p: "Valid ticket" },
  used:    { bg: "#C62828", h: "Already used", p: "This ticket was scanned before" },
  pending: { bg: "#A86A00", h: "Pending", p: "Payment not approved yet" },
  invalid: { bg: "#C62828", h: "Invalid", p: "No valid ticket found" },
};

export default function Verify() {
  const { token } = useParams();
  const [v, setV] = useState(null);

  useEffect(() => {
    (async () => {
      let r = await fetch(`/api/verify/${token}`, { method: "POST" }); // host: checks in
      let guest = false;
      if (r.status === 401) { guest = true; r = await fetch(`/api/verify/${token}`); } // not logged in: look only
      setV({ ...(await r.json()), guest });
    })().catch(() => setV({ result: "invalid" }));
  }, [token]);

  if (!v) return <main className="gate" style={{ background: "#2A1730" }}><Spinner light /></main>;
  const s = VIEW[v.result] || VIEW.invalid;
  return (
    <main className="gate" style={{ background: s.bg }}>
      <h1>{s.h}</h1>
      <p>{s.p}</p>
      {v.name && <p>{v.name}{v.tier && ` · ₦${v.tier === "15k" ? "15,000" : "20,000"}`}</p>}
      {v.usedAt && <small>Checked in {new Date(v.usedAt).toLocaleTimeString("en-NG", { hour: "numeric", minute: "2-digit" })}</small>}
      {v.guest && v.result === "valid" && <small>Open /admin on this phone and log in so scans check guests in.</small>}
    </main>
  );
}
