'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  CircleDollarSign,
  Clock3,
  Package,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
} from 'lucide-react';

/* ============================================================================
   TYPES
============================================================================ */

interface PackageSale {
  id: number;
  package_id: number;
  title: string;
  description: string | null;
  exam_id: number | null;

  /*
   * Current package system does not have a tier.
   * Legacy package system may have one.
   */
  tier: string | null;

  expiry_type: string | null;

  price_inr: number;
  validity_days: number | null;
  is_active: boolean;

  sales: number;
  successful_sales: number;
  revenue: number;

  active_students: number;
  total_students: number;
  expired_students: number;
  subscription_count: number;
}

interface MonthlyRevenue {
  month: string;
  label: string;
  sales: number;
  revenue: number;
}

interface PaymentStatus {
  status: string;
  count: number;
}

interface RecentSale {
  id: number;
  user_id: number;

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

interface EnrollmentReport {
  package_id: number;
  package_title: string;

  students: number;
  total_enrollments: number;

  active_students: number;
  expired_students: number;

  sales: number;
  revenue: number;
}

interface DashboardSummary {
  total_revenue: number;
  revenue: number;

  successful_sales: number;
  sales: number;

  active_students: number;
  active_packages: number;
  total_packages: number;
  all_packages: number;

  profit: number | null;
}

interface TopPackage {
  id: number;
  title: string;
  sales: number;
  revenue: number;
  active_students: number;
}

interface DashboardResponse {
  period?: {
    months: number;
    start_date: string;
    end_date: string;
  };

  summary: DashboardSummary;

  total_revenue: number;
  revenue: number;

  successful_sales: number;
  active_students: number;
  active_packages: number;
  total_packages: number;
  profit: number | null;

  monthly_revenue: MonthlyRevenue[];

  revenue_trend?: MonthlyRevenue[];

  payment_status: PaymentStatus[];

  package_performance: PackageSale[];

  enrollment_report: EnrollmentReport[];

  recent_sales: RecentSale[];

  top_package: TopPackage | null;

  sources?: {
    packages: string;
    payments: string;
    subscriptions: string;
  };
}

/* ============================================================================
   HELPERS
============================================================================ */

function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat('en-IN').format(
    Number(value || 0),
  );
}

