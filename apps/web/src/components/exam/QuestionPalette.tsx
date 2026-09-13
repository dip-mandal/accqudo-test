'use client';

import React from 'react';
import { useTestStore } from '@/store/useTestStore';

export const QuestionPalette: React.FC = () => {
  const { questions, currentIndex, setCurrentIndex, responses, markedForReview, visited } =
    useTestStore();

  const getStatusColor = (id: number, index: number) => {
    const isAnswered = responses[id] !== null && responses[id] !== undefined && responses[id] !== '';
    const isMarked = markedForReview[id];
    const isVis = visited[id];

    if (isAnswered && isMarked) return 'bg-purple-600 text-white'; // Answered & Marked for Review
    if (isMarked) return 'bg-violet-500 text-white'; // Marked for Review
    if (isAnswered) return 'bg-emerald-600 text-white'; // Answered
    if (isVis) return 'bg-rose-500 text-white'; // Not Answered
    return 'bg-slate-100 text-slate-700 border border-slate-300'; // Not Visited
  };

  return (
    <aside className="w-80 border-l bg-white flex flex-col h-[calc(100vh-4rem)]">
      <div className="p-4 border-b font-semibold text-slate-800 text-sm">Question Palette</div>

      <div className="p-4 grid grid-cols-5 gap-2 overflow-y-auto flex-1">
        {questions.map((q, idx) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(idx)}
            className={`h-10 rounded-md font-medium text-sm flex items-center justify-center transition-all ${
              currentIndex === idx ? 'ring-2 ring-blue-600 ring-offset-2' : ''
            } ${getStatusColor(q.id, idx)}`}
          >
            {q.order}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="p-4 border-t bg-slate-50 text-xs space-y-2">
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded bg-emerald-600 inline-block" />
          <span>Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded bg-rose-500 inline-block" />
          <span>Not Answered</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded bg-violet-500 inline-block" />
          <span>Marked for Review</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="w-3.5 h-3.5 rounded bg-slate-200 border border-slate-300 inline-block" />
          <span>Not Visited</span>
        </div>
      </div>
    </aside>
  );
};