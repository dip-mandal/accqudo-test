'use client';

import React, { useEffect, useState } from 'react';
import { Clock, ShieldAlert } from 'lucide-react';
import { useTestStore } from '@/store/useTestStore';

interface ExamHeaderProps {
  testTitle: string;
  onTimeExpired: () => void;
  onSubmit: () => void;
}

export const ExamHeader: React.FC<ExamHeaderProps> = ({
  testTitle,
  onTimeExpired,
  onSubmit,
}) => {
  const expiresAt = useTestStore((state) => state.expiresAt);
  const [timeLeft, setTimeLeft] = useState<string>('00:00:00');
  const [isWarning, setIsWarning] = useState<boolean>(false);

  useEffect(() => {
    if (!expiresAt) return;

    const target = new Date(expiresAt).getTime();

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = target - now;

      if (diff <= 0) {
        setTimeLeft('00:00:00');
        onTimeExpired();
        return;
      }

      if (diff <= 5 * 60 * 1000) {
        setIsWarning(true);
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);
    return () => clearInterval(timerId);
  }, [expiresAt, onTimeExpired]);

  return (
    <header className="h-16 border-b bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center space-x-3">
        <span className="font-extrabold text-xl tracking-tight text-blue-700">accqudo</span>
        <span className="text-slate-300">|</span>
        <h1 className="font-semibold text-slate-800 text-sm md:text-base">{testTitle}</h1>
      </div>

      <div className="flex items-center space-x-6">
        <div
          className={`flex items-center space-x-2 font-mono text-base font-bold px-3 py-1.5 rounded-md border ${
            isWarning
              ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse'
              : 'bg-slate-100 text-slate-700 border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>{timeLeft}</span>
        </div>

        <button
          onClick={onSubmit}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          Submit Test
        </button>
      </div>
    </header>
  );
};