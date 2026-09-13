'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
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

interface AttemptHistoryItem {
  attempt_id: number;
  test_id: number;
  test_title: string;
  score: number;
  total_marks: number;
  percentage: number;
  accuracy: number;
  submitted_at: string | null;
  duration_taken_seconds: number;
  status: string;
}

interface TestItem {
  id: number;
  title: string;
  duration_minutes: number;
  total_marks: number;
  price_inr?: number;
  is_enrolled?: boolean;
  category?: 'TOPIC_WISE' | 'CHAPTER_WISE' | 'SUBJECT_WISE' | 'FULL_LENGTH';
}

interface PackageItem {
  id: number;
  exam_id: number;
  title: string;
  description: string;
  price_inr: number;
  validity_days: number;
  total_tests: number;
  is_purchased?: boolean; // <--- Tracks package ownership
  tests: { id: number; title: string; duration_minutes: number; total_marks: number }[];
}

interface DashboardData {
  student?: {
    id: number;
    full_name: string;
    email: string;
  };
  total_attempts: number;
  tests_completed: number;
  average_score_percentage: number;
  overall_accuracy: number;
  history: AttemptHistoryItem[];
  enrolled_tests: TestItem[];
  store_catalog: TestItem[];
}

interface AppliedCoupon {
  code: string;
  discountPercentage: number;
  discountAmount: number;
  finalPriceInr: number;
}

