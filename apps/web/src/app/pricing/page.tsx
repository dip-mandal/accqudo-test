'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface PackageItem {
  id: number;
  title: string;
  description: string | null;
  price: number;
  validity_days: number;
  test_ids: number[];
}

interface SubscriptionItem {
  id: number;
  package_title: string;
  amount_paid: number;
  is_valid: boolean;
  expires_at: string;
}

interface AppliedCoupon {
  packageId: number;
  code: string;
  discountPercentage: number;
  discountAmount: number;
  finalPriceInr: number;
}

export default function PricingPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [activeSubs, setActiveSubs] = useState<SubscriptionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

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

  async function loadData() {
    try {
      const token = localStorage.getItem('accqudo_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      const [pkgRes, subRes] = await Promise.all([
        fetch(`${apiBase}/payments/packages`, { headers }),
        fetch(`${apiBase}/payments/my-subscriptions`, { headers }),
      ]);

      if (pkgRes.ok) setPackages(await pkgRes.json());
      if (subRes.ok) setActiveSubs(await subRes.json());
    } catch (err: any) {
      setBanner({ text: err.message || 'Error loading pricing data.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRazorpayScript();
    loadData();
  }, [apiBase]);

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

  // Razorpay Checkout handler using backend-calculated order amounts
  const executeRazorpayCheckout = async (pkg: PackageItem) => {
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

      // Sync the final discounted price explicitly from backend order response
      const backendDiscountedInr = orderData.amount / 100;
      if (applied) {
        setAppliedCoupons((prev) => ({
          ...prev,
          [pkg.id]: {
            ...applied,
            finalPriceInr: backendDiscountedInr,
          },
        }));
      }

      const options: Record<string, any> = {
        key: orderData.key_id,
        amount: orderData.amount, // Exact paise amount from backend order creation
        currency: orderData.currency || 'INR',
        name: 'Accqudo Examination Suite',
        description: applied
          ? `Enrollment: ${pkg.title} (${applied.code} applied)`
          : `Enrollment: ${pkg.title}`,
        order_id: orderData.order_id,
        prefill: {
          name: orderData.prefill?.name || '',
          email: orderData.prefill?.email || '',
        },
        theme: {
          color: '#4f46e5',
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
              text: `Enrollment confirmed for ${pkg.title}! Refreshing subscriptions...`,
              type: 'success',
            });

            setProcessingId(null);
            loadData();
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

  const hasActiveSub = activeSubs.some((s) => s.is_valid);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-xs font-semibold">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 mx-auto animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-slate-500">Loading Pricing &amp; Passes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-5xl space-y-10">

        <div className="text-center space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Assessment Access Control
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900">GATE 2027 Test Series Passes</h1>
          <p className="text-sm text-slate-500 max-w-xl mx-auto">
            Unlock complete subject-wise test series, full-length grand mock examinations, and live cohort percentile rankings.
          </p>
        </div>

        {banner && (
          <div
            className={`rounded-xl p-4 text-xs font-semibold border transition ${
              banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : banner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-indigo-50 border-indigo-200 text-indigo-800'
            }`}
          >
            {banner.text}
          </div>
        )}

        {hasActiveSub && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                ✓
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Active Membership Enrolled</p>
                <p className="text-xs text-emerald-700">
                  {activeSubs[0]?.package_title} — Valid through {new Date(activeSubs[0]?.expires_at).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg bg-emerald-700 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-800"
            >
              Go to Exams
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {packages.map((pkg) => {
            const isSubscribed = activeSubs.some((s) => s.package_title === pkg.title && s.is_valid);
            const couponApplied = appliedCoupons[pkg.id];
            const currentPrice = couponApplied ? couponApplied.finalPriceInr : pkg.price;

            return (
              <div
                key={pkg.id}
                className={`rounded-2xl border bg-white p-6 shadow-sm flex flex-col justify-between transition-all ${
                  isSubscribed ? 'border-emerald-300 ring-2 ring-emerald-500/20' : 'border-slate-200'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-bold text-indigo-700">
                      Tier: Test Series Pro
                    </span>
                    <span className="text-xs text-slate-400">{pkg.validity_days} Days Access</span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{pkg.title}</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">{pkg.description}</p>

                  <div className="border-t border-slate-100 pt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Full Access to Grand Mocks &amp; Upcoming Tests
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Real-Time Redis Percentile &amp; AIR Simulation
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-emerald-600 font-bold">✓</span> Question-Level Atomic Diagnostics &amp; KaTeX Solutions
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Have a Promo Coupon?
                    </label>
                    {couponApplied ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 border border-emerald-200">
                        <div>
                          <span className="text-xs font-mono font-bold text-emerald-800">{couponApplied.code}</span>
                          <span className="block text-[10px] text-emerald-700 font-medium">
                            {couponApplied.discountPercentage}% Discount Applied (-₹{couponApplied.discountAmount})
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(pkg.id)}
                          className="text-[10px] font-bold text-rose-600 hover:text-rose-800 underline"
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
                          className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-2.5 py-1.5 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none uppercase"
                        />
                        <button
                          type="button"
                          onClick={() => handleApplyCoupon(pkg.id)}
                          disabled={validatingCouponId === pkg.id || !couponInputs[pkg.id]?.trim()}
                          className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-800 disabled:opacity-40 transition"
                        >
                          {validatingCouponId === pkg.id ? '...' : 'Apply'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400">All Inclusive</span>
                    {couponApplied ? (
                      <div>
                        <span className="text-xs text-slate-400 line-through mr-1.5">₹{pkg.price.toFixed(0)}</span>
                        <span className="text-2xl font-black text-emerald-600">₹{currentPrice}</span>
                      </div>
                    ) : (
                      <p className="text-2xl font-black text-slate-900">₹{pkg.price.toFixed(0)}</p>
                    )}
                  </div>

                  {isSubscribed ? (
                    <span className="rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">
                      Active
                    </span>
                  ) : (
                    <button
                      onClick={() => executeRazorpayCheckout(pkg)}
                      disabled={processingId === pkg.id}
                      className="rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition flex items-center gap-2"
                    >
                      {processingId === pkg.id ? (
                        <>
                          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          <span>Connecting...</span>
                        </>
                      ) : (
                        <span>Subscribe Now (₹{currentPrice})</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}