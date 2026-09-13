'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Source_Serif_4, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';

const serif = Source_Serif_4({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-serif',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
});

const QR_PATTERN = [
  [1, 1, 1, 0, 1, 0],
  [1, 0, 1, 1, 0, 1],
  [1, 1, 0, 1, 1, 0],
  [0, 1, 1, 0, 1, 1],
  [1, 0, 1, 1, 0, 1],
  [0, 1, 0, 1, 1, 1],
];

const INK = '#14213D';
const INK_MUTED = '#4B5768';
const PAPER = '#EEF2ED';
const PAPER_CARD = '#F8FAF7';
const BRASS = '#A9791F';
const BRASS_DARK = '#8F6519';
const CRIMSON = '#A13D3D';
const LINE = '#CBD3C7';

interface PackageItem {
  id: number;
  exam_id?: number;
  title: string;
  description: string;
  price_inr?: number;
  price?: number;
  validity_days: number;
  total_tests?: number;
  tier?: string;
  tests?: any[];
}

function QrMark({ size = 6 }: { size?: number }) {
  return (
    <div
      className="grid gap-[2px]"
      style={{ gridTemplateColumns: `repeat(6, ${size}px)` }}
      aria-hidden="true"
    >
      {QR_PATTERN.flat().map((filled, i) => (
        <span
          key={i}
          style={{
            width: size,
            height: size,
            backgroundColor: filled ? INK : 'transparent',
          }}
        />
      ))}
    </div>
  );
}

function ViewfinderIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <path d="M2 8V2H8" stroke={INK} strokeWidth="1.6" />
      <path d="M20 2H26V8" stroke={INK} strokeWidth="1.6" />
      <path d="M26 20V26H20" stroke={INK} strokeWidth="1.6" />
      <path d="M8 26H2V20" stroke={INK} strokeWidth="1.6" />
      <rect x="12" y="12" width="4" height="4" fill={BRASS} />
    </svg>
  );
}

function KeypadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect x="0.75" y="0.75" width="26.5" height="26.5" stroke={INK} strokeWidth="1.5" />
      {[5, 13, 21].map((y) =>
        [5, 13, 21].map((x) => <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill={INK} />)
      )}
    </svg>
  );
}