export default function StudentDashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'enrolled' | 'packages' | 'history'>('enrolled');
  const [confirmTest, setConfirmTest] = useState<TestItem | null>(null);
  const [starting, setStarting] = useState(false);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Promo Coupon State for in-dashboard purchases
  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [appliedCoupons, setAppliedCoupons] = useState<Record<string, AppliedCoupon>>({});
  const [validatingCouponKey, setValidatingCouponKey] = useState<string | null>(null);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.accqudo.com/api/v1';

  // Load dynamic Razorpay SDK
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      const token = localStorage.getItem('accqudo_token');
      if (!token) {
        router.push('/login');
        return;
      }

      const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      };

      // 1. Fetch Candidate Analytics & Enrolled Papers
      const dashRes = await fetch(`${apiBase}/analytics/dashboard/me`, { headers });
      if (dashRes.status === 401 || dashRes.status === 403) {
        localStorage.removeItem('accqudo_token');
        router.push('/login');
        return;
      }

      if (dashRes.ok) {
        const payload = await dashRes.json();
        setData(payload);
      }

      // 2. Fetch Multi-Exam Packages with Ownership Flag
      const pkgRes = await fetch(`${apiBase}/admin/packages/all`, { headers });
      if (pkgRes.ok) {
        const pkgList = await pkgRes.json();
        setPackages(pkgList);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, [apiBase, router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Coupon Application
  const handleApplyCoupon = async (itemKey: string, packageId: number) => {
    const rawCode = couponInputs[itemKey]?.trim().toUpperCase();
    if (!rawCode) return;

    setValidatingCouponKey(itemKey);
    setBannerMessage(null);

    try {
      const res = await fetch(`${apiBase}/admin/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode, package_id: packageId }),
      });

      const couponData = await res.json();
      if (!res.ok) throw new Error(couponData.detail || 'Invalid or expired coupon.');

      setAppliedCoupons((prev) => ({
        ...prev,
        [itemKey]: {
          code: couponData.code,
          discountPercentage: couponData.discount_percentage,
          discountAmount: couponData.discount_amount,
          finalPriceInr: couponData.final_price_inr,
        },
      }));

      setBannerMessage({
        text: `Coupon "${couponData.code}" applied! Saved ₹${couponData.discount_amount} (${couponData.discount_percentage}% OFF).`,
        type: 'success',
      });
    } catch (err: any) {
      setBannerMessage({ text: err.message, type: 'error' });
    } finally {
      setValidatingCouponKey(null);
    }
  };

  const handleRemoveCoupon = (itemKey: string) => {
    setAppliedCoupons((prev) => {
      const next = { ...prev };
      delete next[itemKey];
      return next;
    });
    setCouponInputs((prev) => ({ ...prev, [itemKey]: '' }));
    setBannerMessage({ text: 'Coupon removed.', type: 'info' });
  };

  // Real Razorpay Checkout Workflow (Package or Single Test)
  const handleRazorpayPurchase = async (params: { packageId?: number; testId?: number; title: string }) => {
    const token = localStorage.getItem('accqudo_token');
    if (!token) return router.push('/login');

    const itemKey = params.packageId ? `pkg_${params.packageId}` : `test_${params.testId}`;
    setBuyingId(itemKey);
    setBannerMessage(null);

    const applied = appliedCoupons[itemKey];

    try {
      // 1. Create Order on Backend
      const orderRes = await fetch(`${apiBase}/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          package_id: params.packageId || null,
          test_id: params.testId || null,
          coupon_code: applied ? applied.code : null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.detail || 'Could not initiate payment session.');

      // 2. Trigger Razorpay Modal
      const options = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Accqudo Assessment Platform',
        description: orderData.description || params.title,
        order_id: orderData.order_id,
        prefill: orderData.prefill || {},
        theme: {
          color: '#14213D',
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Razorpay Signature
            const verifyRes = await fetch(`${apiBase}/payments/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyPayload = await verifyRes.json();
            if (!verifyRes.ok) throw new Error(verifyPayload.detail || 'Payment verification rejected.');

            setBannerMessage({
              text: `Payment Confirmed! ${verifyPayload.message || 'Access granted.'}`,
              type: 'success',
            });
            await fetchDashboardData();
            setActiveTab('enrolled');
          } catch (verErr: any) {
            setBannerMessage({ text: `Verification failed: ${verErr.message}`, type: 'error' });
          }
        },
        modal: {
          ondismiss: function () {
            setBuyingId(null);
          },
        },
      };

      const razorpayInstance = new (window as any).Razorpay(options);
      razorpayInstance.open();
    } catch (err: any) {
      setBannerMessage({ text: err.message, type: 'error' });
    } finally {
      setBuyingId(null);
    }
  };

  // Launch Live Proctored Exam Session
  const handleConfirmStartExam = async () => {
    if (!confirmTest) return;
    const token = localStorage.getItem('accqudo_token');
    if (!token) return router.push('/login');

    setStarting(true);
    setBannerMessage(null);

    try {
      const res = await fetch(`${apiBase}/attempts/start/${confirmTest.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const payload = await res.json();
      if (!res.ok) throw new Error(payload.detail || 'Failed to initialize examination session.');

      router.push(`/exam/${payload.attempt_id}`);
    } catch (err: any) {
      setBannerMessage({ text: err.message, type: 'error' });
      setConfirmTest(null);
      setStarting(false);
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('accqudo_token');
    localStorage.removeItem('accqudo_user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#EEF2ED]">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 mx-auto animate-spin rounded-full border-4 border-[#14213D]/25 border-t-[#14213D]" />
          <p
            className="text-xs font-medium text-[#4B5768]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            Synchronizing Candidate Portal &amp; Entitlements...
          </p>
        </div>
      </div>
    );
  }

  const enrolledTests = data?.enrolled_tests || [];
  const history = data?.history || [];

  return (
    <div
      className={`${serif.variable} ${plexSans.variable} ${plexMono.variable} min-h-screen bg-[#EEF2ED] text-[#14213D] py-8 px-4 sm:px-6 lg:px-8`}
      style={{
        fontFamily: 'var(--font-sans)',
        backgroundImage: `
          linear-gradient(#14213D0d 1px, transparent 1px),
          linear-gradient(90deg, #14213D0d 1px, transparent 1px)
        `,
        backgroundSize: '28px 28px',
      }}
    >
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Top Header Navigation */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between bg-[#F8FAF7] border border-[#CBD3C7] p-6">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="border border-[#14213D]/30 px-3 py-0.5 text-[10px] font-medium text-[#4B5768]"
                style={{ fontFamily: 'var(--font-mono)', letterSpacing: '0.04em' }}
              >
                National Examination Suite
              </span>
              {data?.student && (
                <span className="text-xs text-[#4B5768] font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                  {data.student.full_name} ({data.student.email})
                </span>
              )}
            </div>
            <h1
              className="text-2xl font-semibold text-[#14213D] mt-2"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Candidate Dashboard
            </h1>
            <p className="text-xs text-[#4B5768] mt-1">
              Manage your national test tracks, explore structured packages, and enter proctored examination rooms.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => router.push('/store')}
              className="bg-[#A9791F] hover:bg-[#8F6519] px-3.5 py-2 text-xs font-semibold text-white transition"
            >
              Explore Store Packages &rarr;
            </button>
            <button
              onClick={() => router.push('/')}
              className="border border-[#14213D]/40 px-3.5 py-2 text-xs font-semibold text-[#14213D] hover:opacity-70 transition"
            >
              Home
            </button>
            <button
              onClick={handleSignOut}
              className="border border-[#A13D3D]/60 px-3.5 py-2 text-xs font-semibold text-[#A13D3D] hover:bg-[#A13D3D]/5 transition"
            >
              Sign Out
            </button>
          </div>
        </header>

        {/* System Alert Notification */}
        {bannerMessage && (
          <div
            className={`p-4 text-xs font-medium border-l-4 ${
              bannerMessage.type === 'success'
                ? 'bg-[#2F6B4F0d] border-[#2F6B4F] text-[#2F6B4F]'
                : bannerMessage.type === 'error'
                ? 'bg-[#A13D3D0d] border-[#A13D3D] text-[#A13D3D]'
                : 'bg-[#14213D0d] border-[#14213D] text-[#14213D]'
            }`}
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            {bannerMessage.text}
          </div>
        )}

        {/* Overview Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border-t-2 border-[#14213D] bg-[#F8FAF7] border-x border-b border-[#CBD3C7] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#4B5768]" style={{ fontFamily: 'var(--font-mono)' }}>
              Total Attempts
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#14213D]" style={{ fontFamily: 'var(--font-mono)' }}>
              {data?.total_attempts ?? 0}
            </p>
            <p className="mt-1 text-[11px] text-[#4B5768]">Evaluated: {data?.tests_completed ?? 0}</p>
          </div>

          <div className="border-t-2 border-[#A9791F] bg-[#F8FAF7] border-x border-b border-[#CBD3C7] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#4B5768]" style={{ fontFamily: 'var(--font-mono)' }}>
              Average Percentage
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#A9791F]" style={{ fontFamily: 'var(--font-mono)' }}>
              {data?.average_score_percentage ?? 0}%
            </p>
            <p className="mt-1 text-[11px] text-[#4B5768]">Cohort Weighted</p>
          </div>

          <div className="border-t-2 border-[#2F6B4F] bg-[#F8FAF7] border-x border-b border-[#CBD3C7] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#4B5768]" style={{ fontFamily: 'var(--font-mono)' }}>
              My Papers
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#2F6B4F]" style={{ fontFamily: 'var(--font-mono)' }}>
              {enrolledTests.length}
            </p>
            <p className="mt-1 text-[11px] text-[#4B5768]">Active &amp; Ready</p>
          </div>

          <div className="border-t-2 border-[#14213D]/40 bg-[#F8FAF7] border-x border-b border-[#CBD3C7] p-5">
            <p className="text-[10px] font-medium uppercase tracking-wider text-[#4B5768]" style={{ fontFamily: 'var(--font-mono)' }}>
              Available Packages
            </p>
            <p className="mt-2 text-3xl font-semibold text-[#14213D]" style={{ fontFamily: 'var(--font-mono)' }}>
              {packages.length}
            </p>
            <p className="mt-1 text-[11px] text-[#4B5768]">Full Access Series</p>
          </div>
        </div>

        {/* Main Workspace Navigation Tabs */}
        <div className="border border-[#CBD3C7] bg-[#F8FAF7] p-6 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-[#CBD3C7] pb-4 gap-4">
            <div className="flex flex-wrap gap-6">
              <button
                onClick={() => setActiveTab('enrolled')}
                className="pb-1 text-xs font-semibold transition"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: activeTab === 'enrolled' ? '#14213D' : '#4B5768',
                  borderBottom: activeTab === 'enrolled' ? '2px solid #A9791F' : '2px solid transparent',
                }}
              >
                My Enrolled Papers ({enrolledTests.length})
              </button>
              <button
                onClick={() => setActiveTab('packages')}
                className="pb-1 text-xs font-semibold transition"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: activeTab === 'packages' ? '#14213D' : '#4B5768',
                  borderBottom: activeTab === 'packages' ? '2px solid #A9791F' : '2px solid transparent',
                }}
              >
                Full Exam Packages ({packages.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className="pb-1 text-xs font-semibold transition"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: activeTab === 'history' ? '#14213D' : '#4B5768',
                  borderBottom: activeTab === 'history' ? '2px solid #A9791F' : '2px solid transparent',
                }}
              >
                Attempt Records ({history.length})
              </button>
            </div>
            <span className="text-xs text-[#4B5768]" style={{ fontFamily: 'var(--font-mono)' }}>
              Secured with Razorpay &amp; Proctoring Engine
            </span>
          </div>

          {/* TAB 1: MY ENROLLED PAPERS */}
          {activeTab === 'enrolled' && (
            <div>
              {enrolledTests.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <p className="text-sm font-medium text-[#14213D]">You do not have any papers enrolled yet.</p>
                  <p className="text-xs text-[#4B5768] max-w-sm mx-auto">
                    Unlock a complete examination package (GATE, JEE, NEET, UPSC) or individual mock tests from the catalog.
                  </p>
                  <button
                    onClick={() => setActiveTab('packages')}
                    className="bg-[#A9791F] hover:bg-[#8F6519] px-4 py-2 text-xs font-semibold text-white transition"
                  >
                    View Packages
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enrolledTests.map((test) => (
                    <div
                      key={test.id}
                      className="border border-[#CBD3C7] bg-[#EEF2ED]/60 p-5 flex flex-col justify-between hover:border-[#14213D]/60 transition"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="text-sm font-medium text-[#14213D] leading-snug" style={{ fontFamily: 'var(--font-serif)' }}>
                            {test.title}
                          </h3>
                          <span
                            className="shrink-0 border border-[#2F6B4F]/40 text-[#2F6B4F] text-[10px] font-medium px-2 py-0.5"
                            style={{ fontFamily: 'var(--font-mono)' }}
                          >
                            Active Pass
                          </span>
                        </div>
                        <div
                          className="mt-3 flex items-center gap-4 text-xs text-[#4B5768] font-medium"
                          style={{ fontFamily: 'var(--font-mono)' }}
                        >
                          <span>⏱ {test.duration_minutes} Mins</span>
                          <span>🎯 {test.total_marks} Marks</span>
                          <span>⚡ Full Proctoring</span>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-[#CBD3C7] flex items-center justify-between">
                        <span className="text-xs font-semibold text-[#2F6B4F]">Ready to Attempt</span>
                        <button
                          onClick={() => setConfirmTest(test)}
                          className="bg-[#14213D] hover:opacity-90 px-4 py-2 text-xs font-semibold text-white transition"
                        >
                          Start Mock Exam &rarr;
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: FULL PACKAGES */}
          {activeTab === 'packages' && (
            <div>
              {packages.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm font-medium text-[#14213D]">No examination packages available at the moment.</p>
                  <p className="text-xs text-[#4B5768]">Please check back soon for comprehensive test series.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {packages.map((pkg) => {
                    const itemKey = `pkg_${pkg.id}`;
                    const applied = appliedCoupons[itemKey];
                    const effectivePrice = applied ? applied.finalPriceInr : pkg.price_inr;

                    return (
                      <div
                        key={pkg.id}
                        className="border border-[#CBD3C7] bg-[#EEF2ED]/60 p-6 flex flex-col justify-between hover:border-[#14213D] transition"
                      >
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span
                              className="border border-[#14213D]/30 px-2.5 py-0.5 text-[10px] font-medium text-[#4B5768]"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {pkg.validity_days} Days Access
                            </span>
                            <div className="text-right">
                              {pkg.is_purchased ? (
                                <span className="text-xs font-bold text-[#2F6B4F]" style={{ fontFamily: 'var(--font-mono)' }}>
                                  ✓ Purchased
                                </span>
                              ) : applied ? (
                                <div>
                                  <span className="text-xs text-[#4B5768] line-through mr-1.5" style={{ fontFamily: 'var(--font-mono)' }}>
                                    ₹{pkg.price_inr}
                                  </span>
                                  <span className="text-xl font-semibold text-[#2F6B4F]" style={{ fontFamily: 'var(--font-mono)' }}>
                                    ₹{effectivePrice}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-xl font-semibold text-[#14213D]" style={{ fontFamily: 'var(--font-mono)' }}>
                                  ₹{pkg.price_inr}
                                </span>
                              )}
                            </div>
                          </div>

                          <div>
                            <h3 className="text-base font-medium text-[#14213D]" style={{ fontFamily: 'var(--font-serif)' }}>
                              {pkg.title}
                            </h3>
                            <p className="text-xs text-[#4B5768] mt-1">{pkg.description}</p>
                          </div>

                          {/* Included Papers */}
                          <div className="border-t border-[#CBD3C7] pt-3 space-y-1.5">
                            <span
                              className="text-[11px] font-medium text-[#4B5768]"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              Includes {pkg.total_tests} Papers:
                            </span>
                            <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                              {pkg.tests && pkg.tests.length > 0 ? (
                                pkg.tests.map((t) => (
                                  <div
                                    key={t.id}
                                    className="flex items-center justify-between text-[11px] text-[#14213D] bg-[#F8FAF7] p-1.5 border border-[#CBD3C7]"
                                    style={{ fontFamily: 'var(--font-mono)' }}
                                  >
                                    <span className="truncate pr-2">{t.title}</span>
                                    <span className="shrink-0 text-[#4B5768]">{t.duration_minutes}m</span>
                                  </div>
                                ))
                              ) : (
                                <p className="text-[10px] text-[#4B5768] italic">Mocks will be added to this series.</p>
                              )}
                            </div>
                          </div>

                          {/* Promo Code Input (Hide if already purchased) */}
                          {!pkg.is_purchased && (
                            <div className="pt-2 border-t border-[#CBD3C7]">
                              <label className="block text-[10px] font-medium uppercase text-[#4B5768] mb-1" style={{ fontFamily: 'var(--font-mono)' }}>
                                Have a promo code?
                              </label>
                              {applied ? (
                                <div className="flex items-center justify-between bg-[#2F6B4F]/10 border border-[#2F6B4F]/30 p-2 text-xs">
                                  <span className="font-semibold text-[#2F6B4F]" style={{ fontFamily: 'var(--font-mono)' }}>
                                    {applied.code} ({applied.discountPercentage}% OFF)
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveCoupon(itemKey)}
                                    className="text-[11px] text-[#A13D3D] hover:underline font-semibold"
                                  >
                                    Remove
                                  </button>
                                </div>
                              ) : (
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. EARLYBIRD"
                                    value={couponInputs[itemKey] || ''}
                                    onChange={(e) =>
                                      setCouponInputs((prev) => ({ ...prev, [itemKey]: e.target.value.toUpperCase() }))
                                    }
                                    className="flex-1 bg-white border border-[#CBD3C7] px-2.5 py-1 text-xs text-[#14213D] uppercase font-mono focus:outline-none focus:border-[#14213D]"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleApplyCoupon(itemKey, pkg.id)}
                                    disabled={validatingCouponKey === itemKey || !couponInputs[itemKey]?.trim()}
                                    className="bg-[#14213D] text-white px-3 py-1 text-xs font-semibold hover:opacity-90 disabled:opacity-50 transition"
                                  >
                                    {validatingCouponKey === itemKey ? '...' : 'Apply'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Purchase Action or Enrolled Badge */}
                        <div className="pt-6">
                          {pkg.is_purchased ? (
                            <div className="w-full bg-[#2F6B4F]/15 border border-[#2F6B4F]/40 py-3 text-xs font-semibold text-[#2F6B4F] text-center" style={{ fontFamily: 'var(--font-mono)' }}>
                              ✓ Active Access Enrolled
                            </div>
                          ) : (
                            <button
                              onClick={() => handleRazorpayPurchase({ packageId: pkg.id, title: pkg.title })}
                              disabled={buyingId === itemKey}
                              className="w-full bg-[#A9791F] hover:bg-[#8F6519] py-3 text-xs font-semibold text-white disabled:opacity-50 transition"
                            >
                              {buyingId === itemKey ? 'Connecting Gateway...' : `Unlock Package (₹${effectivePrice})`}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: ATTEMPT HISTORY */}
          {activeTab === 'history' && (
            <div>
              {history.length === 0 ? (
                <p className="text-xs text-[#4B5768] py-8 text-center">
                  No examination attempts recorded yet. Launch your first mock from the enrolled papers tab!
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#14213D]">
                    <thead
                      className="border-b border-[#CBD3C7] bg-[#EEF2ED] uppercase text-[#4B5768] font-medium"
                      style={{ fontFamily: 'var(--font-mono)' }}
                    >
                      <tr>
                        <th className="px-4 py-3">Mock Test</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Percentage</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#CBD3C7]">
                      {history.map((item) => (
                        <tr key={item.attempt_id} className="hover:bg-[#F8FAF7] transition">
                          <td className="px-4 py-3 font-medium text-[#14213D]" style={{ fontFamily: 'var(--font-serif)' }}>
                            {item.test_title}
                            <span
                              className="block text-[10px] text-[#4B5768] font-normal"
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              Attempt #{item.attempt_id}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium" style={{ fontFamily: 'var(--font-mono)' }}>
                            {item.score.toFixed(2)} / {item.total_marks.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[#A9791F]" style={{ fontFamily: 'var(--font-mono)' }}>
                            {item.percentage}%
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 border text-[10px] font-medium ${
                                item.status === 'COMPLETED' || item.status === 'SUBMITTED'
                                  ? 'border-[#2F6B4F]/40 text-[#2F6B4F]'
                                  : 'border-[#A9791F]/40 text-[#A9791F]'
                              }`}
                              style={{ fontFamily: 'var(--font-mono)' }}
                            >
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.status === 'COMPLETED' || item.status === 'SUBMITTED' || item.status === 'AUTO_SUBMITTED' ? (
  <button
    onClick={() => router.push(`/result/${item.attempt_id}`)}
    className="border border-[#14213D]/30 px-3 py-1 text-xs font-medium text-[#14213D] hover:bg-[#14213D]/5 transition"
  >
    View Scorecard &rarr;
  </button>
) : (
  <button
    onClick={() => router.push(`/exam/${item.attempt_id}`)}
    className="bg-[#A9791F] hover:bg-[#8F6519] px-3 py-1 text-xs font-medium text-white transition"
  >
    Resume &rarr;
  </button>
)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* --- Anti-Cheat Pre-Flight Confirmation Modal --- */}
        {confirmTest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="w-full max-w-md border-2 border-[#14213D] bg-[#F8FAF7] p-6 space-y-4">
              <h3 className="text-base font-semibold text-[#14213D]" style={{ fontFamily: 'var(--font-serif)' }}>
                Security Pre-Flight Verification
              </h3>
              <p className="text-xs text-[#14213D] leading-relaxed">
                You are about to launch <span className="text-[#A9791F] font-semibold">{confirmTest.title}</span>. Total duration is{' '}
                <span className="text-[#14213D] font-semibold">{confirmTest.duration_minutes} minutes</span>.
              </p>

              <div
                className="bg-[#EEF2ED] p-3.5 border border-[#CBD3C7] text-[11px] text-[#4B5768] space-y-1.5"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <div className="flex items-center gap-2 text-[#2F6B4F] font-semibold">
                  <span>✓</span> High-Stakes Proctoring Active
                </div>
                <p>• Fullscreen mode is strictly locked upon entrance.</p>
                <p>• Switching browser tabs or minimizing the window triggers violation strikes.</p>
                <p>• Accumulating 3 strikes results in immediate termination and automatic submission.</p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#CBD3C7]">
                <button
                  type="button"
                  onClick={() => setConfirmTest(null)}
                  className="border border-[#14213D]/30 px-4 py-2 text-xs font-medium text-[#4B5768] hover:text-[#14213D] transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmStartExam}
                  disabled={starting}
                  className="bg-[#14213D] hover:opacity-90 px-5 py-2 text-xs font-semibold text-white disabled:opacity-50 transition"
                >
                  {starting ? 'Initializing Environment...' : 'I Agree, Start Exam'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}