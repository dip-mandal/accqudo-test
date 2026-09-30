import Link from "next/link";
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import type { ReactNode } from "react";

const serif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-sans",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const INK = "#14213D";
export const INK_MUTED = "#4B5768";
export const PAPER = "#EEF2ED";
export const PAPER_CARD = "#F8FAF7";
export const BRASS = "#A9791F";
export const BRASS_DARK = "#8F6519";
export const CRIMSON = "#A13D3D";
export const LINE = "#CBD3C7";

export function InfoShell({
  title,
  eyebrow,
  updated = "September 30, 2026",
  children,
}: {
  title: string;
  eyebrow: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`${serif.variable} ${plexSans.variable} ${plexMono.variable} min-h-screen`}
      style={{
        backgroundColor: PAPER,
        color: INK,
        fontFamily: "var(--font-sans)",
        backgroundImage: `
          linear-gradient(${INK}0d 1px, transparent 1px),
          linear-gradient(90deg, ${INK}0d 1px, transparent 1px)
        `,
        backgroundSize: "28px 28px",
      }}
    >
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: PAPER, borderBottom: `1px solid ${LINE}` }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-6 py-4">
          <Link href="/" className="shrink-0">
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: "var(--font-serif)", color: INK }}
            >
              accqudo<span style={{ color: BRASS }}>.</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-5 text-xs md:flex" style={{ color: INK_MUTED }}>
            <Link href="/#features" className="hover:opacity-70">Features</Link>
            <Link href="/#test-series" className="hover:opacity-70">Test Series</Link>
            <Link href="/info/contact" className="hover:opacity-70">Contact</Link>
          </nav>

          <Link
            href="/login"
            className="px-4 py-2 text-xs font-semibold text-white"
            style={{ backgroundColor: BRASS }}
          >
            Sign In
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-6 py-12 md:py-16">
        <div className="mb-10 border-b pb-8" style={{ borderColor: LINE }}>
          <p
            className="text-xs font-medium uppercase tracking-[0.08em]"
            style={{ color: BRASS, fontFamily: "var(--font-mono)" }}
          >
            {eyebrow}
          </p>
          <h1
            className="mt-3 text-4xl leading-tight md:text-5xl"
            style={{ fontFamily: "var(--font-serif)", fontWeight: 600 }}
          >
            {title}
          </h1>
          <p className="mt-4 text-xs" style={{ color: INK_MUTED }}>
            Last updated: {updated}
          </p>
        </div>

        <article
          className="border p-6 md:p-10"
          style={{ backgroundColor: PAPER_CARD, borderColor: LINE }}
        >
          <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[#14213D] prose-p:text-[#4B5768] prose-li:text-[#4B5768] prose-strong:text-[#14213D]">
            {children}
          </div>
        </article>
      </main>

      <footer
        className="px-6 py-10"
        style={{ borderTop: `1px solid ${LINE}`, color: INK_MUTED }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-8 md:grid-cols-[1.3fr_1fr_1fr]">
            <div>
              <div
                className="text-xl font-semibold"
                style={{ fontFamily: "var(--font-serif)", color: INK }}
              >
                accqudo<span style={{ color: BRASS }}>.</span>
              </div>
              <p className="mt-2 max-w-sm text-xs leading-relaxed">
                Online exam-practice platform for structured test preparation, mock tests,
                attempts and performance analysis.
              </p>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: INK }}>
                Legal
              </p>
              <div className="space-y-2 text-xs">
                <Link className="block hover:opacity-70" href="/info/private-policy">Privacy Policy</Link>
                <Link className="block hover:opacity-70" href="/info/terms">Terms of Use</Link>
                <Link className="block hover:opacity-70" href="/info/refund-policy">Refund Policy</Link>
                <Link className="block hover:opacity-70" href="/info/subscription-terms">Subscription Terms</Link>
              </div>
            </div>

            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider" style={{ color: INK }}>
                Support
              </p>
              <div className="space-y-2 text-xs">
                <Link className="block hover:opacity-70" href="/info/contact">Contact Accqudo</Link>
                <a className="block hover:opacity-70" href="mailto:accqudo@gmail.com">accqudo@gmail.com</a>
              </div>
            </div>
          </div>

          <div className="mt-8 border-t pt-6 text-xs" style={{ borderColor: LINE }}>
            <p>© 2026 Accqudo. All rights reserved.</p>
            <p className="mt-2 max-w-3xl">
              Accqudo is an independent educational test-preparation platform. It is not
              affiliated with or endorsed by any examination authority unless expressly stated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
