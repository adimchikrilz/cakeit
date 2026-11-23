import Link from "next/link";
import { EVENT } from "@/lib/config";

export default function Nav({ cta = true }) {
  return (
    <nav className="nav">
      <Link href="/" className="brand"><span className="mark" />{EVENT.title}</Link>
      {cta && <Link href="/tickets" className="btn berry sm">Get ticket</Link>}
    </nav>
  );
}
