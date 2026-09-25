'use client';
import React from 'react';

interface OverviewProps {
  data: {
    total_users: number;
    total_audit_logs: number;
    traffic_last_24h: number;
    database_engine: string;
  };
}

export default function OverviewTab({ data }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-base font-bold font-serif text-[#16293F]">System Vitals &amp; Performance Telemetry</h2>
        <p className="text-xs text-stone-500 mt-0.5">Real-time aggregate overview of platform activity, database engine configuration, and user statistics.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Registered Users</p>
          <p className="text-3xl font-black text-[#16293F] mt-2">{data.total_users}</p>
          <p className="text-[11px] text-stone-500 mt-1">Active student &amp; admin accounts</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">Total Audit Logs</p>
          <p className="text-3xl font-black text-blue-600 mt-2">{data.total_audit_logs}</p>
          <p className="text-[11px] text-stone-500 mt-1">Tracked HTTP requests system-wide</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">24-Hour Activity</p>
          <p className="text-3xl font-black text-emerald-600 mt-2">{data.traffic_last_24h}</p>
          <p className="text-[11px] text-stone-500 mt-1">Requests processed in the past day</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-[#16293F]">Environment &amp; Engine Diagnostics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex justify-between">
            <span className="text-stone-500">Database Driver Engine:</span>
            <span className="font-bold text-stone-800">{data.database_engine.toUpperCase()} / MySQL</span>
          </div>
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 flex justify-between">
            <span className="text-stone-500">Security Clearance Guard:</span>
            <span className="font-bold text-emerald-700">Super Admin Mode Active</span>
          </div>
        </div>
      </div>
    </div>
  );
}