function formatDate(value: string | null | undefined) {
  if (!value) return '—';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function normalizeStatus(status: string | null | undefined) {
  return String(status || '')
    .trim()
    .toLowerCase();
}

function isSuccessfulStatus(status: string | null | undefined) {
  return [
    'paid',
    'success',
    'successful',
    'completed',
    'captured',
  ].includes(normalizeStatus(status));
}

function isFailedStatus(status: string | null | undefined) {
  return [
    'failed',
    'failure',
    'cancelled',
    'canceled',
  ].includes(normalizeStatus(status));
}

/**
 * The backend returns `package_performance`.
 * This helper makes sure an unexpected/null response never causes:
 *
 *     TypeError: packages is not iterable
 */
function normalizePackages(
  value: unknown,
): PackageSale[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as PackageSale[];
}

function normalizeMonthlyRevenue(
  value: unknown,
): MonthlyRevenue[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as MonthlyRevenue[];
}

function normalizePaymentStatus(
  value: unknown,
): PaymentStatus[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as PaymentStatus[];
}

function normalizeRecentSales(
  value: unknown,
): RecentSale[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as RecentSale[];
}

function normalizeEnrollmentReport(
  value: unknown,
): EnrollmentReport[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value as EnrollmentReport[];
}

/* ============================================================================
   PAGE
============================================================================ */

export default function PackageSalesPage() {
  const router = useRouter();

  const [dashboard, setDashboard] =
    useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const [months, setMonths] = useState(12);

  const [generatedAt, setGeneratedAt] =
    useState<string | null>(null);

  /* --------------------------------------------------------------------------
     API BASE
  -------------------------------------------------------------------------- */

  const apiBase = (
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8001/api/v1'
  ).replace(/\/$/, '');

  /* --------------------------------------------------------------------------
     LOAD DASHBOARD
  -------------------------------------------------------------------------- */

  const loadDashboard = async (
    showRefresh = false,
  ) => {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError('');

      const token =
        localStorage.getItem('accqudo_token') ||
        localStorage.getItem('token');

      if (!token) {
        router.replace('/login');
        return;
      }

      const response = await fetch(
        `${apiBase}/team/sells/dashboard?months=${months}`,
        {
          method: 'GET',

          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },

          cache: 'no-store',
        },
      );

      /* ----------------------------------------------------------------------
         AUTH
      ---------------------------------------------------------------------- */

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

      /* ----------------------------------------------------------------------
         ERROR
      ---------------------------------------------------------------------- */

      if (!response.ok) {
        const responseText = await response.text();

        let message = responseText;

        try {
          const parsed = JSON.parse(responseText);

          if (parsed?.detail) {
            message =
              typeof parsed.detail === 'string'
                ? parsed.detail
                : JSON.stringify(parsed.detail);
          }
        } catch {
          // Keep original response text.
        }

        throw new Error(
          message ||
            `Unable to load package sales dashboard (${response.status}).`,
        );
      }

      /* ----------------------------------------------------------------------
         RESPONSE
      ---------------------------------------------------------------------- */

      const rawData = await response.json();

      /*
       * IMPORTANT:
       *
       * Backend returns:
       *
       * summary
       * package_performance
       * monthly_revenue
       * payment_status
       * recent_sales
       *
       * We normalize these here before rendering.
       */

      const summary: DashboardSummary = {
        total_revenue: Number(
          rawData?.summary?.total_revenue ??
            rawData?.total_revenue ??
            0,
        ),

        revenue: Number(
          rawData?.summary?.revenue ??
            rawData?.revenue ??
            rawData?.summary?.total_revenue ??
            0,
        ),

        successful_sales: Number(
          rawData?.summary?.successful_sales ??
            rawData?.successful_sales ??
            0,
        ),

        sales: Number(
          rawData?.summary?.sales ??
            rawData?.successful_sales ??
            0,
        ),

        active_students: Number(
          rawData?.summary?.active_students ??
            rawData?.active_students ??
            0,
        ),

        active_packages: Number(
          rawData?.summary?.active_packages ??
            rawData?.active_packages ??
            0,
        ),

        total_packages: Number(
          rawData?.summary?.total_packages ??
            rawData?.total_packages ??
            0,
        ),

        all_packages: Number(
          rawData?.summary?.all_packages ??
            rawData?.total_packages ??
            0,
        ),

        profit:
          rawData?.summary?.profit ??
          rawData?.profit ??
          null,
      };

      const normalizedData: DashboardResponse = {
        ...rawData,

        summary,

        total_revenue: summary.total_revenue,
        revenue: summary.revenue,

        successful_sales:
          summary.successful_sales,

        active_students:
          summary.active_students,

        active_packages:
          summary.active_packages,

        total_packages:
          summary.total_packages,

        profit: summary.profit,

        /*
         * THIS IS THE MAIN FIX.
         *
         * Backend:
         *     package_performance
         *
         * Old frontend:
         *     packages
         *
         * Always make `package_performance` a real array.
         */
        package_performance:
          normalizePackages(
            rawData?.package_performance,
          ),

        monthly_revenue:
          normalizeMonthlyRevenue(
            rawData?.monthly_revenue ??
              rawData?.revenue_trend,
          ),

        payment_status:
          normalizePaymentStatus(
            rawData?.payment_status,
          ),

        recent_sales:
          normalizeRecentSales(
            rawData?.recent_sales,
          ),

        enrollment_report:
          normalizeEnrollmentReport(
            rawData?.enrollment_report,
          ),

        top_package:
          rawData?.top_package ?? null,
      };

      setDashboard(normalizedData);

      /*
       * The current backend doesn't need to provide generated_at.
       * Generate it client-side for the report footer.
       */
      setGeneratedAt(new Date().toISOString());
    } catch (err) {
      console.error(
        'Package sales dashboard error:',
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load package sales information.',
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /* --------------------------------------------------------------------------
     LOAD ON PERIOD CHANGE
  -------------------------------------------------------------------------- */

  useEffect(() => {
    loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [months]);

  /* --------------------------------------------------------------------------
     SAFE ARRAYS
  -------------------------------------------------------------------------- */

  const packages = useMemo(() => {
    if (!dashboard) return [];

    return normalizePackages(
      dashboard.package_performance,
    );
  }, [dashboard]);

  const monthlyRevenue = useMemo(() => {
    if (!dashboard) return [];

    return normalizeMonthlyRevenue(
      dashboard.monthly_revenue,
    );
  }, [dashboard]);

  const paymentStatus = useMemo(() => {
    if (!dashboard) return [];

    return normalizePaymentStatus(
      dashboard.payment_status,
    );
  }, [dashboard]);

  const recentSales = useMemo(() => {
    if (!dashboard) return [];

    return normalizeRecentSales(
      dashboard.recent_sales,
    );
  }, [dashboard]);

  const enrollmentReport = useMemo(() => {
    if (!dashboard) return [];

    return normalizeEnrollmentReport(
      dashboard.enrollment_report,
    );
  }, [dashboard]);

  /* --------------------------------------------------------------------------
     CHART VALUES
  -------------------------------------------------------------------------- */

  const maxMonthlyRevenue = useMemo(() => {
    if (!monthlyRevenue.length) {
      return 1;
    }

    return Math.max(
      ...monthlyRevenue.map(
        (item) => Number(item.revenue) || 0,
      ),
      1,
    );
  }, [monthlyRevenue]);

  const maxPackageRevenue = useMemo(() => {
    if (!packages.length) {
      return 1;
    }

    return Math.max(
      ...packages.map(
        (item) => Number(item.revenue) || 0,
      ),
      1,
    );
  }, [packages]);

  const sortedPackages = useMemo(() => {
    return [...packages].sort(
      (a, b) =>
        Number(b.revenue || 0) -
        Number(a.revenue || 0),
    );
  }, [packages]);

  /* --------------------------------------------------------------------------
     LOADING
  -------------------------------------------------------------------------- */

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF8F3]">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-[#1F3A5C]/20 border-t-[#1F3A5C]" />

          <p className="font-mono text-xs font-semibold text-stone-500">
            Loading Package Sales Dashboard...
          </p>
        </div>
      </div>
    );
  }

  /* --------------------------------------------------------------------------
     ERROR
  -------------------------------------------------------------------------- */

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={() => router.push('/team')}
            className="mb-6 flex items-center gap-2 text-xs font-bold text-stone-600 hover:text-[#1F3A5C]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Team Portal
          </button>

          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center">
            <XCircle className="mx-auto h-10 w-10 text-rose-600" />

            <h1 className="mt-4 font-serif text-xl font-bold text-rose-900">
              Unable to Load Sales Dashboard
            </h1>

            <p className="mx-auto mt-2 max-w-xl break-words text-sm text-rose-700">
              {error}
            </p>

            <button
              type="button"
              onClick={() => loadDashboard(true)}
              className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#1F3A5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#16293F]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return null;
  }

  /* ==========================================================================
     RENDER
  ========================================================================== */

  return (
    <div className="min-h-screen bg-[#FAF8F3] px-4 py-8 font-sans text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ==================================================================
            HEADER
        ================================================================== */}

        <header className="rounded-2xl border border-stone-200 border-t-4 border-t-[#1F3A5C] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

            <div>
              <button
                type="button"
                onClick={() => router.push('/team')}
                className="mb-3 flex items-center gap-1.5 text-xs font-bold text-stone-500 transition hover:text-[#1F3A5C]"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Team Portal
              </button>

              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1 text-xs font-bold text-purple-700">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Sales Intelligence
                </span>

                <span className="rounded bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold text-stone-500">
                  ADMIN / SUPER ADMIN
                </span>
              </div>

              <h1 className="mt-3 font-serif text-3xl font-bold text-[#16293F]">
                Package Sells
              </h1>

              <p className="mt-1 max-w-2xl text-xs leading-relaxed text-stone-500">
                Monitor package sales, student enrollments,
                active subscriptions, revenue performance,
                and recent payment activity.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* PERIOD */}
              <div className="relative">
                <select
                  value={months}
                  onChange={(event) =>
                    setMonths(
                      Number(event.target.value),
                    )
                  }
                  className="appearance-none rounded-lg border border-stone-300 bg-white py-2 pl-3 pr-9 text-xs font-bold text-stone-600 outline-none focus:border-[#1F3A5C]"
                >
                  <option value={3}>
                    Last 3 Months
                  </option>

                  <option value={6}>
                    Last 6 Months
                  </option>

                  <option value={12}>
                    Last 12 Months
                  </option>

                  <option value={24}>
                    Last 24 Months
                  </option>
                </select>

                <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
              </div>

              {/* REFRESH */}
              <button
                type="button"
                onClick={() => loadDashboard(true)}
                disabled={refreshing}
                className="flex items-center gap-2 rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 transition hover:bg-stone-50 disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 ${
                    refreshing
                      ? 'animate-spin'
                      : ''
                  }`}
                />

                Refresh
              </button>
            </div>
          </div>
        </header>

        {/* ==================================================================
            KPI CARDS
        ================================================================== */}

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">

          {/* REVENUE */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                <CircleDollarSign className="h-5 w-5" />
              </div>

              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Total Revenue
            </p>

            <p className="mt-1 text-2xl font-bold text-[#16293F]">
              {formatCurrency(
                dashboard.summary.total_revenue,
              )}
            </p>
          </div>

          {/* SALES */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700">
                <ShoppingBag className="h-5 w-5" />
              </div>

              <BarChart3 className="h-4 w-4 text-blue-600" />
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Successful Sales
            </p>

            <p className="mt-1 text-2xl font-bold text-[#16293F]">
              {formatNumber(
                dashboard.summary.successful_sales,
              )}
            </p>
          </div>

          {/* STUDENTS */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700">
                <Users className="h-5 w-5" />
              </div>

              <Users className="h-4 w-4 text-purple-600" />
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Active Students
            </p>

            <p className="mt-1 text-2xl font-bold text-[#16293F]">
              {formatNumber(
                dashboard.summary.active_students,
              )}
            </p>
          </div>

          {/* ACTIVE PACKAGES */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                <Package className="h-5 w-5" />
              </div>

              <Package className="h-4 w-4 text-amber-600" />
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              Active Packages
            </p>

            <p className="mt-1 text-2xl font-bold text-[#16293F]">
              {formatNumber(
                dashboard.summary.active_packages,
              )}
            </p>
          </div>

          {/* TOTAL PACKAGES */}
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-stone-100 text-stone-700">
                <Clock3 className="h-5 w-5" />
              </div>

              <span className="text-[10px] font-bold text-stone-400">
                TOTAL
              </span>
            </div>

            <p className="mt-4 text-[10px] font-bold uppercase tracking-wider text-stone-400">
              All Packages
            </p>

            <p className="mt-1 text-2xl font-bold text-[#16293F]">
              {formatNumber(
                dashboard.summary.total_packages,
              )}
            </p>
          </div>

        </section>

        {/* ==================================================================
            CHARTS
        ================================================================== */}

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">

          {/* REVENUE TREND */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm xl:col-span-2">

            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-serif text-xl font-bold text-[#16293F]">
                  Revenue Trend
                </h2>

                <p className="mt-1 text-xs text-stone-500">
                  Successful package sales by month
                </p>
              </div>

              <div className="rounded-lg bg-emerald-50 px-3 py-2 text-right">
                <p className="text-[9px] font-bold uppercase text-emerald-600">
                  Revenue
                </p>

                <p className="text-sm font-bold text-emerald-800">
                  {formatCurrency(
                    dashboard.summary.total_revenue,
                  )}
                </p>
              </div>
            </div>

            <div className="mt-8 flex h-64 items-end gap-2 overflow-x-auto border-b border-stone-200 pb-0">

              {monthlyRevenue.length === 0 ? (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-xs text-stone-400">
                    No revenue data available.
                  </p>
                </div>
              ) : (
                monthlyRevenue.map((item) => {
                  const revenue =
                    Number(item.revenue) || 0;

                  const height =
                    revenue === 0
                      ? 3
                      : Math.max(
                          8,
                          (revenue /
                            maxMonthlyRevenue) *
                            100,
                        );

                  return (
                    <div
                      key={item.month}
                      className="group flex min-w-[42px] flex-1 flex-col items-center justify-end"
                    >
                      <div className="relative mb-2 flex h-full w-full items-end justify-center">

                        <div
                          className="w-7 rounded-t-md bg-[#1F3A5C] transition-all group-hover:bg-[#16293F]"
                          style={{
                            height: `${height}%`,
                          }}
                          title={`${item.label}: ${formatCurrency(revenue)}`}
                        />

                        <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#16293F] px-2 py-1 text-[9px] font-bold text-white group-hover:block">
                          {formatCurrency(revenue)}
                        </div>
                      </div>

                      <span className="mt-2 text-[9px] font-medium text-stone-400">
                        {item.label}
                      </span>
                    </div>
                  );
                })
              )}

            </div>

            <div className="mt-4 flex items-center justify-between text-[10px] text-stone-400">
              <span>
                {months} month reporting window
              </span>

              <span>
                Updated{' '}
                {formatDate(generatedAt)}
              </span>
            </div>
          </div>

          {/* PAYMENT STATUS */}
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">

            <h2 className="font-serif text-xl font-bold text-[#16293F]">
              Payment Status
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Current order status distribution
            </p>

            <div className="mt-6 space-y-4">

              {paymentStatus.length === 0 ? (
                <p className="py-8 text-center text-xs text-stone-400">
                  No payment records found.
                </p>
              ) : (
                paymentStatus.map((item) => {
                  const successful =
                    isSuccessfulStatus(
                      item.status,
                    );

                  const failed =
                    isFailedStatus(
                      item.status,
                    );

                  const icon = successful ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  ) : failed ? (
                    <XCircle className="h-4 w-4 text-rose-600" />
                  ) : (
                    <Clock3 className="h-4 w-4 text-amber-600" />
                  );

                  return (
                    <div
                      key={item.status}
                      className="rounded-xl border border-stone-100 bg-stone-50 p-3"
                    >
                      <div className="flex items-center justify-between">

                        <div className="flex items-center gap-2">
                          {icon}

                          <span className="text-xs font-bold capitalize text-stone-700">
                            {String(item.status || 'UNKNOWN').toLowerCase()}
                          </span>
                        </div>

                        <span className="text-xs font-bold text-stone-500">
                          {formatNumber(item.count)}
                        </span>

                      </div>
                    </div>
                  );
                })
              )}

            </div>
          </div>
        </section>

        {/* ==================================================================
            PACKAGE PERFORMANCE
        ================================================================== */}

        <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="font-serif text-xl font-bold text-[#16293F]">
                Package Performance
              </h2>

              <p className="mt-1 text-xs text-stone-500">
                Revenue, sales, and student enrollment by package
              </p>
            </div>

            {dashboard.top_package && (
              <div className="rounded-lg bg-purple-50 px-3 py-2">
                <p className="text-[9px] font-bold uppercase text-purple-600">
                  Highest Revenue Package
                </p>

                <p className="mt-0.5 text-xs font-bold text-purple-900">
                  {dashboard.top_package.title}
                </p>
              </div>
            )}

          </div>

          <div className="mt-6 space-y-5">

            {sortedPackages.length === 0 ? (
              <div className="rounded-xl border border-dashed border-stone-300 p-10 text-center">
                <Package className="mx-auto h-8 w-8 text-stone-300" />

                <p className="mt-3 text-sm font-semibold text-stone-500">
                  No packages found.
                </p>
              </div>
            ) : (
              sortedPackages.map((pkg) => {

                const revenue =
                  Number(pkg.revenue) || 0;

                const revenuePercent =
                  Math.max(
                    0,
                    Math.min(
                      100,
                      (revenue /
                        maxPackageRevenue) *
                        100,
                    ),
                  );

                const packageType =
                  pkg.tier ||
                  pkg.expiry_type ||
                  'PACKAGE';

                return (
                  <div
                    key={pkg.id}
                    className="rounded-xl border border-stone-200 p-4"
                  >

                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center">

                      {/* PACKAGE */}
                      <div className="min-w-0 lg:w-64">

                        <div className="flex items-center gap-2">

                          <Package className="h-4 w-4 text-[#1F3A5C]" />

                          <h3 className="truncate text-sm font-bold text-[#16293F]">
                            {pkg.title}
                          </h3>

                          <span
                            className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                              pkg.is_active
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-stone-100 text-stone-500'
                            }`}
                          >
                            {pkg.is_active
                              ? 'ACTIVE'
                              : 'INACTIVE'}
                          </span>

                        </div>

                        <p className="mt-1 text-[10px] text-stone-400">
                          {packageType}
                          {pkg.validity_days != null
                            ? ` · ${pkg.validity_days} days`
                            : ''}
                        </p>
                      </div>

                      {/* REVENUE */}
                      <div className="flex-1">

                        <div className="mb-2 flex items-center justify-between">

                          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                            Revenue
                          </span>

                          <span className="text-sm font-bold text-[#16293F]">
                            {formatCurrency(revenue)}
                          </span>

                        </div>

                        <div className="h-2 overflow-hidden rounded-full bg-stone-100">
                          <div
                            className="h-full rounded-full bg-[#1F3A5C] transition-all"
                            style={{
                              width: `${revenuePercent}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* STATS */}
                      <div className="grid grid-cols-3 gap-5 text-right">

                        <div>
                          <p className="text-[9px] font-bold uppercase text-stone-400">
                            Sales
                          </p>

                          <p className="mt-1 text-sm font-bold text-stone-700">
                            {formatNumber(pkg.sales)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase text-stone-400">
                            Active
                          </p>

                          <p className="mt-1 text-sm font-bold text-emerald-700">
                            {formatNumber(
                              pkg.active_students,
                            )}
                          </p>
                        </div>

                        <div>
                          <p className="text-[9px] font-bold uppercase text-stone-400">
                            Total
                          </p>

                          <p className="mt-1 text-sm font-bold text-stone-700">
                            {formatNumber(
                              pkg.total_students,
                            )}
                          </p>
                        </div>

                      </div>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </section>

        {/* ==================================================================
            PACKAGE ENROLLMENT REPORT
        ================================================================== */}

        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 p-6">
            <h2 className="font-serif text-xl font-bold text-[#16293F]">
              Package Enrollment Report
            </h2>

            <p className="mt-1 text-xs text-stone-500">
              Detailed package-level student and sales statistics
            </p>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[900px] text-left">

              <thead className="bg-stone-50">
                <tr>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Package
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Price
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Sales
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Revenue
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Active Students
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Expired
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Status
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">

                {sortedPackages.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-12 text-center text-xs text-stone-400"
                    >
                      No packages found.
                    </td>
                  </tr>
                ) : (
                  sortedPackages.map((pkg) => (
                    <tr
                      key={pkg.id}
                      className="transition hover:bg-stone-50"
                    >

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1F3A5C]/10 text-[#1F3A5C]">
                            <Package className="h-4 w-4" />
                          </div>

                          <div>
                            <p className="text-xs font-bold text-[#16293F]">
                              {pkg.title}
                            </p>

                            <p className="text-[9px] text-stone-400">
                              {pkg.tier ||
                                pkg.expiry_type ||
                                'PACKAGE'}
                            </p>
                          </div>

                        </div>

                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-stone-600">
                        {formatCurrency(pkg.price_inr)}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-stone-700">
                        {formatNumber(pkg.sales)}
                      </td>

                      <td className="px-5 py-4 text-xs font-bold text-emerald-700">
                        {formatCurrency(pkg.revenue)}
                      </td>

                      <td className="px-5 py-4">

                        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold text-blue-700">

                          <Users className="h-3 w-3" />

                          {formatNumber(
                            pkg.active_students,
                          )}

                        </span>

                      </td>

                      <td className="px-5 py-4 text-xs font-semibold text-stone-500">
                        {formatNumber(
                          pkg.expired_students,
                        )}
                      </td>

                      <td className="px-5 py-4">

                        <span
                          className={`rounded-full px-2.5 py-1 text-[9px] font-bold ${
                            pkg.is_active
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {pkg.is_active
                            ? 'ACTIVE'
                            : 'INACTIVE'}
                        </span>

                      </td>

                    </tr>
                  ))
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* ==================================================================
            RECENT SALES
        ================================================================== */}

        <section className="rounded-2xl border border-stone-200 bg-white shadow-sm">

          <div className="border-b border-stone-200 p-6">

            <div className="flex items-center justify-between">

              <div>
                <h2 className="font-serif text-xl font-bold text-[#16293F]">
                  Recent Package Sales
                </h2>

                <p className="mt-1 text-xs text-stone-500">
                  Latest package payment transactions
                </p>
              </div>

              <ShoppingBag className="h-5 w-5 text-stone-300" />

            </div>
          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1000px] text-left">

              <thead className="bg-stone-50">
                <tr>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Student
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Package
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Amount
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Status
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Order
                  </th>

                  <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-wider text-stone-400">
                    Date
                  </th>

                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100">

                {recentSales.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-xs text-stone-400"
                    >
                      No package sales found.
                    </td>
                  </tr>
                ) : (
                  recentSales.map((sale) => {

                    const successful =
                      isSuccessfulStatus(
                        sale.status,
                      );

                    const failed =
                      isFailedStatus(
                        sale.status,
                      );

                    return (
                      <tr
                        key={sale.id}
                        className="transition hover:bg-stone-50"
                      >

                        {/* STUDENT */}
                        <td className="px-5 py-4">

                          <p className="text-xs font-bold text-[#16293F]">
                            {sale.student_name ||
                              'Unknown Student'}
                          </p>

                          <p className="mt-0.5 text-[9px] text-stone-400">
                            {sale.student_email ||
                              '—'}
                          </p>

                        </td>

                        {/* PACKAGE */}
                        <td className="px-5 py-4 text-xs font-semibold text-stone-600">
                          {sale.package_title ||
                            `Package #${sale.package_id}`}
                        </td>

                        {/* AMOUNT */}
                        <td className="px-5 py-4 text-xs font-bold text-emerald-700">
                          {formatCurrency(
                            sale.amount_inr,
                          )}
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[9px] font-bold ${
                              successful
                                ? 'bg-emerald-100 text-emerald-700'
                                : failed
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                            }`}
                          >

                            {successful ? (
                              <CheckCircle2 className="h-3 w-3" />
                            ) : failed ? (
                              <XCircle className="h-3 w-3" />
                            ) : (
                              <Clock3 className="h-3 w-3" />
                            )}

                            {String(
                              sale.status ||
                                'UNKNOWN',
                            ).toUpperCase()}

                          </span>

                        </td>

                        {/* ORDER */}
                        <td className="px-5 py-4 font-mono text-[9px] text-stone-400">
                          {sale.order_id || '—'}
                        </td>

                        {/* DATE */}
                        <td className="px-5 py-4 text-xs text-stone-500">
                          {formatDate(
                            sale.created_at,
                          )}
                        </td>

                      </tr>
                    );
                  })
                )}

              </tbody>
            </table>
          </div>
        </section>

        {/* ==================================================================
            REPORT FOOTER
        ================================================================== */}

        <section className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#1F3A5C]/10 text-[#1F3A5C]">
                <BarChart3 className="h-4 w-4" />
              </div>

              <div>

                <p className="text-xs font-bold text-[#16293F]">
                  Package Sales Report
                </p>

                <p className="text-[10px] text-stone-400">
                  Revenue is calculated from successful package payments.
                </p>

              </div>
            </div>

            <div className="text-right">

              <p className="font-mono text-[9px] text-stone-400">
                Generated:{' '}
                {formatDate(generatedAt)}
              </p>

              {dashboard.sources && (
                <p className="mt-1 font-mono text-[8px] text-stone-300">
                  Source: {dashboard.sources.payments}
                </p>
              )}

            </div>

          </div>
        </section>

      </div>
    </div>
  );
}