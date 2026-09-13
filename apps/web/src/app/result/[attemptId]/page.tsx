'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { MathRenderer } from '@/components/MathRenderer';

interface OptionItem {
  id?: string;
  key?: string;
  text: string;
}

interface QuestionReview {
  id?: number;
  snapshot_id?: number;
  order: number;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  question_text: any;
  options: OptionItem[] | string | null;
  student_response: any;
  evaluation_data: Record<string, any> | string;
  solution_text: string | null;
  marks: number;
  negative_marks: number;
  obtained_marks: number | null;
  is_correct: boolean | null;
}

interface AnalyticsData {
  attempt_id: number;
  test_id: number;
  overall_summary: {
    score: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    duration_taken_seconds: number;
  };
  subject_breakdown?: any[];
  topic_breakdown?: any[];
  weak_areas?: any[];
  question_reviews: QuestionReview[];
}

interface UserRankInfo {
  is_ranked: boolean;
  rank?: number;
  total_participants?: number;
  score?: number;
  percentile?: number;
  reason?: string;
}

function safeParse(val: any): any {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
}

function normalizeQuestionText(raw: any): string {
  if (typeof raw === 'object' && raw !== null) {
    return raw.raw || raw.text || JSON.stringify(raw);
  }
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw);
      if (typeof parsed === 'object' && parsed !== null) {
        return parsed.raw || parsed.text || raw;
      }
    } catch {
      return raw;
    }
  }
  return String(raw || '');
}

