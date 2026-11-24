"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { EVENT } from "@/lib/config";
import { saved } from "@/lib/saved";

export default function Nav({ cta = true }) {
  const [has, setHas] = useState(false);
  useEffect(() => setHas(saved().length > 0), []);
  return (
    <nav className="nav">
      <Link href="/" className="brand"><span className="mark" />{EVENT.title}</Link>
      <div className="navr">
        {has && <Link href="/my-tickets" className="navlink">My ticket</Link>}
        {cta && <Link href="/tickets" className="btn berry sm">Get ticket</Link>}
      </div>
    </nav>
  );
}
