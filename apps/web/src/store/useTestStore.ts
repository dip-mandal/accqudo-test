import { create } from 'zustand';

export type QuestionType = 'MCQ' | 'MSQ' | 'NAT';

export interface QuestionSnapshot {
  id: number;
  order: number;
  question_type: QuestionType;
  question_text: { raw: string };
  options: Array<{ id: string; text: string }> | null;
  marks: number;
  negative_marks: number;
  student_response: any;
  is_visited: boolean;
  is_marked_for_review: boolean;
}

interface TestStore {
  attemptId: number | null;
  testId: number | null;
  currentIndex: number;
  expiresAt: string | null;
  questions: QuestionSnapshot[];
  responses: Record<number, any>; // snapshot_id -> response
  markedForReview: Record<number, boolean>;
  visited: Record<number, boolean>;
  
  initSession: (data: {
    attempt_id: number;
    test_id: number;
    expires_at: string;
    questions: QuestionSnapshot[];
  }) => void;
  setCurrentIndex: (index: number) => void;
  setAnswer: (snapshotId: number, answer: any) => void;
  toggleMarkForReview: (snapshotId: number) => void;
  clearAnswer: (snapshotId: number) => void;
}

export const useTestStore = create<TestStore>((set, get) => ({
  attemptId: null,
  testId: null,
  currentIndex: 0,
  expiresAt: null,
  questions: [],
  responses: {},
  markedForReview: {},
  visited: {},

  initSession: (data) => {
    const initResponses: Record<number, any> = {};
    const initReview: Record<number, boolean> = {};
    const initVisited: Record<number, boolean> = {};

    data.questions.forEach((q, idx) => {
      initResponses[q.id] = q.student_response;
      initReview[q.id] = q.is_marked_for_review;
      initVisited[q.id] = idx === 0 ? true : q.is_visited;
    });

    set({
      attemptId: data.attempt_id,
      testId: data.test_id,
      currentIndex: 0,
      expiresAt: data.expires_at,
      questions: data.questions,
      responses: initResponses,
      markedForReview: initReview,
      visited: initVisited,
    });
  },

  setCurrentIndex: (index: number) => {
    const { questions, visited } = get();
    const currentQ = questions[index];
    if (currentQ) {
      set({
        currentIndex: index,
        visited: { ...visited, [currentQ.id]: true },
      });
    }
  },

  setAnswer: (snapshotId: number, answer: any) => {
    set((state) => ({
      responses: { ...state.responses, [snapshotId]: answer },
    }));
  },

  toggleMarkForReview: (snapshotId: number) => {
    set((state) => ({
      markedForReview: {
        ...state.markedForReview,
        [snapshotId]: !state.markedForReview[snapshotId],
      },
    }));
  },

  clearAnswer: (snapshotId: number) => {
    set((state) => ({
      responses: { ...state.responses, [snapshotId]: null },
    }));
  },
}));