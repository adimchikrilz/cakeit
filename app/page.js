"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Cake from "@/components/Cake";
import Spinner from "@/components/Spinner";
import { EVENT } from "@/lib/config";

const STEPS = [
  ["Choose your ticket", "Pick your seat and enter your name and phone number."],
  ["Pay by transfer", `Send the exact amount to the account shown. Your seat is held for ${EVENT.holdMinutes} minutes.`],
  ["Upload your screenshot", "Send a screenshot of your transfer so we can confirm your payment."],
  ["Show your QR at the gate", "Your QR code is scanned at the door, and you're in."],
];

export default function Home() {
  const [tiers, setTiers] = useState(null);
  useEffect(() => { fetch("/api/tickets", { cache: "no-store" }).then(r => r.json()).then(setTiers).catch(() => setTiers([])); }, []);
  const left = tiers?.reduce((a, t) => a + t.left, 0), cap = tiers?.reduce((a, t) => a + t.capacity, 0);

  return (
    <>
      <Nav />
      <header className="hero">
        <div>
          <span className="pill">
            {tiers === null ? <Spinner sm /> : !tiers.length ? "Limited seats" : left < 1 ? "Sold out" : <><b>{left}</b> of {cap} seats left</>}
          </span>
          <h1>{EVENT.title}.</h1>
          <p className="lead">{EVENT.tagline}</p>
          <div className="facts"><span>{EVENT.date}</span><span>{EVENT.venue}</span></div>
          {tiers && tiers.length > 0 && left < 1
            ? <span className="btn lg" style={{ background: "var(--mute)" }}>Sold out</span>
            : <Link href="/tickets" className="btn berry lg">Get ticket</Link>}
        </div>
        <div className="hero-art">{EVENT.photo ? <img src={EVENT.photo} alt="Cake decorated at our event" /> : <Cake />}</div>
      </header>

      <section className="steps" id="how">
        <h2 className="h-md">How it works</h2>
        <ol>{STEPS.map(([h, p], i) => <li key={h}><b>{i + 1}</b><h3>{h}</h3><p>{p}</p></li>)}</ol>
      </section>

      <section className="band">
        <h2>Only {cap || 20} seats.</h2>
        <p>Once they're gone, they're gone.</p>
        <Link href="/tickets" className="btn berry lg">Get ticket</Link>
      </section>
      <p className="foot">{EVENT.title} · {EVENT.date}</p>
    </>
  );
}
