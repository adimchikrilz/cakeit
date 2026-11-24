"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { EVENT } from "@/lib/config";
import { saved } from "@/lib/saved";

export default function Nav({ cta = true }) {
  const [has, setHas] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setHas(saved().length > 0), []);

  // close on route change
  useEffect(() => setOpen(false), [pathname]);

  // close on Escape + lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const onKey = e => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const hasLinks = has || cta;

  return (
    <nav className="nav">
      <Link href="/" className="brand"><span className="mark" />{EVENT.title}</Link>

      {hasLinks && (
        <>
          <button
            type="button"
            className="burger"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="nav-menu"
            onClick={() => setOpen(o => !o)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>

          <div id="nav-menu" className={`navr${open ? " open" : ""}`}>
            {has && <Link href="/my-tickets" className="navlink">My ticket</Link>}
            {cta && <Link href="/tickets" className="btn berry sm">Get ticket</Link>}
          </div>
        </>
      )}
    </nav>
  );
}