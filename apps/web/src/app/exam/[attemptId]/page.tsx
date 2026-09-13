'use client';

import React, {
  useEffect,
  useState,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  useParams,
  useRouter,
  useSearchParams,
} from 'next/navigation';
import katex from 'katex';
import {
  Clock,
  Bookmark,
  Eraser,
  ArrowLeft,
  ArrowRight,
  Globe,
} from 'lucide-react';

interface OptionItem {
  id?: string;
  key?: string;
  text?: string;
}

interface QuestionItem {
  snapshot_id: number;
  id?: number;
  order: number;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  question_text: any;
  options: any;
  marks: number;
  negative_marks: number;
  student_response: any;
  is_visited: boolean;
  is_marked_for_review: boolean;
}

interface ExamSessionData {
  attempt_id: number;
  test_id: number;
  status: string;
  started_at: string;
  expires_at: string;
  test_title?: string;
  questions: QuestionItem[];
}

type Language = 'en' | 'hi' | 'bn';

const UI_TRANSLATIONS: Record<
  Language,
  Record<string, string>
> = {
  en: {
    'Securing Environment & Encrypting Exam Session...':
      'Securing Environment & Encrypting Exam Session...',
    'Proctoring Guard Active': 'Proctoring Guard Active',
    'Scientific Calc': 'Scientific Calc',
    'Scientific Calculator': 'Scientific Calculator',
    'KaTeX Scratchpad': 'KaTeX Scratchpad',
    'KaTeX Formula Scratchpad': 'KaTeX Formula Scratchpad',
    Question: 'Question',
    Marks: 'Marks',
    Negative: 'Negative',
    'Mark for Review': 'Mark for Review',
    'Marked for Review': 'Marked for Review',
    'Clear Response': 'Clear Response',
    Previous: 'Previous',
    'Save & Next': 'Save & Next',
    'Question Palette': 'Question Palette',
    Answered: 'Answered',
    'Not Answered': 'Not Answered',
    'Not Visited': 'Not Visited',
    'Marked Review': 'Marked Review',
    'Submit Test': 'Submit Test',
    Submitting: 'Submitting...',
    'Are you sure you want to submit the examination?':
      'Are you sure you want to submit the examination?',
    'Submission failed.': 'Submission failed.',
    'Error submitting exam:': 'Error submitting exam:',
    'Full-Screen Required': 'Full-Screen Required',
    'Re-enter Full Screen': 'Re-enter Full Screen',
    'Exam security requires an active full-screen lock. Exiting full-screen is recorded as an infringement event.':
      'Exam security requires an active full-screen lock. Exiting full-screen is recorded as an infringement event.',
    'SECURITY INFRACTION DETECTED':
      'SECURITY INFRACTION DETECTED',
    'You switched tabs or moved focus away from the test window.':
      'You switched tabs or moved focus away from the test window.',
    Strike: 'Strike',
    'of 3': 'of 3',
    'On the 3rd strike, your examination will be terminated and submitted immediately.':
      'On the 3rd strike, your examination will be terminated and submitted immediately.',
    'I Understand & Agree': 'I Understand & Agree',
    'Enter Numerical Value:': 'Enter Numerical Value:',
    'e.g. 12.5': 'e.g. 12.5',
    'Translating question stem & options into':
      'Translating question stem & options into',
    'Live LaTeX Render': 'Live LaTeX Render',
    'Type rough notes or LaTeX math ($...$)...':
      'Type rough notes or LaTeX math ($...$)...',
    'Official GATE Examination Interface Emulation':
      'Official GATE Examination Interface Emulation',
    'PROCTORING TERMINATION: Test auto-submitted due to 3 security violations.':
      'PROCTORING TERMINATION: Test auto-submitted due to 3 security violations.',
  },
  hi: {
    'Securing Environment & Encrypting Exam Session...':
      'परीक्षा वातावरण सुरक्षित और परीक्षा सत्र एन्क्रिप्ट किया जा रहा है...',
    'Proctoring Guard Active': 'प्रॉक्टरिंग सुरक्षा सक्रिय',
    'Scientific Calc': 'वैज्ञानिक कैलकुलेटर',
    'Scientific Calculator': 'वैज्ञानिक कैलकुलेटर',
    'KaTeX Scratchpad': 'स्क्रैचपैड',
    'KaTeX Formula Scratchpad': 'KaTeX फ़ॉर्मूला स्क्रैचपैड',
    Question: 'प्रश्न',
    Marks: 'अंक',
    Negative: 'नकारात्मक',
    'Mark for Review': 'समीक्षा के लिए चिह्नित करें',
    'Marked for Review': 'समीक्षा के लिए चिह्नित',
    'Clear Response': 'उत्तर साफ़ करें',
    Previous: 'पिछला',
    'Save & Next': 'सहेजें और अगला',
    'Question Palette': 'प्रश्न पट्टिका',
    Answered: 'उत्तर दिया गया',
    'Not Answered': 'उत्तर नहीं दिया गया',
    'Not Visited': 'देखा नहीं गया',
    'Marked Review': 'समीक्षा के लिए चिह्नित',
    'Submit Test': 'परीक्षा जमा करें',
    Submitting: 'जमा किया जा रहा है...',
    'Are you sure you want to submit the examination?':
      'क्या आप परीक्षा जमा करना चाहते हैं?',
    'Submission failed.': 'परीक्षा जमा नहीं की जा सकी।',
    'Error submitting exam:': 'परीक्षा जमा करने में त्रुटि:',
    'Full-Screen Required': 'फुल-स्क्रीन आवश्यक है',
    'Re-enter Full Screen': 'फुल-स्क्रीन में पुनः प्रवेश करें',
    'Exam security requires an active full-screen lock. Exiting full-screen is recorded as an infringement event.':
      'परीक्षा की सुरक्षा के लिए सक्रिय फुल-स्क्रीन आवश्यक है। फुल-स्क्रीन से बाहर निकलना सुरक्षा उल्लंघन के रूप में दर्ज किया जाएगा।',
    'SECURITY INFRACTION DETECTED': 'सुरक्षा उल्लंघन का पता चला',
    'You switched tabs or moved focus away from the test window.':
      'आपने टैब बदला या परीक्षा विंडो से बाहर चले गए।',
    Strike: 'उल्लंघन',
    'of 3': 'में से 3',
    'On the 3rd strike, your examination will be terminated and submitted immediately.':
      'तीसरे उल्लंघन पर आपकी परीक्षा समाप्त कर दी जाएगी और तुरंत जमा कर दी जाएगी।',
    'I Understand & Agree': 'मैं समझता/समझती हूँ और सहमत हूँ',
    'Enter Numerical Value:': 'संख्यात्मक मान दर्ज करें:',
    'e.g. 12.5': 'उदाहरण: 12.5',
    'Translating question stem & options into':
      'प्रश्न और विकल्पों का अनुवाद किया जा रहा है',
    'Live LaTeX Render': 'लाइव LaTeX रेंडर',
    'Type rough notes or LaTeX math ($...$)...':
      'रफ नोट्स या LaTeX गणित ($...$) लिखें...',
    'Official GATE Examination Interface Emulation':
      'आधिकारिक GATE परीक्षा इंटरफ़ेस',
    'PROCTORING TERMINATION: Test auto-submitted due to 3 security violations.':
      'प्रॉक्टरिंग समाप्ति: 3 सुरक्षा उल्लंघनों के कारण परीक्षा स्वतः जमा कर दी गई है।',
  },
  bn: {
    'Securing Environment & Encrypting Exam Session...':
      'পরীক্ষার পরিবেশ নিরাপদ এবং পরীক্ষা সেশন এনক্রিপ্ট করা হচ্ছে...',
    'Proctoring Guard Active': 'প্রক্টরিং নিরাপত্তা সক্রিয়',
    'Scientific Calc': 'বৈজ্ঞানিক ক্যালকুলেটর',
    'Scientific Calculator': 'বৈজ্ঞানিক ক্যালকুলেটর',
    'KaTeX Scratchpad': 'স্ক্র্যাচপ্যাড',
    'KaTeX Formula Scratchpad': 'KaTeX ফর্মুলা স্ক্র্যাচপ্যাড',
    Question: 'প্রশ্ন',
    Marks: 'নম্বর',
    Negative: 'নেগেটিভ',
    'Mark for Review': 'পর্যালোচনার জন্য চিহ্নিত করুন',
    'Marked for Review': 'পর্যালোচনার জন্য চিহ্নিত',
    'Clear Response': 'উত্তর মুছে ফেলুন',
    Previous: 'পূর্ববর্তী',
    'Save & Next': 'সংরক্ষণ করুন এবং পরবর্তী',
    'Question Palette': 'প্রশ্ন প্যালেট',
    Answered: 'উত্তর দেওয়া হয়েছে',
    'Not Answered': 'উত্তর দেওয়া হয়নি',
    'Not Visited': 'দেখা হয়নি',
    'Marked Review': 'পর্যালোচনার জন্য চিহ্নিত',
    'Submit Test': 'পরীক্ষা জমা দিন',
    Submitting: 'জমা দেওয়া হচ্ছে...',
    'Are you sure you want to submit the examination?':
      'আপনি কি পরীক্ষা জমা দিতে চান?',
    'Submission failed.': 'পরীক্ষা জমা দেওয়া যায়নি।',
    'Error submitting exam:': 'পরীক্ষা জমা দেওয়ার সময় ত্রুটি:',
    'Full-Screen Required': 'ফুল-স্ক্রিন প্রয়োজন',
    'Re-enter Full Screen': 'ফুল-স্ক্রিনে পুনরায় প্রবেশ করুন',
    'Exam security requires an active full-screen lock. Exiting full-screen is recorded as an infringement event.':
      'পরীক্ষার নিরাপত্তার জন্য সক্রিয় ফুল-স্ক্রিন প্রয়োজন। ফুল-স্ক্রিন থেকে বের হলে তা নিরাপত্তা লঙ্ঘন হিসেবে রেকর্ড হবে।',
    'SECURITY INFRACTION DETECTED': 'নিরাপত্তা লঙ্ঘন শনাক্ত হয়েছে',
    'You switched tabs or moved focus away from the test window.':
      'আপনি ট্যাব পরিবর্তন করেছেন বা পরীক্ষা উইন্ডো থেকে অন্যত্র গেছেন।',
    Strike: 'লঙ্ঘন',
    'of 3': 'এর মধ্যে ৩',
    'On the 3rd strike, your examination will be terminated and submitted immediately.':
      'তৃতীয় লঙ্ঘনের পর আপনার পরীক্ষা বন্ধ হয়ে যাবে এবং সঙ্গে সঙ্গে জমা দেওয়া হবে।',
    'I Understand & Agree': 'আমি বুঝেছি এবং সম্মত',
    'Enter Numerical Value:': 'সংখ্যাগত মান লিখুন:',
    'e.g. 12.5': 'উদাহরণ: 12.5',
    'Translating question stem & options into':
      'প্রশ্ন ও বিকল্পের অনুবাদ করা হচ্ছে',
    'Live LaTeX Render': 'লাইভ LaTeX রেন্ডার',
    'Type rough notes or LaTeX math ($...$)...':
      'রাফ নোট বা LaTeX গণিত ($...$) লিখুন...',
    'Official GATE Examination Interface Emulation':
      'অফিসিয়াল GATE পরীক্ষা ইন্টারফেস',
    'PROCTORING TERMINATION: Test auto-submitted due to 3 security violations.':
      'প্রক্টরিং সমাপ্তি: ৩টি নিরাপত্তা লঙ্ঘনের কারণে পরীক্ষা স্বয়ংক্রিয়ভাবে জমা দেওয়া হয়েছে।',
  },
};

