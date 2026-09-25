'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface TelemetryData {
  total_candidates: number;
  active_candidates: number;
  blocked_candidates: number;
  published_tests: number;
  indexed_questions: number;
  gross_revenue_inr: number;
  server_uptime_pct: number;
}

interface PageHeat {
  path: string;
  views: number;
  unique_ips: number;
  avg_latency_ms: number;
}

interface IpTraffic {
  ip: string;
  requests: number;
}

interface CandidateItem {
  id: number;
  full_name: string;
  email: string;
  role: string;
  is_active: boolean;
  created_at: string | null;
}

interface LedgerItem {
  id: number;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  user_email: string;
  amount_inr: number;
  status: string;
  created_at: string | null;
}

interface CouponItem {
  id: number;
  code: string;
  discount_percentage: number;
  max_uses: number;
  times_used: number;
  valid_until: string;
  is_active: boolean;
  is_expired: boolean;
}

interface PurgeableEntity {
  id: number;
  title: string;
  detail: string;
  created_at: string | null;
}

export default function AdminCommandCenterPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  const [activeSection, setActiveSection] = useState<
    'analytics' | 'coupons' | 'purge' | 'users' | 'ledger' | 'broadcast'
  >('analytics');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Telemetry & Real Traffic
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [pageHeat, setPageHeat] = useState<PageHeat[]>([]);
  const [ipTraffic, setIpTraffic] = useState<IpTraffic[]>([]);

  // Coupons
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [newCode, setNewCode] = useState('');
  const [newDiscount, setNewDiscount] = useState<number>(15);
  const [newMaxUses, setNewMaxUses] = useState<number>(100);
  const [newValidDays, setNewValidDays] = useState<number>(30);

  // Visual Purge Studio
  const [purgeScope, setPurgeScope] = useState< 'EXAM' | 'TEST' | 'PACKAGE' | 'QUESTION' | 'CHAPTER' | 'SUBJECT' >('EXAM');
  const [purgeList, setPurgeList] = useState<PurgeableEntity[]>([]);
  const [purgeSearch, setPurgeSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Candidates & Ledger
  const [candidates, setCandidates] = useState<CandidateItem[]>([]);
  const [searchUser, setSearchUser] = useState('');
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);
  const [ledger, setLedger] = useState<LedgerItem[]>([]);

  // Broadcast
  const [bStream, setBStream] = useState('ALL');
  const [bSubject, setBSubject] = useState('');
  const [bMessage, setBMessage] = useState('');
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  // Fetch telemetry and real traffic logs
  const fetchOverview = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token');
    if (!token) return router.push('/login');

    try {
      const res = await fetch(`${apiBase}/admin/overview-telemetry`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401 || res.status === 403) {
        alert('Access denied: Administrator privileges required.');
        return router.push('/dashboard');
      }
      if (res.ok) {
        const data = await res.json();
        setTelemetry(data.telemetry);
        setPageHeat(data.page_view_heat || []);
        setIpTraffic(data.traffic_ip_distribution || []);
      }
    } catch (err: any) {
      setBanner({ text: err.message || 'Telemetry connection error.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, router]);

  // Fetch coupons
  const fetchCoupons = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setCoupons(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [apiBase]);

  // Fetch purgeable entities
  const fetchPurgeList = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/purge/entities?scope=${purgeScope}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setPurgeList(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [apiBase, purgeScope]);

  // Fetch candidates
  const fetchCandidates = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token');
    try {
      let url = `${apiBase}/admin/candidates?limit=100`;
      if (searchUser) url += `&q=${encodeURIComponent(searchUser)}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCandidates(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [apiBase, searchUser]);

  // Fetch ledger
  const fetchLedger = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/financial-ledger?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setLedger(await res.json());
    } catch (e) {
      console.error(e);
    }
  }, [apiBase]);

  useEffect(() => {
    fetchOverview();
    fetchCoupons();
    fetchPurgeList();
    fetchCandidates();
    fetchLedger();
  }, [fetchOverview, fetchCoupons, fetchPurgeList, fetchCandidates, fetchLedger]);

  // Coupon Handlers
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/coupons`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: newCode,
          discount_percentage: newDiscount,
          max_uses: newMaxUses,
          valid_days: newValidDays,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Could not create coupon.');

      setBanner({ text: data.message, type: 'success' });
      setNewCode('');
      fetchCoupons();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  const handleToggleCoupon = async (id: number) => {
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/coupons/${id}/toggle`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (!confirm('Are you sure you want to remove this promo coupon?')) return;
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/coupons/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) fetchCoupons();
    } catch (e) {
      console.error(e);
    }
  };

  // One-Click Direct Purge Handler
  const handleDirectPurge = async (item: PurgeableEntity) => {
    if (!confirm(`Permanently delete ${purgeScope} #${item.id} ("${item.title}")? This action cascades and cannot be undone.`)) {
      return;
    }
    const token = localStorage.getItem('accqudo_token');
    setDeletingId(item.id);
    setBanner(null);

    try {
      const res = await fetch(`${apiBase}/admin/purge/direct/${purgeScope}/${item.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Deletion failed.');

      setBanner({ text: data.message, type: 'success' });
      fetchPurgeList();
      fetchOverview();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  // Candidate Status Toggle
  const handleToggleUserStatus = async (user: CandidateItem) => {
    const token = localStorage.getItem('accqudo_token');
    setUpdatingUserId(user.id);
    try {
      const res = await fetch(`${apiBase}/admin/candidates/${user.id}/status`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !user.is_active }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Status update failed.');
      setBanner({ text: data.message, type: 'success' });
      fetchCandidates();
      fetchOverview();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setUpdatingUserId(null);
    }
  };

  // Broadcast Handler
  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accqudo_token');
    setSendingBroadcast(true);
    try {
      const res = await fetch(`${apiBase}/admin/broadcast-email`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_group: bStream, subject: bSubject, message: bMessage }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Broadcast failed.');
      setBanner({ text: data.message, type: 'success' });
      setBSubject('');
      setBMessage('');
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setSendingBroadcast(false);
    }
  };

  const filteredPurgeList = purgeList.filter(
    (item) =>
      item.title.toLowerCase().includes(purgeSearch.toLowerCase()) ||
      item.detail.toLowerCase().includes(purgeSearch.toLowerCase()) ||
      String(item.id).includes(purgeSearch)
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3] text-[#1F3A5C] text-xs font-semibold">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 mx-auto animate-spin rounded-full border-[3px] border-[#1F3A5C]/20 border-t-[#1F3A5C]" />
          <p className="text-stone-500 font-serif text-sm">Initializing Executive Control Plane...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-stone-800 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Master Control Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl bg-white border border-stone-200 border-t-4 border-t-[#1F3A5C] p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1F3A5C] px-3 py-0.5 text-xs font-bold text-white">
                Platform Control Hub
              </span>
              <span className="text-xs text-stone-500 font-mono">Live Traffic &amp; Production Management</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#16293F] mt-2">Executive Admin Center</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Live route monitoring, visual purge studio, coupon manager, and user access directory.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex flex-wrap items-center gap-3">
            <button
              onClick={() => router.push('/admin/test')}
              className="rounded-lg bg-[#1F3A5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#16293F] transition shadow-sm flex items-center gap-1.5"
            >
              <span>⚙ Question &amp; Paper Studio</span> &rarr;
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
            >
              Candidate Portal
            </button>
            <button
              onClick={() => router.push('/store')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
            >
              Store Catalog
            </button>
          </div>
        </header>

        {/* Banner Alert */}
        {banner && (
          <div
            className={`rounded-xl p-4 text-xs font-semibold border transition ${
              banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : banner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#1F3A5C]/5 border-[#1F3A5C]/20 text-[#1F3A5C]'
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Key Operational KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Gross Revenue</p>
            <p className="mt-1 text-2xl font-bold font-serif text-[#16293F]">₹{telemetry?.gross_revenue_inr.toLocaleString()}</p>
            <p className="text-[10px] text-emerald-700 font-semibold mt-0.5">Confirmed Paid</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Candidates</p>
            <p className="mt-1 text-2xl font-bold font-serif text-[#1F3A5C]">{telemetry?.total_candidates}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">{telemetry?.active_candidates} Active | {telemetry?.blocked_candidates} Blocked</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Active Coupons</p>
            <p className="mt-1 text-2xl font-bold font-serif text-[#B7862C]">{coupons.filter((c) => c.is_active && !c.is_expired).length}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Campaigns Running</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Published Tests</p>
            <p className="mt-1 text-2xl font-bold font-serif text-purple-700">{telemetry?.published_tests}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Available Mocks</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase text-stone-500">Question Items</p>
            <p className="mt-1 text-2xl font-bold font-serif text-stone-800">{telemetry?.indexed_questions}</p>
            <p className="text-[10px] text-stone-500 mt-0.5">Classified Bank</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-white p-4 shadow-sm flex flex-col justify-between">
            <p className="text-[10px] font-bold uppercase text-stone-500">Paper Studio</p>
            <button
              onClick={() => router.push('/admin/test')}
              className="mt-1 w-full rounded bg-stone-100 border border-stone-300 py-1.5 text-xs font-bold text-[#1F3A5C] hover:bg-[#1F3A5C] hover:text-white transition"
            >
              Open Studio &rarr;
            </button>
          </div>
        </div>

        {/* Main Section Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {[
            { id: 'analytics', label: '📊 Real Traffic & Route Analytics' },
            { id: 'purge', label: '🗑 One-Click Visual Purge Studio' },
            { id: 'coupons', label: `🎟 Coupon Promotions (${coupons.length})` },
            { id: 'users', label: `👥 Candidate Access (${candidates.length})` },
            { id: 'ledger', label: `💳 Payment Ledger (${ledger.length})` },
            { id: 'broadcast', label: '📢 Target Email Broadcast' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSection(tab.id as any);
                setBanner(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeSection === tab.id
                  ? 'bg-[#1F3A5C] text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-600 hover:text-[#1F3A5C]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* SECTION 1: REAL DYNAMIC TRAFFIC & ROUTE ANALYTICS                         */}
        {/* ========================================================================= */}
        {activeSection === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Real Route Heatmap */}
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#16293F]">Real Route Hit Density</h3>
                  <p className="text-xs text-stone-500">Live request views, unique visitor IPs, and response latency.</p>
                </div>
                <button
                  onClick={fetchOverview}
                  className="rounded border border-stone-300 px-2.5 py-1 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                >
                  ↻ Refresh Metrics
                </button>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Route Path</th>
                      <th className="px-4 py-2.5 text-right">Hit Count</th>
                      <th className="px-4 py-2.5 text-right">Unique IPs</th>
                      <th className="px-4 py-2.5 text-right">Avg Latency</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {pageHeat.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-6 text-stone-400 italic">
                          No traffic logged yet. Browse pages on the client to see live metrics.
                        </td>
                      </tr>
                    ) : (
                      pageHeat.map((p, idx) => (
                        <tr key={idx} className="hover:bg-stone-50">
                          <td className="px-4 py-2.5 font-mono font-bold text-stone-800">{p.path}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-[#1F3A5C] font-semibold">{p.views.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-emerald-700">{p.unique_ips.toLocaleString()}</td>
                          <td className="px-4 py-2.5 text-right font-mono text-stone-500">{p.avg_latency_ms} ms</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Real Top Client IP Traffic */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#16293F]">Top Active Visitor IPs</h3>
                <p className="text-xs text-stone-500">Highest volume IP addresses interacting with the API cluster.</p>
              </div>

              <div className="space-y-2.5">
                {ipTraffic.length === 0 ? (
                  <p className="text-xs text-stone-400 italic py-4 text-center">No IP records gathered yet.</p>
                ) : (
                  ipTraffic.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg border border-stone-200 bg-stone-50 text-xs">
                      <span className="font-mono font-bold text-stone-700">{item.ip}</span>
                      <span className="rounded bg-white px-2 py-0.5 border border-stone-200 text-stone-600 font-mono text-[11px]">
                        {item.requests} hits
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 2: 1-CLICK VISUAL PURGE STUDIO (NO MANUAL ID CODES)               */}
        {/* ========================================================================= */}
        {activeSection === 'purge' && (
          <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm space-y-5 border-t-4 border-t-rose-600">
            <div>
              <h3 className="text-sm font-bold font-serif text-rose-900">One-Click Visual Purge Studio</h3>
              <p className="text-xs text-rose-700">
                Directly browse items, review child details, and delete items with single-click modal confirmations.
              </p>
            </div>

            {/* Scope Filter Buttons & Search */}
<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1">
  <div className="flex flex-wrap gap-2">
    {[
      { id: 'EXAM', label: 'Exam Streams' },
      { id: 'TEST', label: 'Test Papers' },
      { id: 'PACKAGE', label: 'Packages' },
      { id: 'QUESTION', label: 'Questions' },
      { id: 'CHAPTER', label: 'Chapters' },
      { id: 'SUBJECT', label: 'Subjects' },
    ].map((s) => (
      <button
        key={s.id}
        onClick={() => {
          setPurgeScope(s.id as any);
          setPurgeSearch('');
        }}
        className={`rounded-lg px-3.5 py-1.5 text-xs font-bold transition ${
          purgeScope === s.id
            ? 'bg-rose-600 text-white shadow-sm'
            : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
        }`}
      >
        {s.label}
      </button>
    ))}
  </div>

  <input
    type="text"
    placeholder={`Search in ${purgeScope.toLowerCase()}s...`}
    value={purgeSearch}
    onChange={(e) => setPurgeSearch(e.target.value)}
    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-800 focus:border-rose-500 focus:outline-none w-64"
  />
</div>

            {/* Purgeable Items Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Item Title / Descriptor</th>
                    <th className="px-4 py-2.5">Hierarchy Scope &amp; Weight</th>
                    <th className="px-4 py-2.5 text-right">Purge Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredPurgeList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-6 text-stone-400 italic">
                        No records matching query found in {purgeScope}.
                      </td>
                    </tr>
                  ) : (
                    filteredPurgeList.map((item) => (
                      <tr key={item.id} className="hover:bg-rose-50/40 transition">
                        <td className="px-4 py-2.5 font-mono font-bold text-stone-400">#{item.id}</td>
                        <td className="px-4 py-2.5 font-semibold text-stone-800 max-w-md truncate">{item.title}</td>
                        <td className="px-4 py-2.5 text-stone-500 text-[11px]">{item.detail}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            onClick={() => handleDirectPurge(item)}
                            disabled={deletingId === item.id}
                            className="rounded bg-rose-50 border border-rose-200 px-3 py-1 text-[11px] font-bold text-rose-700 hover:bg-rose-600 hover:text-white transition disabled:opacity-50"
                          >
                            {deletingId === item.id ? 'Purging...' : 'Delete Forever'}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 3: COUPON & PROMOTION MANAGEMENT                                  */}
        {/* ========================================================================= */}
        {activeSection === 'coupons' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Create Coupon Card */}
            <form onSubmit={handleCreateCoupon} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-serif text-[#16293F]">Generate Promo Coupon</h3>
              <p className="text-xs text-stone-500">Provide percentage discounts applicable during store checkout.</p>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Coupon Code</label>
                <input
                  type="text"
                  placeholder="e.g. GATE2027 or EARLYBIRD"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs font-mono font-bold text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Discount %</label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    max="100"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(parseFloat(e.target.value) || 0)}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Max Usages</label>
                  <input
                    type="number"
                    value={newMaxUses}
                    onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 1)}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-stone-500 uppercase mb-1">Validity (Days from now)</label>
                <input
                  type="number"
                  value={newValidDays}
                  onChange={(e) => setNewValidDays(parseInt(e.target.value) || 1)}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-[#1F3A5C] py-2.5 text-xs font-bold text-white hover:bg-[#16293F] transition shadow-sm"
              >
                + Create Coupon
              </button>
            </form>

            {/* Coupons Table */}
            <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold font-serif text-[#16293F]">Active Promo Campaigns</h3>
                  <p className="text-xs text-stone-500">Track usage limits, expire dates, and toggle activation status.</p>
                </div>
                <span className="text-xs font-bold text-[#1F3A5C]">{coupons.length} Active Records</span>
              </div>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                    <tr>
                      <th className="px-4 py-2.5">Code</th>
                      <th className="px-4 py-2.5">Discount</th>
                      <th className="px-4 py-2.5">Uses / Limit</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {coupons.map((c) => (
                      <tr key={c.id} className="hover:bg-stone-50">
                        <td className="px-4 py-2.5 font-mono font-black text-stone-900">{c.code}</td>
                        <td className="px-4 py-2.5 font-bold text-emerald-700">{c.discount_percentage}% OFF</td>
                        <td className="px-4 py-2.5 font-mono text-stone-500">{c.times_used} / {c.max_uses}</td>
                        <td className="px-4 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            c.is_expired
                              ? 'bg-stone-100 text-stone-500'
                              : c.is_active
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {c.is_expired ? 'EXPIRED' : c.is_active ? 'ACTIVE' : 'PAUSED'}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-right space-x-2">
                          <button
                            onClick={() => handleToggleCoupon(c.id)}
                            className="text-[11px] font-bold text-stone-600 hover:text-stone-900 underline"
                          >
                            {c.is_active ? 'Pause' : 'Enable'}
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.id)}
                            className="text-[11px] font-bold text-rose-600 hover:text-rose-800 underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 4: CANDIDATE DIRECTORY & ACCESS CONTROL                           */}
        {/* ========================================================================= */}
        {activeSection === 'users' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold font-serif text-[#16293F]">Candidate Access Directory</h3>
                <p className="text-xs text-stone-500">Manage login credentials, block abuse, and audit roles.</p>
              </div>
              <input
                type="text"
                placeholder="Search candidate name or email..."
                value={searchUser}
                onChange={(e) => setSearchUser(e.target.value)}
                className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-1.5 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none w-64"
              />
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">ID</th>
                    <th className="px-4 py-2.5">Name</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Access Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {candidates.map((c) => (
                    <tr key={c.id} className="hover:bg-stone-50">
                      <td className="px-4 py-2.5 font-mono text-stone-400">#{c.id}</td>
                      <td className="px-4 py-2.5 font-bold text-stone-800">{c.full_name}</td>
                      <td className="px-4 py-2.5 text-stone-600 font-mono text-[11px]">{c.email}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.role === 'ADMIN' || c.role === 'SUPER_ADMIN'
                            ? 'bg-[#1F3A5C] text-white'
                            : 'bg-stone-100 text-stone-600'
                        }`}>
                          {c.role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          c.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {c.is_active ? 'ACTIVE' : 'BLOCKED'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          onClick={() => handleToggleUserStatus(c)}
                          disabled={updatingUserId === c.id}
                          className={`rounded px-3 py-1 text-[11px] font-bold transition ${
                            c.is_active
                              ? 'border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                              : 'border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          }`}
                        >
                          {updatingUserId === c.id ? 'Updating...' : c.is_active ? 'Block Access' : 'Unblock Access'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 5: FINANCIAL LEDGER                                               */}
        {/* ========================================================================= */}
        {activeSection === 'ledger' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#16293F]">Razorpay Global Ledger</h3>
              <p className="text-xs text-stone-500">Live order captures, signatures, and candidate billing records.</p>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="px-4 py-2.5">Order ID</th>
                    <th className="px-4 py-2.5">Candidate Email</th>
                    <th className="px-4 py-2.5">Payment ID</th>
                    <th className="px-4 py-2.5">Amount</th>
                    <th className="px-4 py-2.5">Status</th>
                    <th className="px-4 py-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {ledger.map((tx) => (
                    <tr key={tx.id} className="hover:bg-stone-50">
                      <td className="px-4 py-2.5 font-mono text-[11px] font-bold text-stone-700">{tx.razorpay_order_id}</td>
                      <td className="px-4 py-2.5 text-stone-600">{tx.user_email}</td>
                      <td className="px-4 py-2.5 font-mono text-[11px] text-stone-500">{tx.razorpay_payment_id}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-emerald-700">₹{tx.amount_inr}</td>
                      <td className="px-4 py-2.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          tx.status === 'PAID' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-800'
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-400 text-[10px] font-mono">
                        {tx.created_at ? new Date(tx.created_at).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SECTION 6: SEGMENTED EMAIL BROADCAST                                      */}
        {/* ========================================================================= */}
        {activeSection === 'broadcast' && (
          <form onSubmit={handleSendBroadcast} className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4 max-w-3xl">
            <div>
              <h3 className="text-sm font-bold font-serif text-[#16293F]">Segmented Candidate Broadcast</h3>
              <p className="text-xs text-stone-500">Dispatch notifications to students enrolled in specific streams.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Target Candidate Cohort</label>
                <select
                  value={bStream}
                  onChange={(e) => setBStream(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800"
                >
                  <option value="ALL">All Active Candidates</option>
                  <option value="GATE">GATE CS &amp; IT Candidates</option>
                  <option value="JEE">JEE Main &amp; Advanced Candidates</option>
                  <option value="NEET">NEET UG Medical Candidates</option>
                  <option value="UPSC">UPSC Civil Services Candidates</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-600 mb-1">Subject Header</label>
                <input
                  type="text"
                  placeholder="e.g. Schedule Update: National Mock 02 Released"
                  value={bSubject}
                  onChange={(e) => setBSubject(e.target.value)}
                  required
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">Broadcast Message</label>
              <textarea
                rows={5}
                placeholder="Compose announcement, syllabus modification, or promotional bulletin..."
                value={bMessage}
                onChange={(e) => setBMessage(e.target.value)}
                required
                className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={sendingBroadcast}
              className="rounded-xl bg-[#1F3A5C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#16293F] transition shadow-sm disabled:opacity-50"
            >
              {sendingBroadcast ? 'Dispatching...' : 'Dispatch Broadcast Bulletin \u2192'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}