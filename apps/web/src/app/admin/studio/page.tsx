'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import OverviewTab from './components/OverviewTab';
import TrafficTab from './components/TrafficTab';
import DatabaseTab from './components/DatabaseTab';
import AdminsTab from './components/AdminsTab';

export default function SuperAdminStudioPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'overview' | 'traffic' | 'database' | 'admins'>('overview');
  const [loading, setLoading] = useState(true);
  const [unauthorized, setUnauthorized] = useState(false);

  const [overviewData, setOverviewData] = useState<any>(null);
  const [trafficData, setTrafficData] = useState<any>(null);
  const [databaseSchema, setDatabaseSchema] = useState<any>(null);
  const [adminsList, setAdminsList] = useState<any[]>([]);

  // Safe API Base resolver that targets local proxy or absolute env endpoint
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  const fetchStudioData = async () => {
    const token = localStorage.getItem('accqudo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [ovRes, trRes, dbRes, adRes] = await Promise.all([
        fetch(`${apiBase}/super-admin/overview`, { headers }),
        fetch(`${apiBase}/super-admin/traffic`, { headers }),
        fetch(`${apiBase}/super-admin/database-schema`, { headers }),
        fetch(`${apiBase}/super-admin/admins`, { headers }),
      ]);

      if (ovRes.status === 403 || trRes.status === 403) {
        setUnauthorized(true);
        setLoading(false);
        return;
      }

      if (ovRes.ok) setOverviewData(await ovRes.json());
      if (trRes.ok) setTrafficData(await trRes.json());
      if (dbRes.ok) setDatabaseSchema(await dbRes.json());
      if (adRes.ok) setAdminsList(await adRes.json());
    } catch (err) {
      console.error('Failed to load Super Admin Studio telemetry:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudioData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-stone-900 text-stone-300 font-mono text-xs">
        Authenticating Super Admin Security Clearance &amp; System Telemetry...
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-stone-950 text-white p-6 text-center space-y-4">
        <div className="h-16 w-16 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center text-2xl font-bold">!</div>
        <h1 className="text-xl font-black">ACCESS RESTRICTED: SUPER ADMIN ONLY</h1>
        <p className="text-xs text-stone-400 max-w-md">This control center studio is strictly isolated for Super Administrators. Normal administrative personnel do not have clearance.</p>
        <button onClick={() => router.push('/dashboard')} className="bg-indigo-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
          Return to Portal
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-stone-900 text-white px-8 py-4 flex items-center justify-between border-b border-stone-800">
        <div className="flex items-center gap-3">
          <span className="font-serif font-bold text-lg tracking-tight text-amber-400">accqudo<span className="text-white">.</span>studio</span>
          <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
            Super Admin Control Center
          </span>
        </div>
        <button onClick={() => router.push('/dashboard')} className="text-xs font-semibold text-stone-400 hover:text-white transition">
          Exit Studio &rarr;
        </button>
      </header>

      {/* Navigation Sub-bar */}
      <div className="bg-white border-b border-stone-200 px-8 flex gap-6 text-xs font-bold">
        {[
          { key: 'overview', label: 'System Overview' },
          { key: 'traffic', label: 'Live Traffic & IPs' },
          { key: 'database', label: 'Database Inspector' },
          { key: 'admins', label: 'Admin Access Control' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`py-4 border-b-2 transition ${activeTab === tab.key ? 'border-[#16293F] text-[#16293F]' : 'border-transparent text-stone-400 hover:text-stone-700'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'overview' && overviewData && <OverviewTab data={overviewData} />}
        {activeTab === 'traffic' && trafficData && <TrafficTab data={trafficData} />}
        {activeTab === 'database' && databaseSchema && <DatabaseTab tables={databaseSchema.tables} />}
        {activeTab === 'admins' && <AdminsTab admins={adminsList} onRefresh={fetchStudioData} />}
      </main>
    </div>
  );
}