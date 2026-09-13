'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { CheckoutModal } from '@/components/CheckoutModal';
import { Globe } from 'lucide-react';

interface TestDetail {
  id: number;
  title: string;
  duration_minutes: number;
  total_marks: number;
  instructions: string | null;
  question_count?: number;
}

interface PackageItem {
  id: number;
  title: string;
  description: string | null;
  price: number;
  validity_days: number;
  test_ids: number[];
}

type Language = 'en' | 'hi' | 'bn';

export default function TestInstructionsPage() {
  const params = useParams();
  const router = useRouter();

  const testId = params?.testId;

  const [test, setTest] = useState<TestDetail | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [selectedPackage, setSelectedPackage] =
    useState<PackageItem | null>(null);

  const [showCheckout, setShowCheckout] = useState(false);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [agreed, setAgreed] = useState(false);
  const [selectedLang, setSelectedLang] = useState<Language>('en');

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8000/api/v1';

  useEffect(() => {
    async function loadTestAndPackages() {
      if (!testId) return;

      try {
        const token =
          typeof window !== 'undefined'
            ? localStorage.getItem('accqudo_token')
            : null;

        const headers: HeadersInit = {
          'Content-Type': 'application/json',
          ...(token
            ? {
                Authorization: `Bearer ${token}`,
              }
            : {}),
        };

        // Load available packages
        const pkgRes = await fetch(
          `${apiBase}/payments/packages`,
          {
            headers,
          }
        );

        if (pkgRes.ok) {
          const availablePkgs: PackageItem[] =
            await pkgRes.json();

          setPackages(availablePkgs);
        }

        // Test details
        setTest({
          id: Number(testId),
          title: `GATE CSE Grand Mock #${testId}`,
          duration_minutes: 90,
          total_marks: 5.0,
          instructions:
            'Standard GATE examination guidelines apply: MCQ carries 1/3 negative marking. Multiple Select Questions (MSQ) and Numerical Answer Type (NAT) carry 0 negative marking. Calculators and KaTeX scratchpads are enabled in the session.',
        });
      } catch (err) {
        console.error(err);
        setError('Failed to load test details.');
      } finally {
        setLoading(false);
      }
    }

    loadTestAndPackages();
  }, [testId, apiBase]);

  async function handleLaunchExam() {
    if (!agreed) {
      alert(
        'Please accept the examination terms and instructions before starting.'
      );
      return;
    }

    if (!testId) {
      setError('Invalid test ID.');
      return;
    }

    setStarting(true);
    setError(null);

    try {
      const token =
        localStorage.getItem('accqudo_token');

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),
      };

      const res = await fetch(
        `${apiBase}/attempts/start/${testId}`,
        {
          method: 'POST',
          headers,
        }
      );

      // Payment required
      if (res.status === 402) {
        const matchingPkg =
          packages.find((pkg) =>
            pkg.test_ids.includes(Number(testId))
          ) || packages[0];

        if (matchingPkg) {
          setSelectedPackage(matchingPkg);
          setShowCheckout(true);
        } else {
          router.push('/pricing');
        }

        return;
      }

      if (!res.ok) {
        let message =
          'Could not start exam session.';

        try {
          const errJson = await res.json();
          message =
            errJson?.detail || message;
        } catch {
          // Ignore JSON parsing errors
        }

        throw new Error(message);
      }

      const session = await res.json();

      if (!session?.attempt_id) {
        throw new Error(
          'Exam session was created but no attempt ID was returned.'
        );
      }

      /*
       * Pass the selected language to the exam player.
       *
       * The player should treat this language as locked
       * for the duration of the examination.
       */
      router.push(
        `/exam/${session.attempt_id}?lang=${selectedLang}`
      );
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          'Error launching examination session.'
      );
    } finally {
      setStarting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Exam Hall Portal
            </span>

            <h1 className="text-2xl font-black text-slate-900">
              {test?.title}
            </h1>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs font-medium text-rose-800">
            {error}
          </div>
        )}

        {/* Test Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">

          {/* Duration */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">
              Duration
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {test?.duration_minutes} Mins
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Automated timer enforcement
            </p>
          </div>

          {/* Marks */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">
              Max Marks
            </p>

            <p className="mt-1 text-2xl font-black text-slate-900">
              {test?.total_marks.toFixed(1)}
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Official GATE marking schema
            </p>
          </div>

          {/* Snapshot */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase text-slate-400">
              Snapshot Policy
            </p>

            <p className="mt-1 text-2xl font-black text-indigo-600">
              Locked
            </p>

            <p className="mt-0.5 text-[11px] text-slate-500">
              Version frozen upon entry
            </p>
          </div>
        </div>

        {/* Language Selector */}
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-indigo-200 bg-indigo-50 p-6 shadow-sm sm:flex-row sm:items-center">

          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow">
              <Globe className="h-6 w-6" />
            </div>

            <div>
              <h3 className="text-sm font-extrabold text-indigo-950">
                Select Examination Language
              </h3>

              <p className="mt-0.5 text-xs text-indigo-700">
                Questions, options, and portal elements will be
                displayed in your selected language. This choice
                is permanent once the test begins.
              </p>
            </div>
          </div>

          <select
            value={selectedLang}
            onChange={(e) =>
              setSelectedLang(
                e.target.value as Language
              )
            }
            disabled={starting}
            className="w-full cursor-pointer rounded-xl border border-indigo-300 bg-white px-4 py-2.5 text-xs font-bold text-indigo-950 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <option value="en">
              English (Default)
            </option>

            <option value="hi">
              हिन्दी (Hindi)
            </option>

            <option value="bn">
              বাংলা (Bengali)
            </option>
          </select>
        </div>

        {/* Instructions */}
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">

          <h2 className="border-b border-slate-100 pb-3 text-base font-bold text-slate-900">
            General Instructions &amp; Rules
          </h2>

          <div className="space-y-2 text-xs leading-relaxed text-slate-600">

            <p>
              1. The countdown clock at the top-right corner
              indicates the remaining time available to complete
              the test.
            </p>

            <p>
              2. Questions are categorized into three formats:{' '}
              <strong>Multiple Choice (MCQ)</strong>,{' '}
              <strong>Multiple Select (MSQ)</strong>, and{' '}
              <strong>Numerical Answer Type (NAT)</strong>.
            </p>

            <p>
              3. <strong>Negative Marking:</strong> For 1-mark
              MCQs, 0.33 marks will be deducted for wrong answers.
              MSQ and NAT questions carry{' '}
              <strong>NO negative marking</strong>.
            </p>

            <p>
              4. All answers are autosaved dynamically to the
              Redis session store upon selection.
            </p>

            <p>
              5. If the countdown expires before manual
              submission, the session will automatically freeze
              and compute your final score.
            </p>
          </div>

          {/* Declaration */}
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4">

            <input
              type="checkbox"
              id="declaration"
              checked={agreed}
              onChange={(e) =>
                setAgreed(e.target.checked)
              }
              className="mt-0.5 h-4 w-4 cursor-pointer rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
            />

            <label
              htmlFor="declaration"
              className="cursor-pointer select-none text-xs text-slate-700"
            >
              I have read and understood all instructions. I
              confirm that I will not use unauthorized resources
              during this assessment.
            </label>
          </div>
        </div>

        {/* Launch Buttons */}
        <div className="flex justify-end gap-3">

          <button
            onClick={() =>
              router.push('/dashboard')
            }
            disabled={starting}
            className="rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleLaunchExam}
            disabled={starting || !agreed}
            className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold text-white shadow-md transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {starting
              ? 'Initializing Full-Screen & Session...'
              : 'Start Assessment Now →'}
          </button>
        </div>
      </div>

      {/* Checkout */}
      {selectedPackage && (
        <CheckoutModal
          pkg={selectedPackage}
          isOpen={showCheckout}
          onClose={() =>
            setShowCheckout(false)
          }
          onSuccess={() => {
            setShowCheckout(false);
            handleLaunchExam();
          }}
        />
      )}
    </div>
  );
}