export default function ResultAnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const attemptId = params?.attemptId;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accqudo.com/api/v1';

  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [rankInfo, setRankInfo] = useState<UserRankInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadingPdf, setDownloadingPdf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'solutions'>('analytics');
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'CORRECT' | 'INCORRECT' | 'UNANSWERED'>('ALL');

  useEffect(() => {
    async function fetchData() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('accqudo_token') || '' : '';
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token.trim()}`;
        }

        const res = await fetch(`${apiBase}/analytics/attempt/${attemptId}`, { headers });
        if (!res.ok) throw new Error('Failed to load performance report.');
        const data: AnalyticsData = await res.json();
        setAnalytics(data);

        const rankRes = await fetch(`${apiBase}/leaderboards/test/${data.test_id}/me`, { headers });
        if (rankRes.ok) {
          setRankInfo(await rankRes.json());
        }
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error fetching exam report.');
      } finally {
        setLoading(false);
      }
    }
    if (attemptId) fetchData();
  }, [attemptId, apiBase]);

  async function handleDownloadPDF() {
    if (downloadingPdf) return;
    setDownloadingPdf(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('accqudo_token') || '' : '';
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token.trim()}`;
      }

      const res = await fetch(`${apiBase}/analytics/attempt/${attemptId}/pdf`, { headers });

      if (!res.ok) {
        throw new Error('Unable to compile official PDF scorecard.');
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Accqudo_Scorecard_Attempt_${attemptId}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(err.message || 'Error downloading PDF certificate.');
    } finally {
      setDownloadingPdf(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto" />
          <p className="mt-3 text-sm font-medium text-slate-600">Compiling performance diagnostics...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
        <h2 className="text-xl font-bold text-rose-600">Report Unavailable</h2>
        <p className="mt-2 text-sm text-slate-600">{error || 'Attempt data could not be retrieved.'}</p>
        <button
          onClick={() => router.push('/dashboard')}
          className="mt-5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  const reviews = analytics.question_reviews || [];

  const filteredQuestions = reviews.filter((q) => {
    if (selectedFilter === 'CORRECT') return q.is_correct === true;
    if (selectedFilter === 'INCORRECT') return q.is_correct === false;
    if (selectedFilter === 'UNANSWERED') {
      const resp = safeParse(q.student_response);
      return resp === null || resp === undefined || resp === '' || (Array.isArray(resp) && resp.length === 0);
    }
    return true;
  });

  const durationMin = Math.floor((analytics.overall_summary.duration_taken_seconds || 0) / 60);
  const durationSec = (analytics.overall_summary.duration_taken_seconds || 0) % 60;
  const attemptedCount = analytics.overall_summary.correct + analytics.overall_summary.incorrect;
  const accuracyPercent = attemptedCount > 0 ? Math.round((analytics.overall_summary.correct / attemptedCount) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Top Header Card */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl bg-white p-6 border border-slate-200 shadow-sm gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-200">
                Official Result
              </span>
              <span className="text-xs text-slate-400">Attempt #{analytics.attempt_id}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">Candidate Evaluation Report</h1>
            <p className="text-xs text-slate-500">Atomic Snapshot &amp; Answer Review Engine</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleDownloadPDF}
              disabled={downloadingPdf}
              className="rounded-lg border border-indigo-200 bg-indigo-50 px-3.5 py-2 text-xs font-bold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50 transition shadow-sm"
            >
              {downloadingPdf ? 'Generating PDF...' : 'Download Official PDF Scorecard'}
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'analytics' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Performance Analytics
            </button>
            <button
              onClick={() => setActiveTab('solutions')}
              className={`rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                activeTab === 'solutions' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Detailed Solutions ({reviews.length})
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Dashboard
            </button>
          </div>
        </div>

        {activeTab === 'analytics' ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Score</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{analytics.overall_summary.score.toFixed(2)}</p>
                <p className="mt-1 text-[11px] text-emerald-600 font-medium">Atomic Verification Passed</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Rank</p>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {rankInfo?.is_ranked ? `#${rankInfo.rank}` : '--'}
                </p>
                <p className="mt-1 text-[11px] text-indigo-600 font-medium">
                  {rankInfo?.percentile != null ? `${rankInfo.percentile}% Percentile` : 'Rank Pending'}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Accuracy</p>
                <p className="mt-1 text-3xl font-black text-slate-900">{accuracyPercent}%</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {analytics.overall_summary.correct} Correct · {analytics.overall_summary.incorrect} Incorrect
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Time Taken</p>
                <p className="mt-1 text-3xl font-black text-slate-900">
                  {durationMin > 0 ? `${durationMin}m ${durationSec}s` : `${durationSec}s`}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">Session Completed</p>
              </div>
            </div>

            {/* Subject Diagnostics */}
            {analytics.subject_breakdown && analytics.subject_breakdown.length > 0 && (
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Subject Diagnostics</h2>
                <div className="mt-4 space-y-4">
                  {analytics.subject_breakdown.map((s, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex justify-between text-sm font-semibold text-slate-700">
                        <span>{s.subject_name}</span>
                        <span>{s.accuracy_percent}% ({s.marks_obtained} Marks)</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${s.accuracy_percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Topic Breakdown & Weak Areas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Topic Performance</h2>
                <div className="mt-4 divide-y divide-slate-100">
                  {(analytics.topic_breakdown || []).length === 0 ? (
                    <p className="text-xs text-slate-400 py-4">No topic metrics available.</p>
                  ) : (
                    analytics.topic_breakdown!.map((t, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between text-sm">
                        <div>
                          <p className="font-semibold text-slate-800">{t.topic_name}</p>
                          <p className="text-xs text-slate-400">{t.chapter_name || 'General'}</p>
                        </div>
                        <div className="text-right">
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-700">
                            {t.accuracy_percent}%
                          </span>
                          <p className="text-[11px] text-slate-400 mt-0.5">{t.correct}/{t.total_questions} Solved</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-base font-bold text-slate-900">Weak Area Remediation</h2>
                {(analytics.weak_areas || []).length === 0 ? (
                  <div className="mt-6 flex flex-col items-center justify-center text-center p-6 rounded-xl bg-emerald-50 border border-emerald-100">
                    <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-lg">
                      ✓
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-emerald-900">Solid Retention Across All Topics</h3>
                    <p className="text-xs text-emerald-700 mt-1 max-w-xs">
                      No topics scored below 60%. Continue maintaining consistent mock drills.
                    </p>
                  </div>
                ) : (
                  <div className="mt-4 space-y-3">
                    {analytics.weak_areas!.map((w, idx) => (
                      <div key={idx} className="rounded-xl border border-rose-100 bg-rose-50/50 p-4">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-rose-900">{w.topic}</h4>
                          <span className="rounded bg-rose-100 px-2 py-0.5 text-xs font-bold text-rose-700">
                            {w.accuracy}%
                          </span>
                        </div>
                        <p className="text-xs text-rose-700 mt-1">{w.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          /* Solutions & Question Reviews Tab */
          <div className="space-y-4">
            {/* Filter Pills */}
            <div className="flex gap-2">
              {(['ALL', 'CORRECT', 'INCORRECT', 'UNANSWERED'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition-colors ${
                    selectedFilter === filter
                      ? 'bg-slate-900 text-white'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {filteredQuestions.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
                  No questions found matching the selected filter.
                </div>
              ) : (
                filteredQuestions.map((q, idx) => {
                  const targetKey = q.id ?? q.snapshot_id ?? idx;
                  const isCorrect = q.is_correct === true;
                  const isWrong = q.is_correct === false;

                  const parsedEval = safeParse(q.evaluation_data) || {};
                  const parsedStudentResp = safeParse(q.student_response);
                  const parsedOptions: OptionItem[] = safeParse(q.options) || [];
                  const questionContent = normalizeQuestionText(q.question_text);

                  const correctKeysRaw: any =
                    parsedEval.correct_keys ?? parsedEval.correct ?? parsedEval.correct_options ?? [];
                  const correctList: string[] = Array.isArray(correctKeysRaw)
                    ? correctKeysRaw.map((k: any) => String(k).trim().toUpperCase())
                    : [String(correctKeysRaw).trim().toUpperCase()];

                  const studentList: string[] = Array.isArray(parsedStudentResp)
                    ? parsedStudentResp.map((k: any) => String(k).trim().toUpperCase())
                    : parsedStudentResp !== null && parsedStudentResp !== undefined && parsedStudentResp !== ''
                    ? [String(parsedStudentResp).trim().toUpperCase()]
                    : [];

                  return (
                    <div
                      key={targetKey}
                      className={`rounded-2xl border bg-white p-6 shadow-sm transition-all ${
                        isCorrect ? 'border-emerald-200' : isWrong ? 'border-rose-200' : 'border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">Q{q.order}.</span>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                            {q.question_type}
                          </span>
                        </div>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${
                            isCorrect
                              ? 'bg-emerald-100 text-emerald-800'
                              : isWrong
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {isCorrect
                            ? `+${q.marks} Marks`
                            : isWrong
                            ? `-${q.negative_marks} Penalty`
                            : '0.0 Marks (Unattempted)'}
                        </span>
                      </div>

                      {/* Question Text */}
                      <div className="mt-4">
                        <MathRenderer content={questionContent} />
                      </div>

                      {/* Options (MCQ / MSQ) */}
                      {parsedOptions.length > 0 && (
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-2">
                          {parsedOptions.map((opt) => {
                            const optKey = String(opt.id || opt.key || '').trim().toUpperCase();
                            const isOptCorrect = correctList.includes(optKey);
                            const isStudentPicked = studentList.includes(optKey);

                            let borderStyle = 'border-slate-200 bg-white text-slate-700';
                            if (isOptCorrect) {
                              borderStyle = 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-semibold';
                            } else if (isStudentPicked && !isOptCorrect) {
                              borderStyle = 'border-rose-400 bg-rose-50/50 text-rose-950 font-medium';
                            }

                            return (
                              <div
                                key={optKey}
                                className={`flex items-start gap-2 rounded-xl border p-3 text-xs transition-all ${borderStyle}`}
                              >
                                <span className="font-bold">{optKey}.</span>
                                <div className="flex-1">
                                  <MathRenderer content={opt.text} />
                                </div>
                                {isStudentPicked && (
                                  <span
                                    className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
                                      isOptCorrect
                                        ? 'bg-emerald-200 text-emerald-800'
                                        : 'bg-rose-200 text-rose-800'
                                    }`}
                                  >
                                    Your Pick
                                  </span>
                                )}
                                {isOptCorrect && !isStudentPicked && (
                                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                                    Correct
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* NAT Numeric Answers */}
                      {q.question_type === 'NAT' && (
                        <div className="mt-4 rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs flex flex-wrap gap-6">
                          <div>
                            <span className="text-slate-400">Your Answer: </span>
                            <strong className="text-slate-900">
                              {parsedStudentResp !== null && parsedStudentResp !== undefined && parsedStudentResp !== ''
                                ? String(parsedStudentResp)
                                : 'Unanswered'}
                            </strong>
                          </div>
                          <div>
                            <span className="text-slate-400">Accepted Range / Value: </span>
                            <strong className="text-emerald-700">
                              {parsedEval.exact != null
                                ? String(parsedEval.exact)
                                : parsedEval.tolerance_min != null && parsedEval.tolerance_max != null
                                ? `${parsedEval.tolerance_min} to ${parsedEval.tolerance_max}`
                                : parsedEval.range_min != null && parsedEval.range_max != null
                                ? `${parsedEval.range_min} to ${parsedEval.range_max}`
                                : '--'}
                            </strong>
                          </div>
                        </div>
                      )}

                      {/* Step-by-Step KaTeX Solution */}
                      {q.solution_text && (
                        <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/30 p-4">
                          <p className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                            Step-by-Step Solution
                          </p>
                          <div className="mt-2 text-xs text-slate-800 leading-relaxed">
                            <MathRenderer content={q.solution_text} />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}