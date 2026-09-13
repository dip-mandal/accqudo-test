'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

interface VerificationResult {
  verified: boolean;
  attempt_id: number;
  test_title: string;
  candidate_id: number;
  score: number;
  status: string;
  submitted_at: string | null;
}

export default function CertificateVerificationPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId;

  const [record, setRecord] = useState<VerificationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function verify() {
      if (!attemptId) return;
      try {
        const res = await fetch(`http://localhost:8000/api/v1/analytics/verify/attempt/${attemptId}`);
        if (!res.ok) {
          throw new Error('Certificate record not found or revoked.');
        }
        const data: VerificationResult = await res.json();
        setRecord(data);
      } catch (err: any) {
        setError(err.message || 'Validation failed.');
      } finally {
        setLoading(false);
      }
    }
    verify();
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 px-4 text-white">
        <div className="text-center space-y-3">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-xs uppercase tracking-widest text-slate-400">Verifying Cryptographic Record...</p>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-950 px-4 text-center">
        <div className="w-full max-w-md rounded-2xl border border-rose-800/40 bg-rose-950/20 p-8 shadow-2xl backdrop-blur-md">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-600/20 text-2xl text-rose-500">
            ✕
          </div>
          <h2 className="mt-4 text-lg font-bold text-white">Invalid or Unverified Certificate</h2>
          <p className="mt-2 text-xs leading-relaxed text-rose-300/80">
            {error || 'This attempt record does not exist in the official accqudo database.'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="mt-6 rounded-lg bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-700"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-md">
        
        {/* Verification Badge */}
        <div className="flex flex-col items-center text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 text-2xl font-bold text-emerald-400 border border-emerald-500/20">
            ✓
          </div>
          <span className="mt-3 rounded-full bg-emerald-500/10 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400 border border-emerald-500/20">
            Authentic Credential Verified
          </span>
          <h1 className="mt-2 text-xl font-bold text-white">Accqudo Examination Record</h1>
          <p className="text-xs text-slate-400">Database Entry Sealed &amp; Validated</p>
        </div>

        {/* Credential Data Table */}
        <div className="mt-6 space-y-3 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs">
          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Attempt ID</span>
            <span className="font-mono font-bold text-white">#{record.attempt_id}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Assessment</span>
            <span className="font-semibold text-right text-slate-200">{record.test_title}</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Verified Score</span>
            <span className="font-mono font-bold text-emerald-400">{record.score.toFixed(2)} Marks</span>
          </div>

          <div className="flex justify-between border-b border-slate-800 pb-2">
            <span className="text-slate-400">Status</span>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold text-slate-300">
              {record.status}
            </span>
          </div>

          <div className="flex justify-between pt-0.5">
            <span className="text-slate-400">Timestamp</span>
            <span className="font-mono text-slate-300">
              {record.submitted_at ? new Date(record.submitted_at).toUTCString() : 'Auto-Submitted'}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[10px] text-slate-500 leading-relaxed">
          This digital certificate was cryptographically generated by the accqudo atomic evaluation engine.
        </p>
      </div>
    </div>
  );
}