'use client';
import React from 'react';

interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  primary_key: boolean;
  foreign_keys: string[];
}

interface TableSchema {
  table_name: string;
  columns_count: number;
  columns: ColumnInfo[];
}

export default function DatabaseTab({ tables }: { tables: TableSchema[] }) {
  return (
    <div className="space-y-6">
      <div className="border-b border-stone-200 pb-4">
        <h2 className="text-base font-bold font-serif text-[#16293F]">Relational Database Schema Inspector</h2>
        <p className="text-xs text-stone-500 mt-0.5">Complete structural breakdown of active SQLAlchemy tables, column types, indexing, and primary/foreign keys.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {tables.map((tbl) => (
          <div key={tbl.table_name} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
              <span className="font-mono font-bold text-sm tracking-wider">📦 TABLE: {tbl.table_name}</span>
              <span className="text-xs font-mono bg-stone-800 px-2.5 py-1 rounded text-stone-300">{tbl.columns_count} Columns</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-stone-200 text-stone-400 text-[10px] uppercase">
                    <th className="pb-2">Column Name</th>
                    <th className="pb-2">Data Type</th>
                    <th className="pb-2">Constraints &amp; Keys</th>
                    <th className="pb-2">Foreign Relations</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-700">
                  {tbl.columns.map((col) => (
                    <tr key={col.name} className="hover:bg-stone-50">
                      <td className="py-2.5 font-bold text-[#16293F]">{col.name}</td>
                      <td className="py-2.5 text-blue-600">{col.type}</td>
                      <td className="py-2.5">
                        {col.primary_key && <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-bold mr-1.5">PK</span>}
                        {!col.nullable && <span className="bg-stone-100 text-stone-600 px-2 py-0.5 rounded text-[10px] font-bold">NOT NULL</span>}
                      </td>
                      <td className="py-2.5 text-purple-600 text-[11px]">
                        {col.foreign_keys.length > 0 ? col.foreign_keys.join(', ') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}