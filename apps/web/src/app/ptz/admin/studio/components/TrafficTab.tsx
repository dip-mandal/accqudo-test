'use client';
import React from 'react';

interface TrafficLog {
  id: number;
  path: string;
  method: string;
  status_code: number;
  ip_address: string;
  user_agent: string;
  response_time_ms: number;
  timestamp: string;
}

export default function TrafficTab({ data }: { data: { total_requests: number; unique_visitors: number; logs: TrafficLog[] } }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase">Total Captured Requests</p>
          <p className="text-3xl font-black text-[#16293F] mt-1">{data.total_requests}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm">
          <p className="text-xs font-bold text-stone-400 uppercase">Unique Visitor IPs</p>
          <p className="text-3xl font-black text-emerald-600 mt-1">{data.unique_visitors}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200 bg-stone-50 font-bold text-xs text-stone-700">
          Live Traffic Stream &amp; Metadata
        </div>
        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-100 text-stone-600 border-b border-stone-200 font-mono">
                <th className="p-3">Method / Path</th>
                <th className="p-3">Status</th>
                <th className="p-3">Client IP</th>
                <th className="p-3">Latency</th>
                <th className="p-3">User Agent</th>
                <th className="p-3">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-mono text-[11px]">
              {data.logs.map((l) => (
                <tr key={l.id} className="hover:bg-stone-50">
                  <td className="p-3">
                    <span className={`px-1.5 py-0.5 rounded font-bold mr-2 ${l.method === 'GET' ? 'bg-blue-50 text-blue-700' : 'bg-emerald-50 text-emerald-700'}`}>
                      {l.method}
                    </span>
                    <span className="text-stone-800 font-semibold">{l.path}</span>
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 rounded font-bold ${l.status_code === 200 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {l.status_code}
                    </span>
                  </td>
                  <td className="p-3 text-stone-600">{l.ip_address}</td>
                  <td className="p-3 text-stone-600">{l.response_time_ms} ms</td>
                  <td className="p-3 text-stone-400 truncate max-w-xs" title={l.user_agent}>{l.user_agent}</td>
                  <td className="p-3 text-stone-400">{l.timestamp ? new Date(l.timestamp).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}