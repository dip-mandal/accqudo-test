'use client';

import React, { useState } from 'react';
import { MathRenderer } from '@/components/MathRenderer';

export function KaTeXScratchpad({ onClose }: { onClose: () => void }) {
  const [scratchText, setScratchText] = useState(
    'Rough work / formula draft:\n$T(n) = 2T(n/2) + O(n)$\nUsing Master Theorem: Case 2 $\\Rightarrow O(n \\log n)$'
  );

  return (
    <div className="fixed bottom-6 left-6 z-50 w-96 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl text-white select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">KaTeX Formula Scratchpad</span>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
      </div>

      <textarea
        value={scratchText}
        onChange={(e) => setScratchText(e.target.value)}
        rows={4}
        placeholder="Type rough notes or LaTeX math ($...$)..."
        className="my-3 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
      />

      <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 max-h-36 overflow-y-auto">
        <p className="text-[10px] font-bold uppercase text-slate-500 pb-1">Live LaTeX Render</p>
        <div className="text-xs text-slate-300">
          <MathRenderer content={scratchText} />
        </div>
      </div>
    </div>
  );
}