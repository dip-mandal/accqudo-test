'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useTestStore } from '@/store/useTestStore';
import { ExamHeader } from '@/components/exam/ExamHeader';
import { QuestionPalette } from '@/components/exam/QuestionPalette';
import { QuestionView } from '@/components/exam/QuestionView';

export default function ExamAttemptPage({ params }: { params: { testId: string } }) {
  const router = useRouter();
  const initSession = useTestStore((state) => state.initSession);
  const attemptId = useTestStore((state) => state.attemptId);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const startTest = async () => {
      try {
        const res = await axios.post(`http://localhost:8000/api/v1/attempts/start/${params.testId}`);
        initSession(res.data);
      } catch (err) {
        console.error('Failed to initialize test attempt', err);
      } finally {
        setLoading(false);
      }
    };
    startTest();
  }, [params.testId, initSession]);

  const handleSubmit = async () => {
    if (!attemptId) return;
    try {
      await axios.post(`http://localhost:8000/api/v1/attempts/${attemptId}/submit`);
      router.push(`/result/${attemptId}`);
    } catch (err) {
      console.error('Failed to submit test', err);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center text-slate-600 font-medium">
        Loading test workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <ExamHeader
        testTitle="GATE CSE: AVL Trees Topic Test 01"
        onTimeExpired={handleSubmit}
        onSubmit={handleSubmit}
      />
      <div className="flex flex-1">
        <QuestionView />
        <QuestionPalette />
      </div>
    </div>
  );
}