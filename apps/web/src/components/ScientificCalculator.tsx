'use client';

import React, { useState } from 'react';

export function ScientificCalculator({ onClose }: { onClose: () => void }) {
  const [display, setDisplay] = useState('0');
  const [memory, setMemory] = useState<number>(0);
  const [isRad, setIsRad] = useState(true);

  const append = (val: string) => {
    setDisplay((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const clear = () => setDisplay('0');

  const backspace = () => {
    setDisplay((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const calculate = () => {
    try {
      // Safe evaluation mapping common math tokens
      let expr = display
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      // Evaluator with Math scope
      const fn = new Function('Math', `return ${expr};`);
      const res = fn(Math);
      setDisplay(String(Number(res.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  const applyMathFunc = (fnName: string) => {
    try {
      const val = parseFloat(display);
      let result = 0;
      const angle = isRad ? val : (val * Math.PI) / 180;

      switch (fnName) {
        case 'sin': result = Math.sin(angle); break;
        case 'cos': result = Math.cos(angle); break;
        case 'tan': result = Math.tan(angle); break;
        case 'ln': result = Math.log(val); break;
        case 'log10': result = Math.log10(val); break;
        case 'sqrt': result = Math.sqrt(val); break;
        case 'sq': result = Math.pow(val, 2); break;
        case 'inv': result = 1 / val; break;
        default: return;
      }
      setDisplay(String(Number(result.toFixed(8))));
    } catch {
      setDisplay('Error');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl text-white select-none">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Virtual Calculator</span>
          <button
            onClick={() => setIsRad(!isRad)}
            className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300"
          >
            {isRad ? 'RAD' : 'DEG'}
          </button>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold">✕</button>
      </div>

      {/* Screen Readout */}
      <div className="my-3 rounded-lg bg-slate-950 p-3 text-right font-mono text-xl font-bold tracking-tight text-emerald-400 overflow-x-auto">
        {display}
      </div>

      {/* Calculator Buttons */}
      <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
        <button onClick={() => applyMathFunc('sin')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">sin</button>
        <button onClick={() => applyMathFunc('cos')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">cos</button>
        <button onClick={() => applyMathFunc('tan')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">tan</button>
        <button onClick={clear} className="rounded bg-rose-600/80 p-2 text-white hover:bg-rose-500 font-bold">C</button>
        <button onClick={backspace} className="rounded bg-slate-800 p-2 hover:bg-slate-700">⌫</button>

        <button onClick={() => applyMathFunc('ln')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">ln</button>
        <button onClick={() => applyMathFunc('log10')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">log</button>
        <button onClick={() => append('(')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">(</button>
        <button onClick={() => append(')')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">)</button>
        <button onClick={() => append('÷')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">÷</button>

        <button onClick={() => applyMathFunc('sqrt')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">√</button>
        <button onClick={() => append('7')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">7</button>
        <button onClick={() => append('8')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">8</button>
        <button onClick={() => append('9')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">9</button>
        <button onClick={() => append('×')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">×</button>

        <button onClick={() => applyMathFunc('sq')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">x²</button>
        <button onClick={() => append('4')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">4</button>
        <button onClick={() => append('5')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">5</button>
        <button onClick={() => append('6')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">6</button>
        <button onClick={() => append('-')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">-</button>

        <button onClick={() => applyMathFunc('inv')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">1/x</button>
        <button onClick={() => append('1')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">1</button>
        <button onClick={() => append('2')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">2</button>
        <button onClick={() => append('3')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">3</button>
        <button onClick={() => append('+')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">+</button>

        <button onClick={() => append('π')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">π</button>
        <button onClick={() => append('0')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">0</button>
        <button onClick={() => append('.')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">.</button>
        <button onClick={calculate} className="col-span-2 rounded bg-emerald-600 p-2 text-white font-bold hover:bg-emerald-500">=</button>
      </div>
    </div>
  );
}