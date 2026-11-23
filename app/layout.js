import { Bricolage_Grotesque, Figtree } from "next/font/google";
import "./globals.css";
import { EVENT } from "@/lib/config";

const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--display" });
const body = Figtree({ subsets: ["latin"], variable: "--body" });

export const metadata = { title: `${EVENT.title} · Tickets`, description: EVENT.tagline };
export const viewport = { width: "device-width", initialScale: 1 };

export default function Layout({ children }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
