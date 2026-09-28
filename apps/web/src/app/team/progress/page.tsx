'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Download,
  FileText,
  Lock,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';

type PeriodKey = '1m' | '3m' | '6m' | '1y' | 'all';
type SortKey =
  | 'questions_created'
  | 'papers_assembled'
  | 'questions_added_to_papers'
  | 'package_paper_links';

interface StaffMember {
  id: number;
  full_name: string | null;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
  questions_created: number;
  topics_created: number;
  chapters_created: number;
  subjects_created: number;
  papers_assembled: number;
  questions_added_to_papers: number;
  package_paper_links: number;
  packages_linked: number;
  question_share_percent: number;
  paper_share_percent: number;
  question_addition_share_percent: number;
  package_link_share_percent: number;
}

interface SalesPackage {
  package_id: number;
  package_title: string;
  exam_id: number | null;
  is_active: boolean;
  price_inr: number;
  sales: number;
  revenue: number;
  unique_buyers: number;
  subscriptions: number;
  active_subscriptions: number;
}

interface Sale {
  id: number;
  user_id: number | null;
  student_name: string | null;
  student_email: string | null;
  package_id: number;
  package_title: string;
  amount_inr: number;
  status: string;
  order_id: string | null;
  payment_id: string | null;
  created_at: string | null;
}

interface DashboardData {
  period: {
    key: PeriodKey;
    label: string;
    start_date: string | null;
    end_date: string;
  };
  staff: StaffMember[];
  team_totals: {
    questions_created: number;
    topics_created: number;
    chapters_created: number;
    subjects_created: number;
    papers_assembled: number;
    questions_added_to_papers: number;
    package_paper_links: number;
    packages_linked: number;
  };
  monthly_activity: Array<{
    month: string;
    questions: number;
    topics: number;
    chapters: number;
    subjects: number;
    papers: number;
    question_additions: number;
    package_links: number;
  }>;
  sales: {
    source: 'current' | 'legacy';
    summary: {
      revenue: number;
      successful_sales: number;
      unique_buyers: number;
      packages_with_sales: number;
      subscriptions: number;
      active_subscriptions: number;
    };
    packages: SalesPackage[];
    monthly: Array<{
      month: string;
      sales: number;
      revenue: number;
    }>;
    recent_sales: Sale[];
  };
}

interface MemberDetail {
  period: {
    key: PeriodKey;
    label: string;
    start_date: string | null;
    end_date: string;
  };
  member: StaffMember;
  summary: {
    questions_created: number;
    topics_created: number;
    chapters_created: number;
    subjects_created: number;
    papers_assembled: number;
    questions_added_to_papers: number;
    package_paper_links: number;
    packages_linked: number;
  };
  questions: Array<{
    question_id: number;
    question_type: string | null;
    topic: { id: number; name: string };
    chapter: { id: number; name: string };
    subject: { id: number; name: string };
    exam: { id: number | null; title: string | null; code: string | null };
    created_at: string | null;
  }>;
  papers: Array<{
    id: number;
    title: string;
    exam_id: number | null;
    exam_title: string | null;
    exam_code: string | null;
    duration_minutes: number | null;
    total_marks: number | null;
    total_questions: number;
    questions_added_by_me: number;
    created_at: string | null;
  }>;
  collaborative_paper_additions: Array<{
    test_question_id: number;
    test_id: number;
    test_title: string | null;
    question_id: number;
    order: number | null;
    marks: number | null;
    negative_marks: number | null;
    topic: { id: number; name: string };
    chapter: { id: number; name: string };
    subject: { id: number; name: string };
    period_filter_applied: boolean;
  }>;
  package_links: Array<{
    package_id: number;
    package_title: string | null;
    test_id: number;
    test_title: string | null;
    exam_id: number | null;
    created_by: number;
    period_filter_applied: boolean;
  }>;
  academic_breakdown: Array<{
    id: number | null;
    title: string;
    code: string | null;
    contributed_questions: number;
    total_questions: number;
    contribution_percent: number;
    subjects: Array<{
      id: number;
      name: string;
      contributed_questions: number;
      total_questions: number;
      contribution_percent: number;
      chapters: Array<{
        id: number;
        name: string;
        contributed_questions: number;
        total_questions: number;
        contribution_percent: number;
        topics: Array<{
          id: number;
          name: string;
          contributed_questions: number;
          total_questions: number;
          contribution_percent: number;
        }>;
      }>;
    }>;
  }>;
  question_breakdown: {
    by_type: Array<{ label: string; count: number }>;
    by_exam: Array<{ label: string; count: number }>;
    by_subject: Array<{ label: string; count: number }>;
    by_chapter: Array<{ label: string; count: number }>;
    by_topic: Array<{ label: string; count: number }>;
  };
  package_contributions: Array<{
    package_id: number;
    package_title: string;
    exam_id: number | null;
    total_questions: number;
    contributed_questions: number;
    contribution_percent: number;
    papers: Array<{
      test_id: number;
      total_questions: number;
      contributed_questions: number;
      contribution_percent: number;
    }>;
  }>;
  scope: {
    questions_and_papers: string;
    test_question_additions: string;
    package_test_links: string;
    note?: string;
  };
  team_totals: DashboardData['team_totals'];
  generated_at?: string;
}