export default function HomePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<{ full_name?: string } | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loadingPackages, setLoadingPackages] = useState(true);

  const apiBase =
    typeof window !== 'undefined' && window.location.hostname === 'localhost'
      ? '/api/v1'
      : 'https://api.accqudo.com/api/v1';

  useEffect(() => {
    const token = localStorage.getItem('accqudo_token');
    if (token) {
      setIsAuthenticated(true);
      const userRaw = localStorage.getItem('accqudo_user');
      if (userRaw) {
        try {
          setUserProfile(JSON.parse(userRaw));
        } catch (e) {
          // Ignore parse errors
        }
      }
    }

    async function fetchPackages() {
      try {
        const res = await fetch(`${apiBase}/admin/packages/all`);
        if (res.ok) {
          const data: PackageItem[] = await res.json();
          setPackages(data);
        }
      } catch (err) {
        console.error('Failed to load packages from database:', err);
      } finally {
        setLoadingPackages(false);
      }
    }

    fetchPackages();
  }, [apiBase]);

  return (
    <div
      className={`${serif.variable} ${plexSans.variable} ${plexMono.variable} min-h-screen`}
      style={{
        backgroundColor: PAPER,
        color: INK,
        fontFamily: 'var(--font-sans)',
        backgroundImage: `
          linear-gradient(${INK}0d 1px, transparent 1px),
          linear-gradient(90deg, ${INK}0d 1px, transparent 1px)
        `,
        backgroundSize: '28px 28px',
      }}
    >
      {/* Navigation Bar */}
      <header
        className="sticky top-0 z-50"
        style={{ backgroundColor: PAPER, borderBottom: `1px solid ${LINE}` }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span
              className="text-2xl font-semibold tracking-tight"
              style={{ fontFamily: 'var(--font-serif)', color: INK }}
            >
              accqudo<span style={{ color: BRASS }}>.</span>
            </span>
            <span
              className="border px-2.5 py-0.5 text-[10px] font-medium"
              style={{
                borderColor: `${INK}33`,
                color: INK_MUTED,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.04em',
              }}
            >
              PAN-INDIA EXAM PREP
            </span>
          </div>

          <div className="hidden items-center gap-8 text-xs font-medium md:flex" style={{ color: INK_MUTED }}>
            <a href="#features" className="transition hover:opacity-70">Features</a>
            <a href="#test-series" className="transition hover:opacity-70">Test Series</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="hidden text-xs sm:inline" style={{ color: INK_MUTED }}>
                  Welcome back, <b style={{ color: INK }}>{userProfile?.full_name || 'Candidate'}</b>
                </span>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-xs font-semibold text-white transition"
                  style={{ backgroundColor: BRASS }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRASS_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRASS)}
                >
                  Candidate Dashboard &rarr;
                </Link>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border px-4 py-2 text-xs font-semibold transition hover:opacity-70"
                  style={{ borderColor: `${INK}40`, color: INK }}
                >
                  Sign In
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-semibold text-white transition"
                  style={{ backgroundColor: BRASS }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = BRASS_DARK)}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = BRASS)}
                >
                  Sign Up Free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-20 md:pt-28 md:pb-24">
        <div className="mx-auto grid max-w-6xl gap-16 px-6 md:grid-cols-[1.1fr_0.9fr] md:items-center">
          <div>
            <div
              className="mb-8 inline-flex items-center gap-2 border px-3 py-1.5 text-xs"
              style={{ borderColor: `${CRIMSON}55`, color: INK_MUTED, fontFamily: 'var(--font-mono)' }}
            >
              <span className="motion-safe:animate-pulse h-1.5 w-1.5" style={{ backgroundColor: CRIMSON }} />
              Live National Mock Series Active
            </div>

            <h1
              className="text-4xl leading-[1.08] tracking-tight sm:text-5xl md:text-6xl"
              style={{ fontFamily: 'var(--font-serif)', color: INK, fontWeight: 600 }}
            >
              Master India&rsquo;s toughest exams with{' '}
              <span style={{ color: BRASS, fontStyle: 'italic' }}>
                exact examination parity.
              </span>
            </h1>

            <p className="mt-6 max-w-lg text-base sm:text-lg" style={{ color: INK_MUTED }}>
              Experience authentic exam interfaces, verified official scientific calculators, instant KaTeX scratchpads, and tamper-proof QR scorecards driven entirely from live database packages.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href={isAuthenticated ? '/dashboard' : '/login'}
                className="px-7 py-3.5 text-center text-sm font-semibold text-white transition"
                style={{ backgroundColor: INK }}
              >
                {isAuthenticated ? 'Go to Test Dashboard' : 'Launch Live Mock Test'}
              </Link>
              <a
                href="#test-series"
                className="border px-7 py-3.5 text-center text-sm font-semibold transition hover:opacity-70"
                style={{ borderColor: `${INK}40`, color: INK }}
              >
                Explore Test Series &rarr;
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-sm">
            <div
              className="relative overflow-hidden border p-6"
              style={{ backgroundColor: PAPER_CARD, borderColor: LINE }}
            >
              <span
                className="pointer-events-none absolute -right-6 top-10 select-none text-5xl font-semibold"
                style={{
                  color: INK,
                  opacity: 0.06,
                  transform: 'rotate(-18deg)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                SPECIMEN
              </span>

              <div className="flex items-start justify-between">
                <div style={{ fontFamily: 'var(--font-mono)' }}>
                  <div className="text-[10px]" style={{ color: INK_MUTED, letterSpacing: '0.05em' }}>
                    ACCQUDO · VERIFIED SCORECARD
                  </div>
                  <div className="mt-1 text-sm font-medium" style={{ color: INK }}>
                    Any exam. One format.
                  </div>
                </div>
                <QrMark size={5} />
              </div>

              <div className="my-5 border-t border-dashed" style={{ borderColor: LINE }} />

              <div className="space-y-3" style={{ fontFamily: 'var(--font-mono)' }}>
                {['Exam', 'Candidate', 'Roll Number', 'Percentile'].map((label) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span style={{ color: INK_MUTED }}>{label}</span>
                    <span className="w-24 border-b" style={{ borderColor: `${INK}40` }} />
                  </div>
                ))}
              </div>

              <div className="mt-5 text-[10px]" style={{ color: INK_MUTED, fontFamily: 'var(--font-mono)' }}>
                Generated automatically after every mock test
              </div>
            </div>

            <div className="absolute left-0 top-6 h-3 w-3 -translate-x-1/2 rounded-full" style={{ backgroundColor: PAPER }} />
            <div className="absolute left-0 bottom-6 h-3 w-3 -translate-x-1/2 rounded-full" style={{ backgroundColor: PAPER }} />
          </div>
        </div>
      </section>

      {/* Feature Spec Sheet */}
      <section id="features" className="px-6 py-20" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="mx-auto max-w-5xl">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-medium" style={{ color: BRASS, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              Exam-Engine Specs
            </p>
            <h2 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-serif)', color: INK, fontWeight: 600 }}>
              Built for Every Competitive Exam Aspirant
            </h2>
          </div>

          <div style={{ borderTop: `1px solid ${LINE}` }}>
            {[
              {
                icon: <KeypadIcon />,
                title: 'Authentic Exam UI & Calculator',
                desc: 'Matches the exact on-screen layout of each real examination with official scientific calculators and single-keystroke inputs.',
              },
              {
                icon: (
                  <span
                    className="text-2xl italic"
                    style={{ fontFamily: 'var(--font-serif)', color: INK }}
                  >
                    &#8721;
                  </span>
                ),
                title: 'Formula & KaTeX Scratchpad',
                desc: 'Rough pad with KaTeX mathematical rendering to draft formulas, derivations, and equations for complex quantitative and technical problems.',
              },
              {
                icon: <ViewfinderIcon />,
                title: 'QR-Sealed Official Scorecard',
                desc: 'Cryptographically validated PDF scorecards with embedded QR codes verified live against Accqudo’s public ledger.',
              },
            ].map((f) => (
              <div
                key={f.title}
                className="grid grid-cols-[40px_1fr] gap-6 py-7 sm:grid-cols-[56px_180px_1fr] sm:items-start"
                style={{ borderBottom: `1px solid ${LINE}` }}
              >
                <div className="flex h-10 w-10 items-center justify-center border" style={{ borderColor: `${INK}30` }}>
                  {f.icon}
                </div>
                <h3
                  className="col-span-2 mt-3 text-base font-medium sm:col-span-1 sm:mt-0"
                  style={{ color: INK, fontFamily: 'var(--font-serif)' }}
                >
                  {f.title}
                </h3>
                <p className="col-span-2 text-sm leading-relaxed sm:col-span-1" style={{ color: INK_MUTED }}>
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Test Series Pricing & Enrollment - Loaded Live from Database */}
      <section id="test-series" className="px-6 py-20" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="mx-auto max-w-6xl">
          <div className="mb-14 max-w-xl">
            <p className="text-xs font-medium" style={{ color: BRASS, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}>
              Database Catalog
            </p>
            <h2 className="mt-2 text-3xl" style={{ fontFamily: 'var(--font-serif)', color: INK, fontWeight: 600 }}>
              Available Test Packages
            </h2>
            <p className="mt-3 text-sm" style={{ color: INK_MUTED }}>
              All packages below are loaded directly from the database catalog in real time.
            </p>
          </div>

          {loadingPackages ? (
            <div className="py-12 text-center text-xs font-medium" style={{ color: INK_MUTED, fontFamily: 'var(--font-mono)' }}>
              Loading active test packages from database...
            </div>
          ) : packages.length === 0 ? (
            <div className="py-12 text-center text-xs font-medium border border-dashed p-8" style={{ borderColor: LINE, color: INK_MUTED }}>
              No active packages found in the database.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {packages.map((pkg) => {
                const pkgPrice = pkg.price_inr ?? pkg.price ?? 0;
                return (
                  <div
                    key={pkg.id}
                    className="relative flex flex-col justify-between border"
                    style={{ backgroundColor: PAPER_CARD, borderColor: LINE }}
                  >
                    <div className="p-8">
                      <div className="mb-4 flex items-center justify-between">
                        <span
                          className="border px-3 py-1 text-[10px] font-medium uppercase"
                          style={{ borderColor: `${INK}30`, color: INK_MUTED, fontFamily: 'var(--font-mono)' }}
                        >
                          {pkg.tier || 'Standard Pass'}
                        </span>
                        <span className="text-xs font-mono" style={{ color: INK_MUTED }}>
                          {pkg.validity_days} Days Access
                        </span>
                      </div>
                      <h3 className="text-lg font-medium" style={{ fontFamily: 'var(--font-serif)', color: INK }}>
                        {pkg.title}
                      </h3>
                      <div
  className="mt-3 space-y-1.5 text-xs leading-relaxed"
  style={{ color: INK_MUTED }}
>
  {pkg.description
    ?.split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line, index) => {
      const text = line.trim().replace(/^✓\s*/, '');

      return (
        <div key={index} className="flex items-start gap-2">
          <span
            className="shrink-0 font-semibold"
            style={{ color: INK }}
          >
            ✓
          </span>

          <span>{text}</span>
        </div>
      );
    })}
</div>
                      <div className="mt-6 text-3xl font-semibold" style={{ fontFamily: 'var(--font-mono)', color: INK }}>
                        ₹{pkgPrice.toFixed(0)}
                      </div>
                    </div>
                    <div className="relative border-t border-dashed px-8 py-6" style={{ borderColor: LINE }}>
                      <div className="absolute -left-2 -top-2 h-4 w-4 rounded-full" style={{ backgroundColor: PAPER }} />
                      <div className="absolute -right-2 -top-2 h-4 w-4 rounded-full" style={{ backgroundColor: PAPER }} />
                      <Link
                        href={isAuthenticated ? '/dashboard' : '/login'}
                        className="block w-full py-3 text-center text-xs font-semibold text-white transition"
                        style={{ backgroundColor: INK }}
                      >
                        {isAuthenticated ? 'Open In Dashboard' : 'Enroll Now'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="px-6 py-10 text-center text-xs"
        style={{ borderTop: `1px solid ${LINE}`, color: INK_MUTED }}
      >
        <p>© 2026 Accqudo Assessment Platform. Built for India&rsquo;s high-stakes competitive examinations.</p>
      </footer>
    </div>
  );
}