export default function ProctoredExamPlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const attemptId = params?.attemptId as string;
  const rawLang = searchParams.get('lang');

  const lockedLang: Language =
    rawLang === 'hi' || rawLang === 'bn' ? rawLang : 'en';

  const apiBase =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    'http://localhost:8000/api/v1';

  const [session, setSession] = useState<ExamSessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState<Record<number, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [visited, setVisited] = useState<Record<number, boolean>>({});

  const [translatedQuestion, setTranslatedQuestion] = useState<string>('');
  const [translatedOptions, setTranslatedOptions] = useState<OptionItem[]>([]);
  const [isTranslatingContent, setIsTranslatingContent] = useState<boolean>(false);

  const [isFullscreen, setIsFullscreen] = useState(true);
  const [tabStrikes, setTabStrikes] = useState(0);
  const [showStrikeWarning, setShowStrikeWarning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [showCalc, setShowCalc] = useState(false);
  const [showScratchpad, setShowScratchpad] = useState(false);
  const [calcInput, setCalcInput] = useState('0');
  const [calcIsRad, setCalcIsRad] = useState(true);
  const [scratchText, setScratchText] = useState(
    'Rough work / formula draft:\n$T(n) = 2T(n/2) + O(n)$\nUsing Master Theorem: Case 2 $\\Rightarrow O(n \\log n)$'
  );

  const isSubmittingRef = useRef(false);

  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isTimerWarning, setIsTimerWarning] = useState(false);

  const translateUI = useCallback(
    (text: string): string => {
      return UI_TRANSLATIONS[lockedLang]?.[text] || text;
    },
    [lockedLang]
  );

  const playWarningBeep = () => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {
      // Ignore audio context errors
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('accqudo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    fetch(`${apiBase}/attempts/${attemptId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Failed to load assessment room.');
        }
        return res.json();
      })
      .then((data: ExamSessionData) => {
        if (
          data.status === 'SUBMITTED' ||
          data.status === 'COMPLETED' ||
          data.status === 'AUTO_SUBMITTED'
        ) {
          router.replace(`/result/${attemptId}`);
          return;
        }

        setSession(data);

        const initResp: Record<number, any> = {};
        const initMarked: Record<number, boolean> = {};
        const initVisited: Record<number, boolean> = {};

        data.questions.forEach((q, idx) => {
          if (q.student_response !== null && q.student_response !== undefined) {
            initResp[q.snapshot_id] = q.student_response;
          }
          if (q.is_marked_for_review) {
            initMarked[q.snapshot_id] = true;
          }
          if (q.is_visited || idx === 0) {
            initVisited[q.snapshot_id] = true;
          }
        });

        setResponses(initResp);
        setMarkedForReview(initMarked);
        setVisited(initVisited);

        const targetExpiry = new Date(data.expires_at).getTime();
        const now = Date.now();
        const initialSeconds = Math.max(
          0,
          Math.floor((targetExpiry - now) / 1000)
        );

        setSecondsRemaining(initialSeconds > 0 ? initialSeconds : 180 * 60);
      })
      .catch((err) => {
        alert(err.message);
        router.push('/dashboard');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [attemptId, apiBase, router]);

  const currentQ = session ? session.questions[currentIndex] : null;

  let rawParsedOptions: OptionItem[] = [];
  if (currentQ && Array.isArray(currentQ.options)) {
    rawParsedOptions = currentQ.options.map((opt: any, i: number) => {
      if (typeof opt === 'string') {
        return {
          key: String.fromCharCode(65 + i),
          text: opt,
          id: String.fromCharCode(65 + i),
        };
      }
      const keyStr = opt.key || opt.id || String.fromCharCode(65 + i);
      return {
        key: keyStr,
        id: keyStr,
        text: opt.text || opt.value || '',
      };
    });
  }

  const translateString = async (
    text: string,
    targetLang: string
  ): Promise<string> => {
    if (!text || targetLang === 'en') {
      return text;
    }
    try {
      const url =
        `https://translate.googleapis.com/translate_a/single` +
        `?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json && json[0]) {
        return json[0].map((item: any) => item[0]).join('');
      }
    } catch (e) {
      console.error('Client translation fetch error:', e);
    }
    return text;
  };

  useEffect(() => {
    let cancelled = false;

    async function loadTranslatedContent() {
      if (!currentQ) return;

      let rawQ = '';
      if (typeof currentQ.question_text === 'string') {
        rawQ = currentQ.question_text;
      } else {
        rawQ = currentQ.question_text?.raw || JSON.stringify(currentQ.question_text);
      }

      if (lockedLang === 'en') {
        setTranslatedQuestion(rawQ);
        setTranslatedOptions(rawParsedOptions);
        setIsTranslatingContent(false);
        return;
      }

      setIsTranslatingContent(true);

      try {
        const transQ = await translateString(rawQ, lockedLang);
        if (cancelled) return;
        setTranslatedQuestion(transQ);

        const transOpts = await Promise.all(
          rawParsedOptions.map(async (opt) => {
            const transOptText = opt.text
              ? await translateString(opt.text, lockedLang)
              : '';
            return {
              ...opt,
              text: transOptText,
            };
          })
        );

        if (cancelled) return;
        setTranslatedOptions(transOpts);
      } catch (err) {
        console.error('Translation failed:', err);
        if (!cancelled) {
          setTranslatedQuestion(rawQ);
          setTranslatedOptions(rawParsedOptions);
        }
      } finally {
        if (!cancelled) {
          setIsTranslatingContent(false);
        }
      }
    }

    loadTranslatedContent();

    return () => {
      cancelled = true;
    };
  }, [currentIndex, lockedLang, session]);

  const handleSubmitExam = useCallback(
    async (isForcedByProctor = false) => {
      if (isSubmittingRef.current) return;
      isSubmittingRef.current = true;
      setIsSubmitting(true);

      const token = localStorage.getItem('accqudo_token');

      try {
        const res = await fetch(`${apiBase}/attempts/${attemptId}/submit`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          if (res.status === 400) {
            router.replace(`/result/${attemptId}`);
            return;
          }
          throw new Error(errorData.detail || 'Submission failed.');
        }

        if (isForcedByProctor) {
          alert(
            translateUI(
              'PROCTORING TERMINATION: Test auto-submitted due to 3 security violations.'
            )
          );
        }

        router.replace(`/result/${attemptId}`);
      } catch (e: any) {
        router.replace(`/result/${attemptId}`);
      }
    },
    [apiBase, attemptId, router, translateUI]
  );

  useEffect(() => {
    if (secondsRemaining === null) return;
    if (secondsRemaining <= 0) {
      handleSubmitExam(false);
      return;
    }
    if (secondsRemaining <= 5 * 60) {
      setIsTimerWarning(true);
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, handleSubmitExam]);

  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        }
      } catch (e) {
        setIsFullscreen(false);
      }
    };

    enterFullscreen();

    const handleFullscreenChange = () => {
      if (isSubmittingRef.current) return;
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      } else {
        setIsFullscreen(true);
      }
    };

    const handleVisibilityChange = () => {
      if (isSubmittingRef.current) return;
      if (document.hidden) {
        playWarningBeep();
        setTabStrikes((prev) => {
          const nextStrikes = prev + 1;
          if (nextStrikes >= 3) {
            handleSubmitExam(true);
          } else {
            setShowStrikeWarning(true);
          }
          return nextStrikes;
        });
      }
    };

    const handleWindowBlur = () => {
      if (isSubmittingRef.current) return;
      if (!document.hidden) {
        playWarningBeep();
        setTabStrikes((prev) => {
          const nextStrikes = prev + 1;
          if (nextStrikes >= 3) {
            handleSubmitExam(true);
          } else {
            setShowStrikeWarning(true);
          }
          return nextStrikes;
        });
      }
    };

    const preventCopyPaste = (e: ClipboardEvent) => e.preventDefault();
    const preventContextMenu = (e: MouseEvent) => e.preventDefault();
    const preventKeyShortcuts = (e: KeyboardEvent) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey &&
          ['c', 'v', 'u', 's', 'p', 'a'].includes(e.key.toLowerCase()))
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('cut', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('contextmenu', preventContextMenu);
    window.addEventListener('keydown', preventKeyShortcuts);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('cut', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
      window.removeEventListener('keydown', preventKeyShortcuts);
    };
  }, [handleSubmitExam]);

  const formatTime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m
      .toString()
      .padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const saveAnswerToBackend = async (
    snapshotId: number,
    val: any,
    isReview = false
  ) => {
    if (isSubmittingRef.current) return;
    const token = localStorage.getItem('accqudo_token');

    try {
      await fetch(`${apiBase}/attempts/${attemptId}/save-answer`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          snapshot_id: snapshotId,
          response: val,
          is_visited: true,
          is_marked_for_review: isReview,
        }),
      });
    } catch (e) {
      console.error('Autosave failed:', e);
    }
  };

  const MathRenderer = ({
  content,
  className = '',
}: {
  content: string;
  className?: string;
}) => {
  const parts = useMemo(() => {
    if (!content) return [];

    const imageRegex =
      /!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)/g;

    const result: Array<
      | {
          type: 'text';
          content: string;
        }
      | {
          type: 'image';
          src: string;
          alt: string;
        }
    > = [];

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = imageRegex.exec(content)) !== null) {
      // Text before the image
      if (match.index > lastIndex) {
        const text = content.slice(lastIndex, match.index);

        if (text) {
          result.push({
            type: 'text',
            content: text,
          });
        }
      }

      // Validate image URL
      try {
        const url = new URL(match[2]);

        if (url.protocol === 'https:' || url.protocol === 'http:') {
          result.push({
            type: 'image',
            src: url.toString(),
            alt: match[1] || 'Diagram',
          });
        }
      } catch {
        // If URL is invalid, keep the original Markdown as text.
        result.push({
          type: 'text',
          content: match[0],
        });
      }

      lastIndex = match.index + match[0].length;
    }

    // Remaining text after the final image
    if (lastIndex < content.length) {
      result.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    // If there were no images at all
    if (result.length === 0) {
      result.push({
        type: 'text',
        content,
      });
    }

    return result;
  }, [content]);

  return (
    <div
      className={`w-full text-slate-200 leading-relaxed ${className}`}
    >
      {parts.map((part, index) => {
        if (part.type === 'image') {
          return (
            <div
              key={`image-${index}`}
              className="my-5 flex w-full justify-center"
            >
              <img
                src={part.src}
                alt={part.alt}
                className="max-w-full max-h-[520px] rounded-lg border border-slate-700 object-contain"
                loading="lazy"
                draggable={false}
              />
            </div>
          );
        }

        return (
          <span
            key={`text-${index}`}
            dangerouslySetInnerHTML={{
              __html: renderMathText(part.content),
            }}
          />
        );
      })}
    </div>
  );
};

/**
 * Render LaTeX inside normal question text.
 */
function renderMathText(text: string): string {
  if (!text) return '';

  // Escape normal HTML first.
  let formatted = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  // Display math: $$ ... $$
  formatted = formatted.replace(
    /\$\$([\s\S]*?)\$\$/g,
    (_, math: string) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch {
        return math;
      }
    }
  );

  // Inline math: $ ... $
  formatted = formatted.replace(
    /\$([^\$\n]+?)\$/g,
    (_, math: string) => {
      try {
        return katex.renderToString(math.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch {
        return math;
      }
    }
  );

  // Preserve line breaks.
  return formatted.replace(/\r?\n/g, '<br />');
}

  if (loading || !session || !currentQ) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white text-xs font-semibold">
        {translateUI('Securing Environment & Encrypting Exam Session...')}
      </div>
    );
  }

  const totalQuestions = session.questions.length;
  const currentResp = responses[currentQ.snapshot_id];
  const safeResp = currentResp !== undefined && currentResp !== null ? currentResp : '';

  const handleSelectOption = (key: string) => {
    if (currentQ.question_type === 'MCQ') {
      const newAns = [key];
      setResponses((prev) => ({
        ...prev,
        [currentQ.snapshot_id]: newAns,
      }));
      saveAnswerToBackend(
        currentQ.snapshot_id,
        newAns,
        markedForReview[currentQ.snapshot_id] || false
      );
    } else if (currentQ.question_type === 'MSQ') {
      let activeList: string[] = Array.isArray(currentResp)
        ? [...currentResp]
        : [];
      if (activeList.includes(key)) {
        activeList = activeList.filter((k) => k !== key);
      } else {
        activeList.push(key);
      }
      setResponses((prev) => ({
        ...prev,
        [currentQ.snapshot_id]: activeList,
      }));
      saveAnswerToBackend(
        currentQ.snapshot_id,
        activeList,
        markedForReview[currentQ.snapshot_id] || false
      );
    }
  };

  const handleNATInput = (val: string) => {
    setResponses((prev) => ({
      ...prev,
      [currentQ.snapshot_id]: val,
    }));
    saveAnswerToBackend(
      currentQ.snapshot_id,
      val,
      markedForReview[currentQ.snapshot_id] || false
    );
  };

  const handleClearResponse = () => {
    setResponses((prev) => {
      const copy = { ...prev };
      delete copy[currentQ.snapshot_id];
      return copy;
    });
    saveAnswerToBackend(
      currentQ.snapshot_id,
      null,
      markedForReview[currentQ.snapshot_id] || false
    );
  };

  const handleToggleReview = () => {
    const nextState = !markedForReview[currentQ.snapshot_id];
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQ.snapshot_id]: nextState,
    }));
    saveAnswerToBackend(
      currentQ.snapshot_id,
      responses[currentQ.snapshot_id] || null,
      nextState
    );
  };

  const navigateToQuestion = (idx: number) => {
    setVisited((prev) => ({
      ...prev,
      [session.questions[idx].snapshot_id]: true,
    }));
    setCurrentIndex(idx);
  };

  const handleCalcAppend = (val: string) => {
    setCalcInput((prev) => (prev === '0' || prev === 'Error' ? val : prev + val));
  };

  const handleCalcClear = () => setCalcInput('0');
  const handleCalcBackspace = () => {
    setCalcInput((prev) => (prev.length > 1 ? prev.slice(0, -1) : '0'));
  };

  const handleCalcCalculate = () => {
    try {
      const expr = calcInput
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/\^/g, '**')
        .replace(/π/g, 'Math.PI')
        .replace(/e/g, 'Math.E');

      const fn = new Function('Math', `return ${expr};`);
      const res = fn(Math);
      setCalcInput(String(Number(res.toFixed(8))));
    } catch {
      setCalcInput('Error');
    }
  };

  const applyMathFunc = (fnName: string) => {
    try {
      const val = parseFloat(calcInput);
      let result = 0;
      const angle = calcIsRad ? val : (val * Math.PI) / 180;

      switch (fnName) {
        case 'sin':
          result = Math.sin(angle);
          break;
        case 'cos':
          result = Math.cos(angle);
          break;
        case 'tan':
          result = Math.tan(angle);
          break;
        case 'ln':
          result = Math.log(val);
          break;
        case 'log10':
          result = Math.log10(val);
          break;
        case 'sqrt':
          result = Math.sqrt(val);
          break;
        case 'sq':
          result = Math.pow(val, 2);
          break;
        case 'inv':
          result = 1 / val;
          break;
        default:
          return;
      }
      setCalcInput(String(Number(result.toFixed(8))));
    } catch {
      setCalcInput('Error');
    }
  };

  const languageLabel =
    lockedLang === 'hi' ? 'हिन्दी' : lockedLang === 'bn' ? 'বাংলা' : 'English';

  return (
    <div className="flex h-screen flex-col bg-slate-950 text-slate-100 select-none overflow-hidden font-sans">
      {!isFullscreen && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/95 p-6 backdrop-blur-md">
          <div className="max-w-md text-center space-y-4">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-500/20 text-rose-500 text-2xl font-bold">
              !
            </div>
            <h2 className="text-xl font-black text-white">
              {translateUI('Full-Screen Required')}
            </h2>
            <p className="text-xs text-slate-400">
              {translateUI(
                'Exam security requires an active full-screen lock. Exiting full-screen is recorded as an infringement event.'
              )}
            </p>
            <button
              onClick={() => {
                document.documentElement
                  .requestFullscreen()
                  .then(() => setIsFullscreen(true))
                  .catch(() => {});
              }}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-xs font-bold uppercase tracking-wider text-white shadow-lg hover:bg-indigo-500 transition"
            >
              {translateUI('Re-enter Full Screen')}
            </button>
          </div>
        </div>
      )}

      {showStrikeWarning && !isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl border border-rose-800 bg-slate-900 p-6 shadow-2xl text-center space-y-4">
            <h3 className="text-base font-extrabold text-rose-400">
              {translateUI('SECURITY INFRACTION DETECTED')}
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {translateUI('You switched tabs or moved focus away from the test window.')}
            </p>
            <div className="rounded-lg bg-rose-950/60 border border-rose-900 p-3 text-xs font-bold text-rose-200">
              {translateUI('Strike')} {tabStrikes} {translateUI('of 3')}
            </div>
            <p className="text-[11px] text-slate-400">
              {translateUI(
                'On the 3rd strike, your examination will be terminated and submitted immediately.'
              )}
            </p>
            <button
              onClick={() => setShowStrikeWarning(false)}
              className="w-full rounded-lg bg-rose-600 py-2.5 text-xs font-bold text-white hover:bg-rose-500"
            >
              {translateUI('I Understand & Agree')}
            </button>
          </div>
        </div>
      )}

      <header className="flex h-16 items-center justify-between border-b border-slate-800 bg-slate-900/90 px-6">
        <div className="flex items-center space-x-3">
          <span className="font-extrabold text-xl tracking-tight text-indigo-400">
            accqudo
          </span>
          <span className="text-slate-700">|</span>
          <h1 className="font-semibold text-slate-200 text-sm md:text-base">
            {session.test_title || `Attempt #${session.attempt_id}`}
          </h1>
          <div className="flex items-center gap-2 ml-4">
            <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-md px-2.5 py-1 text-xs text-indigo-300 font-semibold">
              <Globe className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {languageLabel} ({lockedLang === 'en' ? 'Locked' : lockedLang === 'hi' ? 'लॉक' : 'লক'})
              </span>
            </div>
            <button
              onClick={() => setShowCalc(!showCalc)}
              className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              {translateUI('Scientific Calc')}
            </button>
            <button
              onClick={() => setShowScratchpad(!showScratchpad)}
              className="rounded-md border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              {translateUI('KaTeX Scratchpad')}
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-[11px] font-semibold text-emerald-400">
              {translateUI('Proctoring Guard Active')}
            </span>
            {tabStrikes > 0 && (
              <span className="rounded bg-rose-900/80 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                {translateUI('Strike')}: {tabStrikes}/3
              </span>
            )}
          </div>

          <div
            className={`flex items-center space-x-2 font-mono text-base font-bold px-3 py-1.5 rounded-md border ${
              isTimerWarning
                ? 'bg-rose-950/60 text-rose-400 border-rose-800 animate-pulse'
                : 'bg-slate-950 text-amber-400 border-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>
              {secondsRemaining !== null ? formatTime(secondsRemaining) : '03:00:00'}
            </span>
          </div>

          <button
            onClick={() => {
              if (confirm(translateUI('Are you sure you want to submit the examination?'))) {
                handleSubmitExam(false);
              }
            }}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? translateUI('Submitting') : translateUI('Submit Test')}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex flex-1 flex-col justify-between border-r border-slate-800 bg-slate-950 p-8 overflow-y-auto">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-3">
                <span className="text-base font-extrabold text-white">
                  {translateUI('Question')} {currentQ.order}
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-300">
                  {currentQ.question_type}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="text-emerald-400">
                  +{currentQ.marks} {translateUI('Marks')}
                </span>
                <span className="text-rose-400">
                  -{currentQ.negative_marks} {translateUI('Negative')}
                </span>
              </div>
            </div>

            <div className="text-sm leading-relaxed text-slate-200 font-medium">
              {isTranslatingContent ? (
                <div className="text-xs text-indigo-400 font-mono animate-pulse py-4">
                  {translateUI('Translating question stem & options into')} {languageLabel}...
                </div>
              ) : (
                <MathRenderer content={translatedQuestion} />
              )}
            </div>

            {currentQ.question_type !== 'NAT' ? (
              <div className="space-y-3 pt-4">
                {translatedOptions.map((opt) => {
                  const key = opt.key || '';
                  const isChecked =
                    Array.isArray(currentResp) && currentResp.includes(key);

                  return (
                    <div
                      key={key}
                      onClick={() => handleSelectOption(key)}
                      className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 text-xs font-medium transition ${
                        isChecked
                          ? 'border-indigo-500 bg-indigo-950/40 text-white'
                          : 'border-slate-800 bg-slate-900/40 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div
                        className={`flex h-6 w-6 shrink-0 items-center justify-center font-bold text-xs ${
                          currentQ.question_type === 'MCQ'
                            ? 'rounded-full'
                            : 'rounded-md'
                        } border ${
                          isChecked
                            ? 'border-indigo-400 bg-indigo-600 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-400'
                        }`}
                      >
                        {key}
                      </div>
                      <div className="text-sm flex-1">
                        <MathRenderer content={opt.text || ''} />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="pt-6 max-w-xs space-y-2">
                <label className="text-xs font-bold text-slate-400">
                  {translateUI('Enter Numerical Value:')}
                </label>
                <input
                  type="number"
                  step="any"
                  value={safeResp}
                  onChange={(e) => handleNATInput(e.target.value)}
                  placeholder={translateUI('e.g. 12.5')}
                  className="w-full rounded-xl border border-slate-800 bg-slate-900 p-3 text-base font-mono font-bold text-white focus:border-indigo-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-800/80 pt-6 mt-6">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleReview}
                className={`flex items-center space-x-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
                  markedForReview[currentQ.snapshot_id]
                    ? 'bg-purple-600 text-white'
                    : 'border border-slate-800 bg-slate-900 text-slate-300 hover:border-slate-700'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span>
                  {markedForReview[currentQ.snapshot_id]
                    ? translateUI('Marked for Review')
                    : translateUI('Mark for Review')}
                </span>
              </button>

              <button
                onClick={handleClearResponse}
                className="flex items-center space-x-1.5 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
              >
                <Eraser className="w-3.5 h-3.5" />
                <span>{translateUI('Clear Response')}</span>
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => currentIndex > 0 && navigateToQuestion(currentIndex - 1)}
                disabled={currentIndex === 0}
                className="flex items-center space-x-1 rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-40"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{translateUI('Previous')}</span>
              </button>

              <button
                onClick={() =>
                  currentIndex < totalQuestions - 1 &&
                  navigateToQuestion(currentIndex + 1)
                }
                disabled={currentIndex === totalQuestions - 1}
                className="flex items-center space-x-1 rounded-lg bg-indigo-600 px-6 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-40"
              >
                <span>{translateUI('Save & Next')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </main>

        <aside className="w-80 flex flex-col justify-between bg-slate-900/60 p-6 border-l border-slate-800">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              {translateUI('Question Palette')}
            </h3>
            <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 mb-6 font-medium">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                {translateUI('Answered')}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500" />
                {translateUI('Not Answered')}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-purple-600" />
                {translateUI('Marked Review')}
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-slate-800 border border-slate-700" />
                {translateUI('Not Visited')}
              </div>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-96 overflow-y-auto pr-1">
              {session.questions.map((q, idx) => {
                const resp = responses[q.snapshot_id];
                const isAnswered =
                  resp !== undefined && resp !== null && resp !== '' && (Array.isArray(resp) ? resp.length > 0 : true);
                const isMarked = markedForReview[q.snapshot_id];
                const isVis = visited[q.snapshot_id];
                const isCur = idx === currentIndex;

                let color = 'bg-slate-800 text-slate-400 border border-slate-700';
                if (isMarked) {
                  color = 'bg-purple-600 text-white';
                } else if (isAnswered) {
                  color = 'bg-emerald-600 text-white';
                } else if (isVis) {
                  color = 'bg-rose-500 text-white';
                }

                return (
                  <button
                    key={q.snapshot_id}
                    onClick={() => navigateToQuestion(idx)}
                    className={`h-10 rounded-lg text-xs font-bold flex items-center justify-center transition ${color} ${
                      isCur
                        ? 'ring-2 ring-indigo-400 ring-offset-2 ring-offset-slate-950 scale-105'
                        : 'hover:opacity-80'
                    }`}
                  >
                    {q.order}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[10px] text-slate-500">
            {translateUI('Official GATE Examination Interface Emulation')}
          </div>
        </aside>

        {showCalc && (
          <div className="absolute top-4 left-4 z-40 w-80 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl backdrop-blur-xl text-white select-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                  {translateUI('Scientific Calculator')}
                </span>
                <button
                  onClick={() => setCalcIsRad(!calcIsRad)}
                  className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300"
                >
                  {calcIsRad ? 'RAD' : 'DEG'}
                </button>
              </div>
              <button
                onClick={() => setShowCalc(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="my-3 rounded-lg bg-slate-950 p-3 text-right font-mono text-xl font-bold tracking-tight text-emerald-400 overflow-x-auto">
              {calcInput}
            </div>

            <div className="grid grid-cols-5 gap-1.5 text-xs font-semibold">
              <button onClick={() => applyMathFunc('sin')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">sin</button>
              <button onClick={() => applyMathFunc('cos')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">cos</button>
              <button onClick={() => applyMathFunc('tan')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">tan</button>
              <button onClick={handleCalcClear} className="rounded bg-rose-600/80 p-2 text-white hover:bg-rose-500 font-bold">C</button>
              <button onClick={handleCalcBackspace} className="rounded bg-slate-800 p-2 hover:bg-slate-700">⌫</button>

              <button onClick={() => applyMathFunc('ln')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">ln</button>
              <button onClick={() => applyMathFunc('log10')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">log</button>
              <button onClick={() => handleCalcAppend('(')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">(</button>
              <button onClick={() => handleCalcAppend(')')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">)</button>
              <button onClick={() => handleCalcAppend('÷')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">÷</button>

              <button onClick={() => applyMathFunc('sqrt')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">√</button>
              <button onClick={() => handleCalcAppend('7')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">7</button>
              <button onClick={() => handleCalcAppend('8')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">8</button>
              <button onClick={() => handleCalcAppend('9')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">9</button>
              <button onClick={() => handleCalcAppend('×')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">×</button>

              <button onClick={() => applyMathFunc('sq')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">x²</button>
              <button onClick={() => handleCalcAppend('4')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">4</button>
              <button onClick={() => handleCalcAppend('5')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">5</button>
              <button onClick={() => handleCalcAppend('6')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">6</button>
              <button onClick={() => handleCalcAppend('-')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">-</button>

              <button onClick={() => applyMathFunc('inv')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">1/x</button>
              <button onClick={() => handleCalcAppend('1')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">1</button>
              <button onClick={() => handleCalcAppend('2')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">2</button>
              <button onClick={() => handleCalcAppend('3')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">3</button>
              <button onClick={() => handleCalcAppend('+')} className="rounded bg-indigo-600/80 p-2 text-white hover:bg-indigo-500">+</button>

              <button onClick={() => handleCalcAppend('π')} className="rounded bg-slate-800 p-2 hover:bg-slate-700">π</button>
              <button onClick={() => handleCalcAppend('0')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">0</button>
              <button onClick={() => handleCalcAppend('.')} className="rounded bg-slate-800/50 p-2 hover:bg-slate-700">.</button>
              <button onClick={handleCalcCalculate} className="col-span-2 rounded bg-emerald-600 p-2 text-white font-bold hover:bg-emerald-500">=</button>
            </div>
          </div>
        )}

        {showScratchpad && (
          <div className="absolute top-4 left-80 ml-4 z-40 w-96 rounded-2xl border border-slate-700 bg-slate-900 p-4 shadow-2xl text-white select-none">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                {translateUI('KaTeX Formula Scratchpad')}
              </span>
              <button
                onClick={() => setShowScratchpad(false)}
                className="text-slate-400 hover:text-white text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <textarea
              value={scratchText}
              onChange={(e) => setScratchText(e.target.value)}
              rows={4}
              placeholder={translateUI('Type rough notes or LaTeX math ($...$)...')}
              className="my-3 w-full rounded-lg border border-slate-800 bg-slate-950 p-2 text-xs font-mono text-slate-200 focus:border-indigo-500 focus:outline-none"
            />

            <div className="rounded-lg border border-slate-800 bg-slate-950/80 p-3 max-h-36 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase text-slate-500 pb-1">
                {translateUI('Live LaTeX Render')}
              </p>
              <div className="text-xs text-slate-300">
                <MathRenderer content={scratchText} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}