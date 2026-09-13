'use client';

import React, { useState } from 'react';

interface PackageItem {
  id: number;
  title: string;
  description: string | null;
  price: number;
  validity_days: number;
  test_ids: number[];
}

interface CheckoutModalProps {
  pkg: PackageItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CheckoutModal({ pkg, isOpen, onClose, onSuccess }: CheckoutModalProps) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleMockPayment() {
    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('accqudo_token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      };

      // 1. Create order
      const orderRes = await fetch('http://localhost:8000/api/v1/payments/orders/create', {
        method: 'POST',
        headers,
        body: JSON.stringify({ package_id: pkg.id }),
      });

      if (!orderRes.ok) {
        const errData = await orderRes.json();
        throw new Error(errData.detail || 'Failed to create order');
      }

      const orderData = await orderRes.json();

      // 2. Simulate Razorpay/Stripe client webhook verification
      const verifyRes = await fetch('http://localhost:8000/api/v1/payments/orders/verify', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          order_id: orderData.order_id,
          payment_id: `pay_mock_${Math.random().toString(36).substring(2, 10)}`,
        }),
      });

      if (!verifyRes.ok) {
        const errData = await verifyRes.json();
        throw new Error(errData.detail || 'Payment verification failed');
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Payment failed');
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900">Unlock Test Series</h3>
          <button
            onClick={onClose}
            disabled={processing}
            className="text-slate-400 hover:text-slate-600 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        <div className="rounded-xl bg-slate-50 p-4 border border-slate-100 space-y-2">
          <p className="text-xs font-semibold uppercase text-indigo-600">Selected Plan</p>
          <p className="text-sm font-bold text-slate-900">{pkg.title}</p>
          <p className="text-xs text-slate-500">{pkg.description}</p>
          <div className="pt-2 flex justify-between text-xs text-slate-700 border-t border-slate-200">
            <span>Validity</span>
            <span className="font-semibold">{pkg.validity_days} Days</span>
          </div>
          <div className="flex justify-between text-xs text-slate-700">
            <span>Included Tests</span>
            <span className="font-semibold">{pkg.test_ids.length} Mock Tests</span>
          </div>
        </div>

        <div className="flex items-baseline justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500 font-medium">Total Due (INR):</span>
          <span className="text-2xl font-black text-slate-900">₹{pkg.price.toFixed(2)}</span>
        </div>

        {error && (
          <div className="rounded-lg bg-rose-50 border border-rose-100 p-3 text-xs text-rose-700">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <button
            onClick={handleMockPayment}
            disabled={processing}
            className="w-full rounded-xl bg-indigo-600 py-3 text-xs font-bold text-white shadow hover:bg-indigo-500 disabled:opacity-50 transition"
          >
            {processing ? 'Authorizing & Activating...' : `Complete Mock Purchase (₹${pkg.price.toFixed(0)})`}
          </button>
          <p className="text-[10px] text-center text-slate-400">
            Simulated checkout gateway — no real bank charges applied.
          </p>
        </div>
      </div>
    </div>
  );
}