'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TestSummary {
  id: number;
  title: string;
  duration_minutes: number;
}

interface PackageItem {
  id: number;
  exam_id: number;
  title: string;
  description: string;
  price_inr: number;
  validity_days: number;
  total_tests: number;
  is_purchased?: boolean;
  tests: TestSummary[];
}

interface AppliedCoupon {
  packageId: number;
  code: string;
  discountPercentage: number;
  discountAmount: number;
  finalPriceInr: number;
}

export default function PackageStorePage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<PackageItem[]>([]);
  const [selectedExamFilter, setSelectedExamFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Dedicated UPI ID modal state
  const [selectedPackageForUpi, setSelectedPackageForUpi] = useState<PackageItem | null>(null);
  const [upiIdInput, setUpiIdInput] = useState<string>('');
  const [upiInputError, setUpiInputError] = useState<string>('');

  // Promo Coupon States
  const [couponInputs, setCouponInputs] = useState<Record<number, string>>({});
  const [validatingCouponId, setValidatingCouponId] = useState<number | null>(null);
  const [appliedCoupons, setAppliedCoupons] = useState<Record<number, AppliedCoupon>>({});

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  // Ensure Razorpay Checkout SDK is injected
  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const fetchCatalog = useCallback(async () => {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accqudo_token') || '' : '';
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token.trim()}`;
    }

    const res = await fetch(`${apiBase}/admin/packages/all`, { headers });
    if (!res.ok) throw new Error('Failed to load packages from catalog.');
    const data: PackageItem[] = await res.json();
    setPackages(data);
    setFilteredPackages(data);
  } catch (err: any) {
    setBanner({ text: err.message || 'Error fetching store catalog.', type: 'error' });
  } finally {
    setLoading(false);
  }
}, [apiBase]);

  useEffect(() => {
    loadRazorpayScript();
    fetchCatalog();
  }, [fetchCatalog]);

  const handleFilterChange = (filter: string) => {
    setSelectedExamFilter(filter);
    if (filter === 'ALL') {
      setFilteredPackages(packages);
    } else {
      setFilteredPackages(
        packages.filter(
          (pkg) =>
            pkg.title.toUpperCase().includes(filter) ||
            (pkg.description && pkg.description.toUpperCase().includes(filter))
        )
      );
    }
  };

  // Coupon Validation Handler
  const handleApplyCoupon = async (pkgId: number) => {
    const rawCode = couponInputs[pkgId]?.trim().toUpperCase();
    if (!rawCode) return;

    setValidatingCouponId(pkgId);
    setBanner(null);

    try {
      const res = await fetch(`${apiBase}/admin/coupons/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: rawCode, package_id: pkgId }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Invalid or expired coupon.');

      setAppliedCoupons((prev) => ({
        ...prev,
        [pkgId]: {
          packageId: pkgId,
          code: data.code,
          discountPercentage: data.discount_percentage,
          discountAmount: data.discount_amount,
          finalPriceInr: data.final_price_inr,
        },
      }));

      setBanner({
        text: `Coupon "${data.code}" applied! You saved ₹${data.discount_amount} (${data.discount_percentage}% OFF).`,
        type: 'success',
      });
    } catch (err: any) {
      setBanner({ text: err.message || 'Failed to apply coupon.', type: 'error' });
    } finally {
      setValidatingCouponId(null);
    }
  };

  const handleRemoveCoupon = (pkgId: number) => {
    setAppliedCoupons((prev) => {
      const next = { ...prev };
      delete next[pkgId];
      return next;
    });
    setCouponInputs((prev) => ({ ...prev, [pkgId]: '' }));
    setBanner({ text: 'Promo coupon removed.', type: 'info' });
  };

  // Core Razorpay checkout handler supporting both standard selection and direct VPA
  const executeRazorpayCheckout = async (pkg: PackageItem, customVpa?: string) => {
    const token = localStorage.getItem('accqudo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setBanner({
        text: 'Unable to connect to Razorpay gateway. Please check your internet connection.',
        type: 'error',
      });
      return;
    }

    setProcessingId(pkg.id);
    setBanner({ text: `Generating secure order for ${pkg.title}...`, type: 'info' });

    const applied = appliedCoupons[pkg.id];

    try {
      // 1. Create order on backend (passing optional coupon code)
      const orderRes = await fetch(`${apiBase}/payments/razorpay/create-order`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          package_id: pkg.id,
          coupon_code: applied ? applied.code : null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.detail || 'Failed to initialize payment order.');
      }

      // 2. Build prefill options with custom VPA if provided
      const prefillConfig: Record<string, any> = {
        name: orderData.prefill?.name || '',
        email: orderData.prefill?.email || '',
        contact: orderData.prefill?.contact || '',
        method: 'upi',
      };

      if (customVpa && customVpa.trim()) {
        prefillConfig.vpa = customVpa.trim();
      }

      const options: Record<string, any> = {
        key: orderData.key_id,
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Accqudo Examination Suite',
        description: applied
          ? `Enrollment: ${pkg.title} (${applied.code} applied)`
          : `Enrollment: ${pkg.title}`,
        order_id: orderData.order_id,
        prefill: prefillConfig,
        config: {
          display: {
            blocks: {
              upi: {
                name: 'Pay with UPI (ID / App / QR)',
                instruments: [
                  { method: 'upi', flows: ['collect', 'intent', 'qr'] },
                ],
              },
              other: {
                name: 'Cards / NetBanking / EMI',
                instruments: [
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.upi', 'block.other'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        theme: {
          color: '#4f46e5',
          backdrop_color: 'rgba(2, 6, 23, 0.85)',
        },
        modal: {
          ondismiss: function () {
            setProcessingId(null);
            setBanner({ text: 'Payment window closed.', type: 'info' });
          },
        },
        handler: async function (response: any) {
          setBanner({ text: 'Payment received. Verifying transaction signature...', type: 'info' });
          try {
            const verifyRes = await fetch(`${apiBase}/payments/razorpay/verify-payment`, {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok) {
              throw new Error(verifyData.detail || 'Payment signature verification failed.');
            }

            setBanner({
              text: `Enrollment confirmed for ${pkg.title}! Redirecting to dashboard...`,
              type: 'success',
            });

            setTimeout(() => {
              router.push('/dashboard');
            }, 1200);
          } catch (verifyErr: any) {
            setBanner({ text: `Verification Error: ${verifyErr.message}`, type: 'error' });
            setProcessingId(null);
          }
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (resp: any) {
        setBanner({
          text: `Transaction Declined: ${resp.error.description || 'Payment could not be completed.'}`,
          type: 'error',
        });
        setProcessingId(null);
      });
      rzp.open();
    } catch (err: any) {
      setBanner({ text: err.message || 'Payment initiation failed.', type: 'error' });
      setProcessingId(null);
    }
  };

  const handleOpenUpiModal = (pkg: PackageItem) => {
    setSelectedPackageForUpi(pkg);
    setUpiIdInput('');
    setUpiInputError('');
  };

  const handleConfirmUpiPayment = () => {
    if (!selectedPackageForUpi) return;
    const trimmed = upiIdInput.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setUpiInputError('Please enter a valid UPI ID (e.g. yourname@oksbi or mobile@paytm)');
      return;
    }
    const targetPkg = selectedPackageForUpi;
    setSelectedPackageForUpi(null);
    executeRazorpayCheckout(targetPkg, trimmed);
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white text-xs font-semibold">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
          <p className="text-slate-400">Loading National Test Packages &amp; Payment Gateway...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-indigo-950 border border-indigo-800 px-2.5 py-0.5 text-[10px] font-bold text-indigo-300">
                Official Test Series Store
              </span>
              <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> Promo Coupons &amp; Instant Access
              </span>
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight mt-2">Comprehensive Exam Packages</h1>
            <p className="text-xs text-slate-400 max-w-2xl mt-1">
              Select your examination stream to unlock chapter-wise tests, subject mocks, and full-length national simulation papers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              Candidate Dashboard &rarr;
            </button>
          </div>
        </div>

        {/* Dynamic Notification Banner */}
        {banner && (
          <div
            className={`rounded-xl p-4 text-xs font-semibold border transition ${
              banner.type === 'success'
                ? 'bg-emerald-950/70 border-emerald-800 text-emerald-300'
                : banner.type === 'error'
                ? 'bg-rose-950/70 border-rose-800 text-rose-300'
                : 'bg-indigo-950/70 border-indigo-800 text-indigo-300'
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Stream Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase text-slate-500 mr-2 tracking-wider">Exam Stream:</span>
          {['ALL', 'GATE', 'JEE', 'NEET', 'UPSC'].map((exam) => (
            <button
              key={exam}
              onClick={() => handleFilterChange(exam)}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
                selectedExamFilter === exam
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {exam === 'ALL' ? 'All Packages' : exam}
            </button>
          ))}
        </div>

        {/* Package Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPackages.map((pkg) => {
            const couponApplied = appliedCoupons[pkg.id];
            const currentPrice = couponApplied ? couponApplied.finalPriceInr : pkg.price_inr;

            return (
              <div
                key={pkg.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl hover:border-indigo-500/50 transition relative overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-indigo-950 border border-indigo-800 px-2 py-0.5 text-[10px] font-bold text-indigo-300">
                      {pkg.validity_days} Days Validity
                    </span>
                    <div className="text-right">
                      {couponApplied ? (
                        <div>
                          <span className="text-xs text-slate-500 line-through mr-1.5">₹{pkg.price_inr}</span>
                          <span className="text-2xl font-black text-emerald-400">₹{currentPrice}</span>
                        </div>
                      ) : (
                        <span className="text-2xl font-black text-white">₹{pkg.price_inr}</span>
                      )}
                      <span className="block text-[10px] text-slate-500 font-medium">One-Time Payment</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white leading-snug">{pkg.title}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{pkg.description}</p>
                  </div>

                  {/* Tests Preview Box */}
                  <div className="border-t border-slate-800 pt-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                      <span>Included Papers ({pkg.total_tests}):</span>
                      <span className="text-emerald-400 font-mono text-[10px]">Instant Unlock</span>
                    </div>

                    <div className="max-h-32 overflow-y-auto space-y-1.5 pr-1">
                      {pkg.tests && pkg.tests.length > 0 ? (
                        pkg.tests.map((t) => (
                          <div
                            key={t.id}
                            className="flex items-center justify-between text-[11px] text-slate-300 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80"
                          >
                            <span className="truncate pr-2 font-medium">{t.title}</span>
                            <span className="shrink-0 text-slate-500 font-mono text-[10px]">{t.duration_minutes}m</span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[11px] text-slate-500 italic py-1">Comprehensive mocks will be unlocked.</p>
                      )}
                    </div>
                  </div>

                  {/* Promo Coupon Ingestion Box */}
                  <div className="pt-2 border-t border-slate-800/80">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Have a Promo Coupon?
                    </label>
                    {couponApplied ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-950/40 border border-emerald-800/80">
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-300">{couponApplied.code}</span>
                          <span className="block text-[10px] text-emerald-400 font-medium">
                            {couponApplied.discountPercentage}% Discount Applied (-₹{couponApplied.discountAmount})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(pkg.id)}
                          className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="e.g. GATE2027"
                          value={couponInputs[pkg.id] || ''}
                          onChange={(e) =>
                            setCouponInputs((prev) => ({
                              ...prev,
                              [pkg.id]: e.target.value.toUpperCase(),
                            }))
                          }
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1.5 text-xs font-mono text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(pkg.id)}
                          disabled={validatingCouponId === pkg.id || !couponInputs[pkg.id]?.trim()}
                          className="rounded-lg bg-slate-800 border border-slate-700 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white disabled:opacity-40 transition"
                        >
                          {validatingCouponId === pkg.id ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Channels Footer */}
                  <div className="pt-2 flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60">
                    <span>Supported Methods:</span>
                    <span className="font-semibold text-slate-400">UPI ID, QR, Cards, NetBanking</span>
                  </div>
                </div>

                {/* Purchase Action Buttons */}
                <div className="pt-6 space-y-2">
  {pkg.is_purchased ? (
    <div className="w-full rounded-xl bg-emerald-950/60 border border-emerald-800/80 py-3 text-xs font-bold text-emerald-400 text-center flex items-center justify-center gap-2">
      <span>✓ Enrolled &amp; Active Package</span>
    </div>
  ) : (
    <>
      <button
        onClick={() => handleOpenUpiModal(pkg)}
        disabled={processingId === pkg.id}
        className="w-full rounded-xl bg-emerald-600/20 border border-emerald-500/50 py-2.5 text-xs font-bold text-emerald-300 hover:bg-emerald-600 hover:text-white disabled:opacity-50 transition flex items-center justify-center gap-2"
      >
        <span>⚡ Pay with UPI ID (@upi)</span>
      </button>
      <button
        onClick={() => executeRazorpayCheckout(pkg)}
        disabled={processingId === pkg.id}
        className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-50 shadow-lg shadow-indigo-600/30 transition flex items-center justify-center gap-2"
      >
        <span>All Payment Methods (₹{currentPrice})</span>
      </button>
    </>
  )}
</div>
              </div>
            );
          })}
        </div>

        {filteredPackages.length === 0 && (
          <div className="text-center py-16 space-y-2 border border-dashed border-slate-800 rounded-2xl">
            <p className="text-sm font-semibold text-slate-300">No test series found for the selected filter.</p>
            <p className="text-xs text-slate-500">Select "All Packages" to view every available examination package.</p>
          </div>
        )}

        {/* --- Dedicated UPI ID Entry Modal --- */}
        {selectedPackageForUpi && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 font-bold text-sm">
                    ₹
                  </span>
                  <h3 className="text-base font-bold text-white">Pay via UPI ID (VPA)</h3>
                </div>
                <button
                  onClick={() => setSelectedPackageForUpi(null)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-xs text-slate-300">
                <p>
                  Package: <span className="font-bold text-white">{selectedPackageForUpi.title}</span>
                </p>
                <div className="flex items-center justify-between">
                  <span>Amount Payable:</span>
                  <div>
                    {appliedCoupons[selectedPackageForUpi.id] ? (
                      <div>
                        <span className="text-slate-500 line-through mr-1 text-[11px]">
                          ₹{selectedPackageForUpi.price_inr}
                        </span>
                        <span className="font-bold text-emerald-400 text-sm">
                          ₹{appliedCoupons[selectedPackageForUpi.id].finalPriceInr}
                        </span>
                        <span className="ml-1 text-[10px] text-emerald-500 font-mono">
                          ({appliedCoupons[selectedPackageForUpi.id].code})
                        </span>
                      </div>
                    ) : (
                      <span className="font-bold text-emerald-400 text-sm">
                        ₹{selectedPackageForUpi.price_inr}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-300">Enter your UPI ID / VPA:</label>
                <input
                  type="text"
                  placeholder="e.g. mobile@paytm, name@oksbi, user@apl"
                  value={upiIdInput}
                  onChange={(e) => {
                    setUpiIdInput(e.target.value);
                    if (upiInputError) setUpiInputError('');
                  }}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none font-mono"
                />
                {upiInputError ? (
                  <p className="text-[11px] text-rose-400 font-semibold">{upiInputError}</p>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    A payment request will be sent directly to your UPI application.
                  </p>
                )}
              </div>

              {/* Quick Handle Suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['@okhdfcbank', '@okicici', '@oksbi', '@paytm', '@ybl', '@axl'].map((suffix) => (
                  <button
                    key={suffix}
                    type="button"
                    onClick={() => {
                      const prefix = upiIdInput.split('@')[0] || '';
                      setUpiIdInput(prefix + suffix);
                    }}
                    className="rounded-md border border-slate-800 bg-slate-950 px-2 py-1 text-[10px] font-mono text-slate-400 hover:border-slate-700 hover:text-white"
                  >
                    {suffix}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setSelectedPackageForUpi(null)}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmUpiPayment}
                  className="rounded-lg bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-500 transition shadow-lg shadow-emerald-600/30"
                >
                  Send Payment Request &rarr;
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}