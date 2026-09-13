'use client';

import React from 'react';
import axios from 'axios';
import { useTestStore } from '@/store/useTestStore';
import { Bookmark, Eraser, ArrowLeft, ArrowRight } from 'lucide-react';

export const QuestionView: React.FC = () => {
  const {
    attemptId,
    questions,
    currentIndex,
    setCurrentIndex,
    responses,
    setAnswer,
    markedForReview,
    toggleMarkForReview,
    clearAnswer,
  } = useTestStore();

  const currentQ = questions[currentIndex];
  if (!currentQ) return <div className="p-8">Loading question...</div>;

  const response = responses[currentQ.id];

  const handleOptionSelect = async (optId: string) => {
    let nextResponse: any;
    if (currentQ.question_type === 'MCQ') {
      nextResponse = [optId];
    } else if (currentQ.question_type === 'MSQ') {
      const currentList: string[] = Array.isArray(response) ? response : [];
      nextResponse = currentList.includes(optId)
        ? currentList.filter((x) => x !== optId)
        : [...currentList, optId];
    }
    setAnswer(currentQ.id, nextResponse);

    // Persist via Autosave
    await syncAnswerToBackend(currentQ.id, nextResponse, markedForReview[currentQ.id]);
  };

  const handleNatChange = async (val: string) => {
    setAnswer(currentQ.id, val);
    await syncAnswerToBackend(currentQ.id, val, markedForReview[currentQ.id]);
  };

  const syncAnswerToBackend = async (snapshotId: number, answerVal: any, reviewVal: boolean) => {
    try {
      await axios.post(`http://localhost:8000/api/v1/attempts/${attemptId}/save-answer`, {
        snapshot_id: snapshotId,
        response: answerVal,
        is_visited: true,
        is_marked_for_review: reviewVal || false,
      });
    } catch (err) {
      console.error('Failed to sync answer state:', err);
    }
  };

  return (
    <main className="flex-1 flex flex-col h-[calc(100vh-4rem)] bg-white overflow-hidden">
      {/* Question Header Meta */}
      <div className="px-8 py-4 border-b flex justify-between items-center text-sm">
        <div className="font-semibold text-slate-700">
          Question {currentQ.order} ({currentQ.question_type})
        </div>
        <div className="flex space-x-4 text-xs">
          <span className="text-emerald-700 font-medium">+{currentQ.marks} Marks</span>
          <span className="text-rose-600 font-medium">-{currentQ.negative_marks} Neg</span>
        </div>
      </div>

      {/* Question Content */}
      <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
        <div className="text-base text-slate-900 leading-relaxed whitespace-pre-wrap font-medium">
          {currentQ.question_text.raw}
        </div>

        {/* Options Renderer */}
        {currentQ.question_type !== 'NAT' && currentQ.options && (
          <div className="space-y-3 max-w-2xl">
            {currentQ.options.map((opt) => {
              const isSelected =
                Array.isArray(response) && response.includes(opt.id);
              return (
                <div
                  key={opt.id}
                  onClick={() => handleOptionSelect(opt.id)}
                  className={`flex items-center p-3.5 border rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50/60 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold mr-3 ${
                      isSelected
                        ? 'border-blue-600 bg-blue-600 text-white'
                        : 'border-slate-300 text-slate-600'
                    }`}
                  >
                    {opt.id}
                  </div>
                  <span className="text-sm text-slate-800">{opt.text}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Numerical Input Renderer */}
        {currentQ.question_type === 'NAT' && (
          <div className="mt-4 max-w-xs space-y-2">
            <label className="text-xs font-semibold text-slate-600">Enter Numerical Value:</label>
            <input
              type="number"
              step="any"
              value={response || ''}
              onChange={(e) => handleNatChange(e.target.value)}
              placeholder="e.g. 12.5"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
            />
          </div>
        )}
      </div>

      {/* Footer Navigation Bar */}
      <footer className="h-16 border-t px-8 flex items-center justify-between bg-slate-50">
        <div className="flex space-x-3">
          <button
            onClick={() => toggleMarkForReview(currentQ.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-violet-300 text-violet-700 hover:bg-violet-50 rounded-md text-xs font-medium"
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Mark for Review</span>
          </button>
          <button
            onClick={() => clearAnswer(currentQ.id)}
            className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-md text-xs font-medium"
          >
            <Eraser className="w-3.5 h-3.5" />
            <span>Clear Response</span>
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            disabled={currentIndex === 0}
            onClick={() => setCurrentIndex(currentIndex - 1)}
            className="flex items-center space-x-1 px-4 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 disabled:opacity-40 hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>
          <button
            disabled={currentIndex === questions.length - 1}
            onClick={() => setCurrentIndex(currentIndex + 1)}
            className="flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold disabled:opacity-40"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </main>
  );
};