const PERIODS: Array<{ key: PeriodKey; label: string }> = [
  { key: '1m', label: '1 Month' },
  { key: '3m', label: '3 Months' },
  { key: '6m', label: '6 Months' },
  { key: '1y', label: '1 Year' },
  { key: 'all', label: 'Full Time' },
];

const SORT_OPTIONS: Array<{ key: SortKey; label: string }> = [
  { key: 'questions_created', label: 'Questions' },
  { key: 'papers_assembled', label: 'Papers' },
  { key: 'questions_added_to_papers', label: 'Paper additions' },
  { key: 'package_paper_links', label: 'Package links' },
];

const number = (value: number | null | undefined) =>
  new Intl.NumberFormat('en-IN').format(Number(value || 0));

const money = (value: number | null | undefined) =>
  `₹${new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(Number(value || 0))}`;

const dateTime = (value: string | null | undefined) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const roleLabel = (role: string) =>
  String(role || '').replace(/_/g, ' ').toUpperCase();

const safeName = (value: string | null | undefined, fallback = '—') =>
  value?.trim() ? value : fallback;

export default function TeamProgressPage() {
  const router = useRouter();

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1'
  ).replace(/\/$/, '');

  const [period, setPeriod] = useState<PeriodKey>('3m');
  const [data, setData] = useState<DashboardData | null>(null);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberDetail, setMemberDetail] = useState<MemberDetail | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>('questions_created');
  const [salesSort, setSalesSort] = useState<'revenue' | 'sales' | 'buyers'>('revenue');
  const [activeTab, setActiveTab] = useState<'team' | 'sales'>('team');
  const [loading, setLoading] = useState(true);
  const [loadingMember, setLoadingMember] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState('');

  const getToken = () =>
    localStorage.getItem('accqudo_token') || localStorage.getItem('token');

  const fetchDashboard = async (selectedPeriod = period) => {
    const token = getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `${apiBase}/team/progress/dashboard?period=${encodeURIComponent(
          selectedPeriod,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      );

      if (response.status === 401) {
        localStorage.removeItem('accqudo_token');
        localStorage.removeItem('token');
        localStorage.removeItem('accqudo_user');
        router.replace('/login');
        return;
      }

      if (response.status === 401) {
        localStorage.removeItem('accqudo_token');
        localStorage.removeItem('token');
        localStorage.removeItem('accqudo_user');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        router.replace('/team');
        return;
      }

      if (!response.ok) {
        throw new Error(`Progress API returned ${response.status}`);
      }

      const payload = (await response.json()) as DashboardData;
      setData(payload);

      if (
        selectedMemberId !== null &&
        !payload.staff.some((member) => member.id === selectedMemberId)
      ) {
        setSelectedMemberId(null);
        setMemberDetail(null);
      }
    } catch (err) {
      console.error(err);
      setError('Unable to load team progress data.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberDetail = async (memberId: number) => {
    const token = getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    setLoadingMember(true);

    try {
      const response = await fetch(
        `${apiBase}/team/progress/report/member/${memberId}?period=${encodeURIComponent(
          period,
        )}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        },
      );

      if (response.status === 403) {
        router.replace('/team');
        return;
      }

      if (!response.ok) {
        throw new Error(`Member report returned ${response.status}`);
      }

      setMemberDetail((await response.json()) as MemberDetail);
    } catch (err) {
      console.error(err);
      setMemberDetail(null);
    } finally {
      setLoadingMember(false);
    }
  };

  useEffect(() => {
    void fetchDashboard(period);
    // The page intentionally loads once per selected period.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const sortedStaff = useMemo(() => {
    if (!data) return [];

    return [...data.staff].sort((a, b) => {
      const value = Number(b[sortKey] || 0) - Number(a[sortKey] || 0);
      if (value !== 0) return value;
      return String(a.full_name || a.email).localeCompare(
        String(b.full_name || b.email),
      );
    });
  }, [data, sortKey]);

  const sortedSalesPackages = useMemo(() => {
    if (!data) return [];

    return [...data.sales.packages].sort((a, b) => {
      if (salesSort === 'sales') return b.sales - a.sales;
      if (salesSort === 'buyers') return b.unique_buyers - a.unique_buyers;
      return b.revenue - a.revenue;
    });
  }, [data, salesSort]);

  const maxMonthlyQuestions = useMemo(() => {
    if (!data || data.monthly_activity.length === 0) return 1;
    return Math.max(
      1,
      ...data.monthly_activity.map((item) => item.questions),
    );
  }, [data]);

  const selectMember = (memberId: number) => {
    setSelectedMemberId(memberId);
    void fetchMemberDetail(memberId);
  };

  const downloadUrl = async (url: string, filenameFallback: string) => {
    const token = getToken();

    if (!token) {
      router.replace('/login');
      return;
    }

    try {
      setDownloading(
        filenameFallback.includes('staff_')
          ? `staff_${filenameFallback.split('_')[2]}`
          : filenameFallback,
      );

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: '*/*',
        },
      });

      if (response.status === 401) {
        localStorage.removeItem('accqudo_token');
        localStorage.removeItem('token');
        localStorage.removeItem('accqudo_user');
        router.replace('/login');
        return;
      }

      if (response.status === 403) {
        router.replace('/team');
        return;
      }

      if (!response.ok) {
        throw new Error(`Download returned ${response.status}`);
      }

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filenameFallback;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch (err) {
      console.error(err);
      setError('The report could not be downloaded.');
    } finally {
      setDownloading('');
    }
  };

  const downloadMember = (memberId: number) =>
    downloadUrl(
      `${apiBase}/team/progress/report/member/${memberId}/download?period=${period}`,
      `accqudo_staff_${memberId}_${period}_contribution_report.pdf`,
    );

  const downloadSales = () =>
    downloadUrl(
      `${apiBase}/team/progress/report/sales/download?period=${period}`,
      `accqudo_package_sales_${period}.csv`,
    );

  const downloadPackageSummary = () =>
    downloadUrl(
      `${apiBase}/team/progress/report/sales/packages/download?period=${period}`,
      `accqudo_package_summary_${period}.csv`,
    );

  const selectedMember = data?.staff.find(
    (member) => member.id === selectedMemberId,
  );

  const handlePeriodChange = (nextPeriod: PeriodKey) => {
    setPeriod(nextPeriod);
    setMemberDetail(null);
  };

  if (loading && !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F3]">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#1F3A5C]/20 border-t-[#1F3A5C]" />
          <p className="mt-4 font-mono text-xs font-semibold text-stone-500">
            Loading Super Admin Progress Intelligence...
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] px-4 py-10">
        <div className="mx-auto max-w-4xl rounded-2xl border border-rose-200 bg-white p-8 text-center">
          <Lock className="mx-auto h-8 w-8 text-rose-600" />
          <h1 className="mt-4 font-serif text-2xl font-bold text-[#16293F]">
            Progress data unavailable
          </h1>
          <p className="mt-2 text-sm text-stone-500">{error}</p>
          <button
            type="button"
            onClick={() => router.push('/team')}
            className="mt-6 rounded-lg bg-[#1F3A5C] px-4 py-2 text-xs font-bold text-white"
          >
            Back to Team Portal
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#FAF8F3] px-4 py-8 font-sans text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <header className="rounded-2xl border border-stone-200 border-t-4 border-t-[#1F3A5C] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => router.push('/team')}
                className="mb-3 flex items-center gap-1 text-xs font-bold text-stone-500 hover:text-[#1F3A5C]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Team Portal
              </button>

              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                  Super Admin Only
                </span>
                <span className="rounded bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold text-stone-600">
                  {data.period.label}
                </span>
              </div>

              <h1 className="mt-2 font-serif text-3xl font-bold text-[#16293F]">
                Team Progress &amp; Intelligence
              </h1>
              <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone-500">
                Review staff activity, contribution volume, paper work,
                package links, sales, revenue, and downloadable reports.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {PERIODS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handlePeriodChange(item.key)}
                  className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                    period === item.key
                      ? 'border-[#1F3A5C] bg-[#1F3A5C] text-white'
                      : 'border-stone-200 bg-white text-stone-600 hover:border-[#1F3A5C]'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              <button
                type="button"
                onClick={() => void fetchDashboard(period)}
                disabled={loading}
                className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
            </div>
          </div>
        </header>

        {error ? (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-semibold text-amber-800">
            {error}
          </div>
        ) : null}

        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <MetricCard
            icon={<BookOpen className="h-5 w-5" />}
            label="Questions"
            value={number(data.team_totals.questions_created)}
            detail="Created by staff"
          />
          <MetricCard
            icon={<BarChart3 className="h-5 w-5" />}
            label="Papers"
            value={number(data.team_totals.papers_assembled)}
            detail="Tests assembled"
          />
          <MetricCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Paper Additions"
            value={number(data.team_totals.questions_added_to_papers)}
            detail="Questions added"
          />
          <MetricCard
            icon={<Package className="h-5 w-5" />}
            label="Package Links"
            value={number(data.team_totals.package_paper_links)}
            detail="Package ↔ paper links"
          />
        </section>

        <div className="flex overflow-hidden rounded-xl border border-stone-200 bg-white">
          <button
            type="button"
            onClick={() => setActiveTab('team')}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-bold ${
              activeTab === 'team'
                ? 'bg-[#1F3A5C] text-white'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Users className="h-4 w-4" />
            Team Contributions
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sales')}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-3 text-xs font-bold ${
              activeTab === 'sales'
                ? 'bg-[#1F3A5C] text-white'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <ShoppingBag className="h-4 w-4" />
            Package Sales
          </button>
        </div>

        {activeTab === 'team' ? (
          <>
            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-stone-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#16293F]">
                    Staff Contribution
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Contribution shares are calculated against the selected
                    period&apos;s total staff activity. Paper additions and package
                    links are lifetime counts because those relationship records
                    do not carry a creation timestamp.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase text-stone-400">
                    Sort
                  </span>
                  <select
                    value={sortKey}
                    onChange={(event) => setSortKey(event.target.value as SortKey)}
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700 outline-none"
                  >
                    {SORT_OPTIONS.map((option) => (
                      <option key={option.key} value={option.key}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[950px] text-left">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Team member</th>
                      <th className="px-4 py-3">Questions</th>
                      <th className="px-4 py-3">Topics</th>
                      <th className="px-4 py-3">Papers</th>
                      <th className="px-4 py-3">Paper additions</th>
                      <th className="px-4 py-3">Package links</th>
                      <th className="px-4 py-3">Question share</th>
                      <th className="px-5 py-3">Report</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sortedStaff.map((member) => (
                      <tr
                        key={member.id}
                        className={`cursor-pointer transition hover:bg-stone-50 ${
                          selectedMemberId === member.id ? 'bg-emerald-50/50' : ''
                        }`}
                        onClick={() => selectMember(member.id)}
                      >
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#16293F]">
                            {member.full_name || 'Unnamed staff'}
                          </div>
                          <div className="mt-0.5 text-[10px] text-stone-400">
                            {member.email}
                          </div>
                          <span className="mt-1 inline-flex rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold text-stone-600">
                            {roleLabel(member.role)}
                          </span>
                        </td>
                        <td className="px-4 py-4 font-bold text-[#1F3A5C]">
                          {number(member.questions_created)}
                        </td>
                        <td className="px-4 py-4">{number(member.topics_created)}</td>
                        <td className="px-4 py-4">{number(member.papers_assembled)}</td>
                        <td className="px-4 py-4">
                          {number(member.questions_added_to_papers)}
                        </td>
                        <td className="px-4 py-4">
                          {number(member.package_paper_links)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="min-w-[120px]">
                            <div className="flex justify-between text-[10px] font-bold">
                              <span>{member.question_share_percent.toFixed(1)}%</span>
                              <span className="text-stone-400">
                                {number(data.team_totals.questions_created)}
                              </span>
                            </div>
                            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                              <div
                                className="h-full rounded-full bg-[#1F3A5C]"
                                style={{
                                  width: `${Math.min(
                                    100,
                                    member.question_share_percent,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              void downloadMember(member.id);
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-2.5 py-2 text-[10px] font-bold text-stone-600 hover:border-[#1F3A5C] hover:text-[#1F3A5C]"
                          >
                            <Download className="h-3.5 w-3.5" />
                            {downloading.includes(`staff_${member.id}`)
                              ? 'Downloading'
                              : 'PDF'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#16293F]">
                      Monthly Team Activity
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Questions created by staff per month.
                    </p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                </div>

                <div className="mt-6 space-y-4">
                  {data.monthly_activity.length === 0 ? (
                    <p className="py-8 text-center text-xs text-stone-400">
                      No activity in this period.
                    </p>
                  ) : (
                    data.monthly_activity.map((item) => (
                      <div key={item.month}>
                        <div className="mb-1 flex justify-between text-[10px] font-bold">
                          <span>{item.month}</span>
                          <span>{number(item.questions)} questions</span>
                        </div>
                        <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-[#1F3A5C]"
                            style={{
                              width: `${Math.max(
                                2,
                                (item.questions / maxMonthlyQuestions) * 100,
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="mt-1 flex gap-4 text-[9px] text-stone-400">
                          <span>{number(item.papers)} papers</span>
                          <span>{number(item.question_additions)} additions</span>
                          <span>{number(item.package_links)} package links</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="font-serif text-xl font-bold text-[#16293F]">
                      Selected Member — Full Contribution
                    </h2>
                    <p className="mt-1 text-xs text-stone-500">
                      Inspect exactly where the selected person contributed: academic hierarchy, papers, collaborative additions, and package links.
                    </p>
                  </div>
                  <Users className="h-5 w-5 shrink-0 text-[#1F3A5C]" />
                </div>

                {!selectedMember ? (
                  <div className="mt-8 rounded-xl border border-dashed border-stone-200 p-8 text-center text-xs text-stone-400">
                    Click a team member to open their complete contribution report.
                  </div>
                ) : (
                  <div className="mt-5">
                    <div className="rounded-xl bg-stone-50 p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="font-semibold text-[#16293F]">
                            {selectedMember.full_name || selectedMember.email}
                          </div>
                          <div className="mt-1 text-[10px] text-stone-500">
                            {selectedMember.email} · {roleLabel(selectedMember.role)} · Staff #{selectedMember.id}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => void downloadMember(selectedMember.id)}
                          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1F3A5C] px-3 py-2.5 text-[10px] font-bold text-white hover:opacity-90"
                        >
                          <FileText className="h-3.5 w-3.5" />
                          {downloading.includes(`staff_${selectedMember.id}`) ? 'Generating PDF…' : 'Download Official PDF'}
                        </button>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        <MiniStat label="Questions" value={selectedMember.questions_created} />
                        <MiniStat label="Papers" value={selectedMember.papers_assembled} />
                        <MiniStat label="Additions" value={selectedMember.questions_added_to_papers} />
                        <MiniStat label="Package links" value={selectedMember.package_paper_links} />
                        <MiniStat label="Topics" value={selectedMember.topics_created} />
                        <MiniStat label="Chapters" value={selectedMember.chapters_created} />
                        <MiniStat label="Subjects" value={selectedMember.subjects_created} />
                        <MiniStat label="Packages" value={selectedMember.packages_linked} />
                      </div>
                    </div>

                    {loadingMember ? (
                      <div className="py-10 text-center text-xs text-stone-400">
                        Loading complete member contribution details…
                      </div>
                    ) : memberDetail ? (
                      <div className="mt-5 space-y-5">
                        <div className="grid gap-4 lg:grid-cols-2">
                          <BreakdownCard title="Question types" items={memberDetail.question_breakdown.by_type} />
                          <BreakdownCard title="Questions by subject" items={memberDetail.question_breakdown.by_subject} />
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white">
                          <div className="border-b border-stone-100 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Academic contribution</div>
                            <div className="mt-1 text-[10px] text-stone-400">
                              Member questions versus contributor-attributed questions in the same topic and selected period.
                            </div>
                          </div>
                          <div className="max-h-[620px] overflow-auto p-3">
                            {memberDetail.academic_breakdown.length === 0 ? (
                              <p className="py-8 text-center text-xs text-stone-400">No academic contribution in this period.</p>
                            ) : (
                              <div className="space-y-4">
                                {memberDetail.academic_breakdown.map((exam) => (
                                  <div key={`${exam.id ?? 'none'}-${exam.title}`} className="rounded-xl border border-stone-100">
                                    <div className="flex flex-col gap-2 bg-stone-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                      <div>
                                        <div className="text-sm font-bold text-[#16293F]">{exam.title}</div>
                                        <div className="mt-0.5 text-[9px] text-stone-400">
                                          {exam.code || 'No exam code'} · {number(exam.contributed_questions)} contributed / {number(exam.total_questions)} contributor-attributed questions
                                        </div>
                                      </div>
                                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                                        {exam.contribution_percent.toFixed(1)}%
                                      </span>
                                    </div>

                                    <div className="overflow-x-auto">
                                      <table className="w-full min-w-[760px] text-left">
                                        <thead className="text-[9px] uppercase tracking-wide text-stone-400">
                                          <tr>
                                            <th className="px-4 py-2">Subject</th>
                                            <th className="px-4 py-2">Chapter</th>
                                            <th className="px-4 py-2">Topic</th>
                                            <th className="px-4 py-2">Mine</th>
                                            <th className="px-4 py-2">Total</th>
                                            <th className="px-4 py-2">Share</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-stone-100">
                                          {exam.subjects.flatMap((subject) =>
                                            subject.chapters.flatMap((chapter) =>
                                              chapter.topics.map((topic) => (
                                                <tr key={`${subject.id}-${chapter.id}-${topic.id}`} className="hover:bg-stone-50">
                                                  <td className="px-4 py-2 text-[10px] font-semibold text-stone-700">{subject.name}</td>
                                                  <td className="px-4 py-2 text-[10px] text-stone-600">{chapter.name}</td>
                                                  <td className="px-4 py-2 text-[10px] text-stone-600">{topic.name}</td>
                                                  <td className="px-4 py-2 text-[10px] font-bold text-[#1F3A5C]">{number(topic.contributed_questions)}</td>
                                                  <td className="px-4 py-2 text-[10px] text-stone-500">{number(topic.total_questions)}</td>
                                                  <td className="px-4 py-2">
                                                    <div className="flex min-w-[100px] items-center gap-2">
                                                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-stone-100">
                                                        <div className="h-full rounded-full bg-[#1F3A5C]" style={{ width: `${Math.min(100, topic.contribution_percent)}%` }} />
                                                      </div>
                                                      <span className="text-[9px] font-bold text-stone-600">{topic.contribution_percent.toFixed(1)}%</span>
                                                    </div>
                                                  </td>
                                                </tr>
                                              )),
                                            ),
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white">
                          <div className="border-b border-stone-100 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Papers assembled</div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[780px] text-left">
                              <thead className="bg-stone-50 text-[9px] uppercase tracking-wide text-stone-400">
                                <tr>
                                  <th className="px-4 py-2">Paper</th>
                                  <th className="px-4 py-2">Exam</th>
                                  <th className="px-4 py-2">Questions</th>
                                  <th className="px-4 py-2">Added by member</th>
                                  <th className="px-4 py-2">Marks</th>
                                  <th className="px-4 py-2">Created</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {memberDetail.papers.map((paper) => (
                                  <tr key={paper.id}>
                                    <td className="px-4 py-3 text-[10px] font-semibold text-[#16293F]">{safeName(paper.title, `Paper #${paper.id}`)}</td>
                                    <td className="px-4 py-3 text-[10px] text-stone-500">{safeName(paper.exam_title)}</td>
                                    <td className="px-4 py-3 text-[10px]">{number(paper.total_questions)}</td>
                                    <td className="px-4 py-3 text-[10px] font-bold text-emerald-700">{number(paper.questions_added_by_me)}</td>
                                    <td className="px-4 py-3 text-[10px]">{paper.total_marks ?? '—'}</td>
                                    <td className="px-4 py-3 text-[9px] text-stone-400">{dateTime(paper.created_at)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {memberDetail.papers.length === 0 ? <p className="p-6 text-center text-xs text-stone-400">No papers in this period.</p> : null}
                        </div>

                        <div className="grid gap-5 lg:grid-cols-2">
                          <div className="rounded-xl border border-stone-200 bg-white">
                            <div className="border-b border-stone-100 px-4 py-3">
                              <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Collaborative paper additions</div>
                              <div className="mt-1 text-[9px] text-stone-400">Lifetime relationship count — no creation timestamp is available.</div>
                            </div>
                            <div className="max-h-[420px] overflow-auto p-3">
                              {memberDetail.collaborative_paper_additions.length === 0 ? (
                                <p className="py-6 text-center text-xs text-stone-400">No additions found.</p>
                              ) : (
                                <div className="space-y-2">
                                  {memberDetail.collaborative_paper_additions.map((addition) => (
                                    <div key={addition.test_question_id} className="rounded-lg border border-stone-100 p-3">
                                      <div className="flex items-start justify-between gap-3">
                                        <div>
                                          <div className="text-xs font-semibold text-[#16293F]">{safeName(addition.test_title, `Paper #${addition.test_id}`)}</div>
                                          <div className="mt-1 text-[9px] text-stone-500">Question #{addition.question_id} · {safeName(addition.subject?.name)} · {safeName(addition.chapter?.name)} · {safeName(addition.topic?.name)}</div>
                                        </div>
                                        <span className="rounded bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">Added</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="rounded-xl border border-stone-200 bg-white">
                            <div className="border-b border-stone-100 px-4 py-3">
                              <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Package contribution</div>
                              <div className="mt-1 text-[9px] text-stone-400">Shows how much of each linked paper is made up of questions authored by this member.</div>
                            </div>
                            <div className="max-h-[420px] overflow-auto p-3">
                              {memberDetail.package_contributions.length === 0 ? (
                                <p className="py-6 text-center text-xs text-stone-400">No package contribution found.</p>
                              ) : (
                                <div className="space-y-3">
                                  {memberDetail.package_contributions.map((pkg) => (
                                    <div key={pkg.package_id} className="rounded-lg border border-stone-100 p-3">
                                      <div className="flex items-center justify-between gap-3">
                                        <div className="text-xs font-semibold text-[#16293F]">{safeName(pkg.package_title, `Package #${pkg.package_id}`)}</div>
                                        <span className="text-[10px] font-bold text-emerald-700">{pkg.contribution_percent.toFixed(1)}%</span>
                                      </div>
                                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100">
                                        <div className="h-full rounded-full bg-emerald-600" style={{ width: `${Math.min(100, pkg.contribution_percent)}%` }} />
                                      </div>
                                      <div className="mt-2 text-[9px] text-stone-500">{number(pkg.contributed_questions)} contributed / {number(pkg.total_questions)} total questions</div>
                                      <div className="mt-2 space-y-1">
                                        {pkg.papers.map((paper) => (
                                          <div key={paper.test_id} className="flex items-center justify-between text-[9px] text-stone-500">
                                            <span>Paper #{paper.test_id}</span>
                                            <span>{number(paper.contributed_questions)} / {number(paper.total_questions)} · {paper.contribution_percent.toFixed(1)}%</span>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white">
                          <div className="border-b border-stone-100 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Package ↔ paper links</div>
                            <div className="mt-1 text-[9px] text-stone-400">Lifetime/current relationship records created by this member.</div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[650px] text-left">
                              <thead className="bg-stone-50 text-[9px] uppercase tracking-wide text-stone-400">
                                <tr>
                                  <th className="px-4 py-2">Package</th>
                                  <th className="px-4 py-2">Package ID</th>
                                  <th className="px-4 py-2">Paper</th>
                                  <th className="px-4 py-2">Paper ID</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-100">
                                {memberDetail.package_links.map((link) => (
                                  <tr key={`${link.package_id}-${link.test_id}`}>
                                    <td className="px-4 py-3 text-[10px] font-semibold text-[#16293F]">{safeName(link.package_title, `Package #${link.package_id}`)}</td>
                                    <td className="px-4 py-3 text-[10px]">#{link.package_id}</td>
                                    <td className="px-4 py-3 text-[10px] text-stone-600">{safeName(link.test_title, `Paper #${link.test_id}`)}</td>
                                    <td className="px-4 py-3 text-[10px]">#{link.test_id}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                          {memberDetail.package_links.length === 0 ? <p className="p-6 text-center text-xs text-stone-400">No package links found.</p> : null}
                        </div>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                          <div className="text-[10px] font-bold uppercase tracking-wide text-amber-800">Attribution scope</div>
                          <p className="mt-1 text-[10px] leading-relaxed text-amber-900/80">
                            {memberDetail.scope.note || 'Question and paper creation use the selected period. Paper additions and package links are lifetime/current because their relationship tables do not expose a creation timestamp.'}
                          </p>
                        </div>

                        <div className="rounded-xl border border-stone-200 bg-white">
                          <div className="border-b border-stone-100 px-4 py-3">
                            <div className="text-xs font-bold uppercase tracking-wide text-stone-500">Recent authored questions</div>
                            <div className="mt-1 text-[9px] text-stone-400">The official PDF includes the complete question register; this panel shows the latest records for quick review.</div>
                          </div>
                          <div className="max-h-80 space-y-2 overflow-y-auto p-3">
                            {(memberDetail.questions || []).slice(0, 40).map((question) => (
                              <div key={question.question_id} className="rounded-lg border border-stone-100 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <span className="text-[10px] font-bold text-[#1F3A5C]">Question #{question.question_id}</span>
                                  <span className="rounded bg-stone-100 px-1.5 py-0.5 text-[9px] font-bold text-stone-500">{safeName(question.question_type, 'Question')}</span>
                                </div>
                                <div className="mt-1 text-xs font-semibold text-stone-700">{safeName(question.topic?.name)}</div>
                                <div className="mt-0.5 text-[10px] text-stone-400">{safeName(question.chapter?.name)} · {safeName(question.subject?.name)}</div>
                                {question.exam?.title ? <div className="mt-1 text-[9px] text-stone-400">Exam: {question.exam.title}{question.exam.code ? ` (${question.exam.code})` : ''}</div> : null}
                                <div className="mt-1 text-[9px] text-stone-400">{dateTime(question.created_at)}</div>
                              </div>
                            ))}
                            {memberDetail.questions.length === 0 ? <p className="py-6 text-center text-xs text-stone-400">No authored questions in this period.</p> : null}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="py-8 text-center text-xs text-stone-400">Select a member to load their contribution details.</div>
                    )}
                  </div>
                )}
              </div>
            </section>
          </>
        ) : (
          <>
            <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <MetricCard
                icon={<WalletCards className="h-5 w-5" />}
                label="Revenue"
                value={money(data.sales.summary.revenue)}
                detail={data.sales.source === 'current' ? 'Current payments' : 'Legacy orders'}
              />
              <MetricCard
                icon={<ShoppingBag className="h-5 w-5" />}
                label="Successful Sales"
                value={number(data.sales.summary.successful_sales)}
                detail="Selected period"
              />
              <MetricCard
                icon={<Users className="h-5 w-5" />}
                label="Unique Buyers"
                value={number(data.sales.summary.unique_buyers)}
                detail="Selected period"
              />
              <MetricCard
                icon={<CheckCircle2 className="h-5 w-5" />}
                label="Active Subscriptions"
                value={number(data.sales.summary.active_subscriptions)}
                detail="Subscription records"
              />
            </section>

            <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-stone-100 p-5 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="font-serif text-xl font-bold text-[#16293F]">
                    Package Sales Performance
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Sales and revenue use the active payment source; subscription
                    figures use available subscription records and safely fall
                    back to successful payment users when subscription timestamps
                    are unavailable.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={salesSort}
                    onChange={(event) =>
                      setSalesSort(
                        event.target.value as 'revenue' | 'sales' | 'buyers',
                      )
                    }
                    className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-semibold text-stone-700"
                  >
                    <option value="revenue">Sort by revenue</option>
                    <option value="sales">Sort by sales</option>
                    <option value="buyers">Sort by buyers</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => void downloadPackageSummary()}
                    className="flex items-center gap-1.5 rounded-lg border border-stone-200 bg-white px-3 py-2 text-xs font-bold text-stone-600 hover:border-[#1F3A5C] hover:text-[#1F3A5C]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Package Summary
                  </button>

                  <button
                    type="button"
                    onClick={() => void downloadSales()}
                    className="flex items-center gap-1.5 rounded-lg bg-[#1F3A5C] px-3 py-2 text-xs font-bold text-white hover:opacity-90"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download Sales CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-left">
                  <thead className="bg-stone-50 text-[10px] uppercase tracking-wide text-stone-500">
                    <tr>
                      <th className="px-5 py-3">Package</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Sales</th>
                      <th className="px-4 py-3">Revenue</th>
                      <th className="px-4 py-3">Buyers</th>
                      <th className="px-4 py-3">Subscriptions</th>
                      <th className="px-5 py-3">Active</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {sortedSalesPackages.map((item) => (
                      <tr key={item.package_id} className="hover:bg-stone-50">
                        <td className="px-5 py-4">
                          <div className="font-semibold text-[#16293F]">
                            {item.package_title}
                          </div>
                          <div className="mt-0.5 text-[9px] text-stone-400">
                            Package #{item.package_id}
                          </div>
                        </td>
                        <td className="px-4 py-4">{money(item.price_inr)}</td>
                        <td className="px-4 py-4 font-bold">{number(item.sales)}</td>
                        <td className="px-4 py-4 font-bold text-emerald-700">
                          {money(item.revenue)}
                        </td>
                        <td className="px-4 py-4">{number(item.unique_buyers)}</td>
                        <td className="px-4 py-4">{number(item.subscriptions)}</td>
                        <td className="px-5 py-4">{number(item.active_subscriptions)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
                <h2 className="font-serif text-xl font-bold text-[#16293F]">
                  Revenue Trend
                </h2>
                <p className="mt-1 text-xs text-stone-500">
                  Successful package sales by month.
                </p>

                <div className="mt-5 space-y-4">
                  {data.sales.monthly.length === 0 ? (
                    <p className="py-8 text-center text-xs text-stone-400">
                      No successful sales in this period.
                    </p>
                  ) : (
                    data.sales.monthly.map((item) => {
                      const maxRevenue = Math.max(
                        1,
                        ...data.sales.monthly.map((entry) => entry.revenue),
                      );
                      return (
                        <div key={item.month}>
                          <div className="mb-1 flex justify-between text-[10px] font-bold">
                            <span>{item.month}</span>
                            <span>{money(item.revenue)}</span>
                          </div>
                          <div className="h-3 overflow-hidden rounded-full bg-stone-100">
                            <div
                              className="h-full rounded-full bg-emerald-600"
                              style={{
                                width: `${Math.max(
                                  2,
                                  (item.revenue / maxRevenue) * 100,
                                )}%`,
                              }}
                            />
                          </div>
                          <div className="mt-1 text-[9px] text-stone-400">
                            {number(item.sales)} successful sale(s)
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-100 p-5">
                  <h2 className="font-serif text-xl font-bold text-[#16293F]">
                    Recent Sales
                  </h2>
                  <p className="mt-1 text-xs text-stone-500">
                    Successful package payments in the selected range.
                  </p>
                </div>

                <div className="max-h-[500px] overflow-auto">
                  {data.sales.recent_sales.length === 0 ? (
                    <p className="p-8 text-center text-xs text-stone-400">
                      No sales found.
                    </p>
                  ) : (
                    <div className="divide-y divide-stone-100">
                      {data.sales.recent_sales.map((sale) => (
                        <div
                          key={sale.id}
                          className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div>
                            <div className="text-xs font-bold text-[#16293F]">
                              {sale.package_title}
                            </div>
                            <div className="mt-0.5 text-[10px] text-stone-500">
                              {sale.student_name || 'Student'} ·{' '}
                              {sale.student_email || 'No email'}
                            </div>
                            <div className="mt-1 text-[9px] text-stone-400">
                              {dateTime(sale.created_at)}
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <div className="font-bold text-emerald-700">
                              {money(sale.amount_inr)}
                            </div>
                            <div className="mt-0.5 text-[9px] font-bold text-stone-400">
                              {sale.status}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          </>
        )}

        <footer className="pb-6 text-center text-[10px] text-stone-400">
          Progress and sales data are restricted to Super Admins. Generated
          {data.period.start_date
            ? ` from ${dateTime(data.period.start_date)}`
            : ' for full-time history'}{' '}
          through {dateTime(data.period.end_date)}.
        </footer>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F3A5C]/10 text-[#1F3A5C]">
          {icon}
        </div>
      </div>
      <div className="mt-3 text-[9px] font-bold uppercase tracking-wide text-stone-400">
        {label}
      </div>
      <div className="mt-1 truncate text-xl font-bold text-[#16293F]">
        {value}
      </div>
      <div className="mt-1 text-[9px] text-stone-400">{detail}</div>
    </div>
  );
}

function BreakdownCard({ title, items }: { title: string; items: Array<{ label: string; count: number }> }) {
  const total = items.reduce((sum, item) => sum + Number(item.count || 0), 0);
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4">
      <div className="text-xs font-bold uppercase tracking-wide text-stone-500">{title}</div>
      <div className="mt-3 space-y-2">
        {items.length === 0 ? (
          <div className="py-5 text-center text-xs text-stone-400">No data.</div>
        ) : (
          items.slice(0, 12).map((item) => {
            const share = total ? (Number(item.count) / total) * 100 : 0;
            return (
              <div key={item.label}>
                <div className="flex items-center justify-between gap-3 text-[10px]">
                  <span className="truncate font-semibold text-stone-700">{item.label}</span>
                  <span className="shrink-0 font-bold text-stone-500">{number(item.count)} · {share.toFixed(1)}%</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-stone-100">
                  <div className="h-full rounded-full bg-[#1F3A5C]" style={{ width: `${Math.min(100, share)}%` }} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-stone-200 bg-white px-3 py-2">
      <div className="text-[9px] font-bold uppercase text-stone-400">{label}</div>
      <div className="mt-0.5 text-sm font-bold text-[#16293F]">{number(value)}</div>
    </div>
  );
}
