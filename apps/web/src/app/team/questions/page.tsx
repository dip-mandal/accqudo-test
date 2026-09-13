'use client';

import React, { useEffect, useState, useMemo, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MathRenderer } from '@/components/MathRenderer';

// --- Type Definitions ---

interface ExamHierarchy {
  id: number;
  title: string;
  code: string;
  subjects: {
    id: number;
    name: string;
    chapters: {
      id: number;
      name: string;
      topics: {
        id: number;
        name: string;
      }[];
    }[];
  }[];
}

interface QuestionBankItem {
  id: number;
  question_type: 'MCQ' | 'MSQ' | 'NAT';
  question_text: string;
  default_marks: number;
  default_negative_marks: number;
  topic_name?: string;
  subject_name?: string;
  chapter_name?: string;
}

interface SelectedQuestion {
  question_id: number;
  order: number;
  marks: number;
  negative_marks: number;
  question_type: string;
  question_text: string;
}

interface SubscriptionPackageItem {
  id: number;
  exam_id: number;
  title: string;
  description: string;
  price_inr: number;
  validity_days: number;
  is_active: boolean;
  total_tests: number;
  tests: { id: number; title: string; duration_minutes: number; total_marks: number }[];
}

export default function UnifiedAdminStudioPage() {
  const router = useRouter();
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8001/api/v1').replace(/\/$/, '');

  const [activeTab, setActiveTab] = useState<
    'author_question' | 'assemble_paper' | 'academic_hierarchy'
  >('author_question');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global State
  const [hierarchy, setHierarchy] = useState<ExamHierarchy[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);

  // --- TAB 1: Authoring States ---
  const [qExamId, setQExamId] = useState<number | ''>('');
  const [qSubjectId, setQSubjectId] = useState<number | ''>('');
  const [qChapterId, setQChapterId] = useState<number | ''>('');
  const [qTopicId, setQTopicId] = useState<string>('');
  const [qType, setQType] = useState<'MCQ' | 'MSQ' | 'NAT'>('MCQ');
  const [qText, setQText] = useState('');
  const [qSolution, setQSolution] = useState('');
  const [options, setOptions] = useState([
    { id: 'A', text: '' },
    { id: 'B', text: '' },
    { id: 'C', text: '' },
    { id: 'D', text: '' },
  ]);
  const [correctKeys, setCorrectKeys] = useState('');
  const [natExact, setNatExact] = useState('');
  const [natMin, setNatMin] = useState('');
  const [natMax, setNatMax] = useState('');
  const [qMarks, setQMarks] = useState<number>(1.0);
  const [qNegMarks, setQNegMarks] = useState<number>(0.33);
  const [uploadingDiagram, setUploadingDiagram] = useState(false);
const [uploadingSolutionDiagram, setUploadingSolutionDiagram] = useState(false);
const [savingQuestion, setSavingQuestion] = useState(false);

const diagramInputRef = useRef<HTMLInputElement>(null);
const solutionDiagramInputRef = useRef<HTMLInputElement>(null);

  // --- TAB 2: Test Paper Assembly Canvas States ---
  const [paperExamId, setPaperExamId] = useState<string>('');
  const [paperTitle, setPaperTitle] = useState('');
  const [paperDuration, setPaperDuration] = useState<number>(180);
  const [paperInstructions, setPaperInstructions] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MCQ' | 'MSQ' | 'NAT'>('ALL');
  const [submittingPaper, setSubmittingPaper] = useState(false);

  // --- TAB 3: Academic Hierarchy Management States ---
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [creatingExam, setCreatingExam] = useState(false);

  const [subExamId, setSubExamId] = useState<number | ''>('');
  const [subSubjectName, setSubSubjectName] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);

  const [chapSubjectId, setChapSubjectId] = useState<number | ''>('');
  const [chapName, setChapName] = useState('');
  const [creatingChapter, setCreatingChapter] = useState(false);

  const [topChapterId, setTopChapterId] = useState<number | ''>('');
  const [topName, setTopName] = useState('');
  const [creatingTopic, setCreatingTopic] = useState(false);

  // Core API Data Fetching
  const fetchQuestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/questions/search?q=${searchQuery}`, {
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setQuestionBank(data);
        }
      }
    } catch (e) {
      console.error('Failed to load questions:', e);
    }
  }, [apiBase]);

  const fetchInitialData = useCallback(async () => {
    const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      // Team endpoints perform the authenticated staff-role check server-side.
      const hierRes = await fetch(`${apiBase}/team/hierarchy`, { headers });
      if (hierRes.status === 401 || hierRes.status === 403) {
        alert('Access denied: TEAM, ADMIN, or SUPER_ADMIN privileges required.');
        router.push('/dashboard');
        return;
      }
      if (hierRes.ok) {
        const hierData = await hierRes.json();
        setHierarchy(hierData);
        if (hierData.length > 0) {
          setQExamId(hierData[0].id);
          setPaperExamId(String(hierData[0].id));
        }
      }

      const pkgRes = await fetch(`${apiBase}/team/packages/all`, { headers });
      if (pkgRes.ok) {
        const pkgData = await pkgRes.json();
        setPackages(pkgData);
      }

      await fetchQuestions();
    } catch (err: any) {
      setBanner({ text: err.message || 'Failed connecting to backend CMS services.', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [apiBase, router, fetchQuestions]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Dynamic filter for cascading dropdowns in authoring
  const currentExam = hierarchy.find((e) => e.id === Number(qExamId));
  const currentSubject = currentExam?.subjects?.find((s) => s.id === Number(qSubjectId));
  const currentChapter = currentSubject?.chapters?.find((c) => c.id === Number(qChapterId));

  // Handler: Question Diagram Presigned Upload
  const handleDiagramUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDiagram(true);
    setBanner(null);

    try {
      const token =
        localStorage.getItem('accqudo_token') ||
        localStorage.getItem('token');

      if (!token) {
        throw new Error('Authentication token not found. Please log in again.');
      }

      // Browser image MIME types are normally available, but keep a safe
      // fallback so valid images are not rejected because file.type is empty.
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const contentType = file.type ||
        ({
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          webp: 'image/webp',
          gif: 'image/gif',
          svg: 'image/svg+xml',
        } as Record<string, string>)[ext] ||
        'application/octet-stream';

      if (!contentType.startsWith('image/')) {
        throw new Error('Please select a valid image file.');
      }

      // Step 1: Ask the backend for a presigned R2 upload URL.
      const presignedRes = await fetch(
        `${apiBase}/storage/presigned-upload`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            file_extension: ext,
            content_type: contentType,
            folder: 'questions',
          }),
        }
      );

      if (!presignedRes.ok) {
        let errorMessage = 'Presigned storage allocation rejected.';

        try {
          const errorData = await presignedRes.json();
          errorMessage =
            errorData?.detail ||
            errorData?.message ||
            errorMessage;
        } catch {
          // Keep the default message if the response is not JSON.
        }

        throw new Error(
          `${errorMessage} (HTTP ${presignedRes.status})`
        );
      }

      const presignedData = await presignedRes.json();
      const uploadUrl = presignedData?.upload_url;
      const publicUrl = presignedData?.public_url;

      if (!uploadUrl) {
        console.error('Presigned upload response did not contain upload_url.');
        throw new Error('Backend did not return an upload_url.');
      }

      if (!publicUrl) {
        console.error('Presigned upload response did not contain public_url.');
        throw new Error('Backend did not return a public_url.');
      }

      // IMPORTANT: Do not log the complete presigned URL because it contains
      // temporary signature credentials. Log only its hostname and safe data.
      let uploadUrlHost = 'INVALID_UPLOAD_URL';
      try {
        uploadUrlHost = new URL(uploadUrl).host;
      } catch {
        // The actual PUT below will fail with a useful error if the URL is invalid.
      }

      console.log('R2 presigned upload details:', {
        uploadUrlHost,
        fileKey: presignedData?.file_key,
        publicUrl,
        contentType,
        fileSize: file.size,
      });

      // A presigned R2 URL should be an HTTPS S3 API endpoint. A custom public
      // domain is for reading the finished object, not for the PUT upload.
      if (!/^https:\/\//i.test(uploadUrl)) {
        throw new Error(
          'Backend returned an invalid R2 upload URL. The presigned upload URL must use HTTPS.'
        );
      }

      // Step 2: Upload directly to Cloudflare R2.
      // Do NOT send Authorization here. The presigned URL already authorizes it.
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          // This MUST exactly match the ContentType used when the backend
          // generated the presigned URL.
          'Content-Type': contentType,
        },
        body: file,
      });

      if (!uploadRes.ok) {
        let responseText = '';

        try {
          responseText = await uploadRes.text();
        } catch {
          // Ignore response parsing failure.
        }

        console.error('R2 upload failed:', {
          status: uploadRes.status,
          statusText: uploadRes.statusText,
          response: responseText,
          uploadUrlHost,
          contentType,
        });

        throw new Error(
          `Cloudflare R2 upload failed (HTTP ${uploadRes.status} ${uploadRes.statusText || 'Unknown error'}).`
        );
      }

      // Step 3: Insert the public image URL into the question.
      const markdownImg = `\n\n![Diagram](${publicUrl})\n\n`;
      setQText((prev) => `${prev}${markdownImg}`);

      setBanner({
        text: 'Diagram uploaded and image tag inserted!',
        type: 'success',
      });
    } catch (err: any) {
      console.error('Diagram upload error:', err);

      let message = 'Diagram upload failed.';

      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        message =
          'Browser could not complete the direct Cloudflare R2 upload. Check R2 bucket CORS and the presigned upload URL endpoint in the browser Network/Console tab.';
      } else if (err?.message) {
        message = err.message;
      }

      setBanner({
        text: `Diagram upload error: ${message}`,
        type: 'error',
      });
    } finally {
      setUploadingDiagram(false);

      if (diagramInputRef.current) {
        diagramInputRef.current.value = '';
      }
    }
  };










  // Handler: Upload Diagram for Solution
const handleSolutionDiagramUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setUploadingSolutionDiagram(true);
  setBanner(null);

  try {
    const token =
      localStorage.getItem('accqudo_token') ||
      localStorage.getItem('token');

    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    const ext =
      file.name.split('.').pop()?.toLowerCase() || 'png';

    const contentType =
      file.type ||
      ({
        png: 'image/png',
        jpg: 'image/jpeg',
        jpeg: 'image/jpeg',
        webp: 'image/webp',
        gif: 'image/gif',
        svg: 'image/svg+xml',
      } as Record<string, string>)[ext] ||
      'application/octet-stream';

    if (!contentType.startsWith('image/')) {
      throw new Error('Please select a valid image file.');
    }

    // Step 1: Get presigned R2 upload URL.
    const presignedRes = await fetch(
      `${apiBase}/storage/presigned-upload`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          file_extension: ext,
          content_type: contentType,
          folder: 'solutions',
        }),
      }
    );

    if (!presignedRes.ok) {
      let errorMessage = 'Presigned storage allocation rejected.';

      try {
        const errorData = await presignedRes.json();

        errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorMessage;
      } catch {
        // Keep default message.
      }

      throw new Error(
        `${errorMessage} (HTTP ${presignedRes.status})`
      );
    }

    const presignedData = await presignedRes.json();

    const uploadUrl = presignedData?.upload_url;
    const publicUrl = presignedData?.public_url;

    if (!uploadUrl) {
      throw new Error(
        'Backend did not return an upload_url.'
      );
    }

    if (!publicUrl) {
      throw new Error(
        'Backend did not return a public_url.'
      );
    }

    // Step 2: Upload directly to R2.
    const uploadRes = await fetch(uploadUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType,
      },
      body: file,
    });

    if (!uploadRes.ok) {
      let responseText = '';

      try {
        responseText = await uploadRes.text();
      } catch {
        // Ignore response parsing failure.
      }

      console.error('Solution R2 upload failed:', {
        status: uploadRes.status,
        statusText: uploadRes.statusText,
        response: responseText,
      });

      throw new Error(
        `Cloudflare R2 upload failed (HTTP ${uploadRes.status} ${
          uploadRes.statusText || 'Unknown error'
        }).`
      );
    }

    // Step 3: Insert image Markdown into solution.
    const markdownImg =
      `\n\n![Solution Diagram](${publicUrl})\n\n`;

    setQSolution((prev) => `${prev}${markdownImg}`);

    setBanner({
      text: 'Solution diagram uploaded and image tag inserted!',
      type: 'success',
    });
  } catch (err: any) {
    console.error(
      'Solution diagram upload error:',
      err
    );

    setBanner({
      text: `Solution diagram upload error: ${
        err?.message || 'Upload failed.'
      }`,
      type: 'error',
    });
  } finally {
    setUploadingSolutionDiagram(false);

    if (solutionDiagramInputRef.current) {
      solutionDiagramInputRef.current.value = '';
    }
  }
};





  // Handler: Submit Single Question
  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qTopicId) {
      setBanner({ text: 'Please select a valid Topic from the hierarchy.', type: 'error' });
      return;
    }

    setSavingQuestion(true);
    setBanner(null);

    let evaluationData: Record<string, any> = {};
    if (qType === 'MCQ') {
      evaluationData = { correct_options: [correctKeys.trim().toUpperCase()] };
    } else if (qType === 'MSQ') {
      evaluationData = {
        correct_options: correctKeys.split(',').map((k) => k.trim().toUpperCase()),
      };
    } else {
      evaluationData = {
        exact_value: parseFloat(natExact) || 0,
        range_min: parseFloat(natMin) || (parseFloat(natExact) || 0),
        range_max: parseFloat(natMax) || (parseFloat(natExact) || 0),
      };
    }

    const payload = {
      topic_id: parseInt(qTopicId),
      question_type: qType,
      question_text: qText,
      options: qType !== 'NAT' ? options : null,
      evaluation_data: evaluationData,
      solution_text: qSolution,
      default_marks: qMarks,
      default_negative_marks: qType === 'MCQ' ? qNegMarks : 0.0,
    };

    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Question publishing failed.');
      }

      const data = await res.json();
      setBanner({ text: `Question #${data.question_id} published successfully!`, type: 'success' });

      // Reset form fields
      setQText('');
      setQSolution('');
      setCorrectKeys('');
      setNatExact('');
      setNatMin('');
      setNatMax('');
      setOptions([
        { id: 'A', text: '' },
        { id: 'B', text: '' },
        { id: 'C', text: '' },
        { id: 'D', text: '' },
      ]);
      await fetchQuestions();
    } catch (err: any) {
      setBanner({ text: `Publish Error: ${err.message}`, type: 'error' });
    } finally {
      setSavingQuestion(false);
    }
  };

  // Handler: Paper Assembler Methods
  const filteredQuestions = useMemo(() => {
    return questionBank.filter((q) => {
      const term = searchQuery.toLowerCase();
      const matchesSearch =
        q.question_text.toLowerCase().includes(term) ||
        (q.topic_name && q.topic_name.toLowerCase().includes(term)) ||
        (q.subject_name && q.subject_name.toLowerCase().includes(term));
      const matchesType = filterType === 'ALL' || q.question_type === filterType;
      return matchesSearch && matchesType;
    });
  }, [questionBank, searchQuery, filterType]);

  const addQuestionToCanvas = (q: QuestionBankItem) => {
    if (selectedQuestions.some((item) => item.question_id === q.id)) return;
    setSelectedQuestions((prev) => [
      ...prev,
      {
        question_id: q.id,
        order: prev.length + 1,
        marks: q.default_marks,
        negative_marks: q.default_negative_marks,
        question_type: q.question_type,
        question_text: q.question_text,
      },
    ]);
  };

  const removeQuestionFromCanvas = (id: number) => {
    setSelectedQuestions((prev) =>
      prev
        .filter((q) => q.question_id !== id)
        .map((q, idx) => ({ ...q, order: idx + 1 }))
    );
  };

  const updateQuestionMarkOverride = (id: number, marks: number, negMarks: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.question_id === id ? { ...q, marks, negative_marks: negMarks } : q))
    );
  };

  const togglePackageAttachment = (pkgId: number) => {
    setSelectedPackageIds((prev) =>
      prev.includes(pkgId) ? prev.filter((p) => p !== pkgId) : [...prev, pkgId]
    );
  };

  const totalPaperMarks = selectedQuestions.reduce((acc, curr) => acc + curr.marks, 0);

  const handleAssemblePaper = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedQuestions.length === 0) {
      setBanner({ text: 'Select at least 1 question to assemble an exam paper.', type: 'error' });
      return;
    }

    setSubmittingPaper(true);
    setBanner(null);

    const payload = {
      exam_id: parseInt(paperExamId) || 1,
      title: paperTitle,
      duration_minutes: paperDuration,
      instructions: { rules: paperInstructions },
      questions: selectedQuestions.map((q) => ({
        question_id: q.question_id,
        marks: q.marks,
        negative_marks: q.negative_marks,
      })),
      package_ids: selectedPackageIds,
    };

    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/tests/assemble`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Paper assembly failed.');

      setBanner({
        text: `Assembled "${data.title}" (Test #${data.test_id}) with ${data.question_count} questions. Total: ${totalPaperMarks.toFixed(2)} Marks.`,
        type: 'success',
      });
      setPaperTitle('');
      setSelectedQuestions([]);
      setSelectedPackageIds([]);
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setSubmittingPaper(false);
    }
  };

  // --- Handlers for Academic Hierarchy Creation ---
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExamTitle.trim() || !newExamCode.trim()) return;
    setCreatingExam(true);
    setBanner(null);
    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/exams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ title: newExamTitle, code: newExamCode }),
      });
      if (!res.ok) throw new Error('Failed to create exam stream.');
      setBanner({ text: 'Exam stream created successfully!', type: 'success' });
      setNewExamTitle('');
      setNewExamCode('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setCreatingExam(false);
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subExamId || !subSubjectName.trim()) return;
    setCreatingSubject(true);
    setBanner(null);
    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ exam_id: Number(subExamId), name: subSubjectName }),
      });
      if (!res.ok) throw new Error('Failed to create subject.');
      setBanner({ text: 'Subject created successfully!', type: 'success' });
      setSubSubjectName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setCreatingSubject(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chapSubjectId || !chapName.trim()) return;
    setCreatingChapter(true);
    setBanner(null);
    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/chapters`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ subject_id: Number(chapSubjectId), name: chapName }),
      });
      if (!res.ok) throw new Error('Failed to create chapter.');
      setBanner({ text: 'Chapter created successfully!', type: 'success' });
      setChapName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setCreatingChapter(false);
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topChapterId || !topName.trim()) return;
    setCreatingTopic(true);
    setBanner(null);
    try {
      const token = localStorage.getItem('accqudo_token') || localStorage.getItem('token');
      const res = await fetch(`${apiBase}/team/topics`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ chapter_id: Number(topChapterId), name: topName }),
      });
      if (!res.ok) throw new Error('Failed to create topic.');
      setBanner({ text: 'Topic created successfully!', type: 'success' });
      setTopName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setCreatingTopic(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3] text-[#1F3A5C] text-xs font-semibold">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 mx-auto animate-spin rounded-full border-[3px] border-[#1F3A5C]/20 border-t-[#1F3A5C]" />
          <p className="text-stone-500 font-serif text-sm">Loading Accqudo Team CMS...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3] text-stone-800 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Master Control Header */}
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between rounded-2xl bg-white border border-stone-200 border-t-4 border-t-[#1F3A5C] p-6 shadow-sm">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#1F3A5C] px-3 py-0.5 text-xs font-bold text-white">
                Staff Control Plane
              </span>
              <span className="text-xs text-stone-500">Exam Engine &amp; Knowledge Index</span>
            </div>
            <h1 className="text-2xl font-bold font-serif text-[#16293F] mt-2">Accqudo Team CMS &amp; Paper Studio</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Team question authoring, paper assembly, and academic taxonomy management.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => router.push('/team')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-[#1F3A5C] transition"
            >
              Team Home
            </button>
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-[#1F3A5C] transition"
            >
              Candidate Portal
            </button>
          </div>
        </header>

        {/* Status Notification Banner */}
        {banner && (
          <div
            className={`rounded-xl p-4 text-xs font-semibold border transition ${
              banner.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : banner.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-[#1F3A5C]/5 border-[#1F3A5C]/20 text-[#1F3A5C]'
            }`}
          >
            {banner.text}
          </div>
        )}

        {/* Primary Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-3">
          {[
            { id: 'author_question', label: '1. Author Question (KaTeX & Diagrams)' },
            { id: 'assemble_paper', label: `2. Paper Assembler Canvas (${selectedQuestions.length})` },
            { id: 'academic_hierarchy', label: '3. Academic Hierarchy' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setBanner(null);
              }}
              className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === tab.id
                  ? 'bg-[#1F3A5C] text-white shadow-sm'
                  : 'bg-white border border-stone-200 text-stone-500 hover:text-[#1F3A5C] hover:border-[#1F3A5C]/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: QUESTION AUTHORING STUDIO */}
        {activeTab === 'author_question' && (
          <form onSubmit={handleSubmitQuestion} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-base font-bold font-serif text-[#16293F] flex items-center justify-between">
                <span>Classified Question Authoring</span>
                <span className="text-xs font-normal text-[#B7862C]">Strict Taxonomy Binding</span>
              </h2>

              {/* Taxonomy Selectors */}
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Exam Stream</label>
                  <select
                    value={qExamId}
                    onChange={(e) => {
                      setQExamId(Number(e.target.value));
                      setQSubjectId('');
                      setQChapterId('');
                      setQTopicId('');
                    }}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Exam...</option>
                    {hierarchy.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Subject</label>
                  <select
                    value={qSubjectId}
                    onChange={(e) => {
                      setQSubjectId(Number(e.target.value));
                      setQChapterId('');
                      setQTopicId('');
                    }}
                    disabled={!currentExam}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 disabled:opacity-40 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Subject...</option>
                    {currentExam?.subjects?.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Chapter</label>
                  <select
                    value={qChapterId}
                    onChange={(e) => {
                      setQChapterId(Number(e.target.value));
                      setQTopicId('');
                    }}
                    disabled={!currentSubject}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 disabled:opacity-40 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Chapter...</option>
                    {currentSubject?.chapters?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-stone-500 mb-1">Topic</label>
                  <select
                    value={qTopicId}
                    onChange={(e) => setQTopicId(e.target.value)}
                    disabled={!currentChapter}
                    required
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 disabled:opacity-40 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Topic...</option>
                    {currentChapter?.topics?.map((t) => (
                      <option key={t.id} value={String(t.id)}>#{t.id}: {t.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Question Type & Marks */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Type</label>
                  <select
                    value={qType}
                    onChange={(e) => setQType(e.target.value as any)}
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="MCQ">MCQ (Single)</option>
                    <option value="MSQ">MSQ (Multiple)</option>
                    <option value="NAT">NAT (Numerical)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Marks</label>
                  <input
                    type="number"
                    step="0.5"
                    value={qMarks}
                    onChange={(e) => setQMarks(parseFloat(e.target.value) || 1.0)}
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 font-mono focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-500 mb-1">Negative Marks</label>
                  <input
                    type="number"
                    step="0.01"
                    disabled={qType !== 'MCQ'}
                    value={qType === 'MCQ' ? qNegMarks : 0.0}
                    onChange={(e) => setQNegMarks(parseFloat(e.target.value) || 0.0)}
                    className="w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800 font-mono disabled:opacity-40 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
              </div>

              {/* Question Statement & Diagram Uploader */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-stone-700">
                    Question Statement (LaTeX Supported)
                  </label>
                  <button
                    type="button"
                    onClick={() => diagramInputRef.current?.click()}
                    disabled={uploadingDiagram}
                    className="text-xs font-bold text-[#1F3A5C] hover:text-[#B7862C] transition"
                  >
                    {uploadingDiagram ? 'Uploading...' : '+ Attach Diagram Image'}
                  </button>
                  <input
                    type="file"
                    ref={diagramInputRef}
                    onChange={handleDiagramUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <textarea
                  rows={6}
                  placeholder="Enter question text or LaTeX (e.g. Find the value of $x$ where $f(x) = x^2$)..."
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3 font-mono text-xs text-stone-800 placeholder-stone-400 focus:border-[#1F3A5C] focus:bg-white focus:outline-none"
                  required
                />
              </div>

              {/* Options or NAT Fields */}
              {qType !== 'NAT' ? (
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-bold text-stone-700">Answer Options</label>
                  {options.map((opt, idx) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <span className="w-6 text-center font-bold text-xs text-[#1F3A5C]">{opt.id}.</span>
                      <input
                        type="text"
                        placeholder={`Option ${opt.id} text or math...`}
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...options];
                          updated[idx].text = e.target.value;
                          setOptions(updated);
                        }}
                        className="w-full rounded-lg border border-stone-300 bg-white px-3 py-1.5 font-mono text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                      />
                    </div>
                  ))}

                  <div className="pt-2">
                    <label className="block text-[11px] font-bold text-stone-500 mb-1">
                      Correct Option Key(s) (e.g. &quot;A&quot; for MCQ, &quot;A, C&quot; for MSQ)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. A"
                      value={correctKeys}
                      onChange={(e) => setCorrectKeys(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-xs text-stone-800 uppercase font-mono focus:border-[#1F3A5C] focus:outline-none"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500">Exact Value</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 10.5"
                      value={natExact}
                      onChange={(e) => setNatExact(e.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500">Min Tolerance</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 10.0"
                      value={natMin}
                      onChange={(e) => setNatMin(e.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500">Max Tolerance</label>
                    <input
                      type="number"
                      step="any"
                      placeholder="e.g. 11.0"
                      value={natMax}
                      onChange={(e) => setNatMax(e.target.value)}
                      className="w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Solution */}
              <div>
  <div className="flex items-center justify-between mb-1">
    <label className="block text-xs font-bold text-stone-700">
      Detailed Solution &amp; Derivation (LaTeX Supported)
    </label>

    <button
      type="button"
      onClick={() =>
        solutionDiagramInputRef.current?.click()
      }
      disabled={uploadingSolutionDiagram}
      className="text-xs font-bold text-[#1F3A5C] hover:text-[#B7862C] transition"
    >
      {uploadingSolutionDiagram
        ? 'Uploading...'
        : '+ Attach Solution Diagram'}
    </button>

    <input
      type="file"
      ref={solutionDiagramInputRef}
      onChange={handleSolutionDiagramUpload}
      accept="image/*"
      className="hidden"
    />
  </div>

  <textarea
    rows={5}
    placeholder="Explain the derivation and step-by-step logic. You can also attach a solution diagram..."
    value={qSolution}
    onChange={(e) => setQSolution(e.target.value)}
    className="w-full rounded-xl border border-stone-300 bg-stone-50 p-3 font-mono text-xs text-stone-800 placeholder-stone-400 focus:border-[#1F3A5C] focus:bg-white focus:outline-none"
  />
</div>

              <button
                type="submit"
                disabled={savingQuestion || !qText.trim()}
                className="w-full rounded-xl bg-[#1F3A5C] py-3 text-xs font-bold text-white hover:bg-[#16293F] transition shadow-sm disabled:opacity-50"
              >
                {savingQuestion ? 'Publishing Question...' : 'Publish Question to Bank \u2192'}
              </button>
            </div>

            {/* Right: Live KaTeX & Diagram Preview */}
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                <span className="text-xs font-bold text-stone-500">Live Render Canvas</span>
                <span className="rounded bg-[#B7862C]/10 border border-[#B7862C]/30 px-2.5 py-0.5 text-xs font-semibold text-[#8A6420]">
                  {qType}
                </span>
              </div>

              <div className="rounded-xl bg-stone-50 p-4 border border-stone-200 text-sm text-stone-800 min-h-[140px] whitespace-pre-wrap leading-relaxed">
                {qText.trim() ? (
                  <MathRenderer content={qText} />
                ) : (
                  <span className="text-stone-400 text-xs italic">Live LaTeX preview will appear here as you type...</span>
                )}
              </div>

              {qType !== 'NAT' && (
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-bold text-stone-500">Options Preview</span>
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-start gap-3 rounded-lg border border-stone-200 bg-stone-50/70 p-3 text-xs">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1F3A5C]/10 text-[10px] font-bold text-[#1F3A5C]">
                        {opt.id}
                      </span>
                      <div className="flex-1 text-stone-700">
                        {opt.text.trim() ? (
                          <MathRenderer content={opt.text} />
                        ) : (
                          <span className="text-stone-400 italic">Empty</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {qSolution.trim() && (
                <div className="mt-4 rounded-xl border border-[#B7862C]/30 bg-[#B7862C]/5 p-4 text-xs">
                  <span className="text-[11px] font-bold text-[#8A6420]">Solution Derivation</span>
                  <div className="mt-2 text-stone-700 leading-relaxed">
                    <MathRenderer content={qSolution} />
                  </div>
                </div>
              )}
            </div>
          </form>
        )}

        {/* TAB 2: INTERACTIVE TEST ASSEMBLY CANVAS */}
        {activeTab === 'assemble_paper' && (
          <form onSubmit={handleAssemblePaper} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold font-serif text-[#16293F]">Exam Parameters</h2>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Target Exam Stream</label>
                <select
                  value={paperExamId}
                  onChange={(e) => setPaperExamId(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  required
                >
                  <option value="">Select Exam...</option>
                  {hierarchy.map((exam) => (
                    <option key={exam.id} value={exam.id}>
                      {exam.title} ({exam.code}) — ID #{exam.id}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Test Title</label>
                <input
                  type="text"
                  placeholder="e.g. National Mock Test 01"
                  value={paperTitle}
                  onChange={(e) => setPaperTitle(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  value={paperDuration}
                  onChange={(e) => setPaperDuration(parseInt(e.target.value) || 180)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 font-mono focus:border-[#1F3A5C] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-500 mb-1">Candidate Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Guidelines, anti-cheat terms, calculator rules..."
                  value={paperInstructions}
                  onChange={(e) => setPaperInstructions(e.target.value)}
                  className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-700 focus:border-[#1F3A5C] focus:outline-none"
                  required
                />
              </div>

              <div className="pt-2">
                <label className="block text-xs font-semibold text-stone-500 mb-1.5">
                  Link this paper to Packages:
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {packages.map((pkg) => {
                    const isLinked = selectedPackageIds.includes(pkg.id);
                    return (
                      <button
                        type="button"
                        key={pkg.id}
                        onClick={() => togglePackageAttachment(pkg.id)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                          isLinked
                            ? 'bg-[#1F3A5C] text-white shadow-sm'
                            : 'bg-stone-50 border border-stone-200 text-stone-500 hover:text-[#1F3A5C]'
                        }`}
                      >
                        {isLinked ? '\u2713 ' : '+ '} {pkg.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-xl bg-[#1F3A5C]/5 border border-[#1F3A5C]/20 p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-[#1F3A5C]">
                  <span>Selected Questions:</span>
                  <span className="font-bold text-[#16293F]">{selectedQuestions.length}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-[#1F3A5C]">
                  <span>Total Exam Marks:</span>
                  <span className="font-bold text-emerald-700 font-mono text-sm">{totalPaperMarks.toFixed(2)}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingPaper || selectedQuestions.length === 0}
                className="w-full rounded-xl bg-emerald-700 py-3 text-xs font-bold text-white shadow-sm hover:bg-emerald-600 disabled:opacity-50 transition"
              >
                {submittingPaper ? 'Publishing Paper...' : 'Assemble & Publish Exam \u2192'}
              </button>
            </div>

            {/* Column 2: Question Repository Search */}
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-serif text-[#16293F]">Question Repository</h2>
                <span className="text-[11px] font-semibold text-[#B7862C]">
                  {filteredQuestions.length} Available
                </span>
              </div>

              <input
                type="text"
                placeholder="Search topic or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
              />

              <div className="flex gap-1.5">
                {(['ALL', 'MCQ', 'MSQ', 'NAT'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setFilterType(type)}
                    className={`rounded-full px-3 py-1 text-[10px] font-bold transition-all ${
                      filterType === type
                        ? 'bg-[#1F3A5C] text-white shadow-sm'
                        : 'bg-stone-50 border border-stone-200 text-stone-500 hover:text-[#1F3A5C]'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <div className="space-y-3 overflow-y-auto max-h-[500px] pr-1">
                {filteredQuestions.map((q) => {
                  const isSelected = selectedQuestions.some((item) => item.question_id === q.id);
                  return (
                    <div
                      key={q.id}
                      className={`rounded-xl border p-4 transition-all ${
                        isSelected
                          ? 'border-[#1F3A5C]/30 bg-[#1F3A5C]/5 opacity-50'
                          : 'border-stone-200 bg-stone-50 hover:border-[#1F3A5C]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="rounded bg-stone-200 px-2 py-0.5 font-bold text-[#1F3A5C]">
                          {q.question_type}
                        </span>
                        <span className="text-stone-500 truncate max-w-[140px]">
                          {q.topic_name || 'General'}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-stone-700 line-clamp-2">
                        <MathRenderer content={q.question_text} />
                      </div>
                      <div className="mt-3 flex items-center justify-between pt-2 border-t border-stone-200">
                        <span className="text-[10px] text-stone-500 font-mono">
                          +{q.default_marks} / -{q.default_negative_marks}
                        </span>
                        <button
                          type="button"
                          disabled={isSelected}
                          onClick={() => addQuestionToCanvas(q)}
                          className="rounded bg-[#1F3A5C] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#16293F] disabled:opacity-40"
                        >
                          {isSelected ? 'Added' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Column 3: Canvas with Question Re-ordering & Custom Marks */}
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-bold font-serif text-[#16293F]">
                Exam Paper Canvas ({selectedQuestions.length})
              </h2>

              {selectedQuestions.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-stone-300 text-center p-6 text-stone-400 text-xs">
                  <p>No questions added to exam canvas yet.</p>
                  <p className="text-[11px] text-stone-400 mt-1">Select from repository to stage exam paper.</p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[580px] pr-1">
                  {selectedQuestions.map((q) => (
                    <div key={q.question_id} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1F3A5C] text-[10px] font-bold text-white">
                            {q.order}
                          </span>
                          <span className="rounded bg-stone-200 px-1.5 py-0.5 text-[10px] font-semibold text-stone-600">
                            {q.question_type}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeQuestionFromCanvas(q.question_id)}
                          className="text-xs font-bold text-rose-600 hover:text-rose-700"
                        >
                          Remove
                        </button>
                      </div>

                      <div className="text-xs text-stone-700">
                        <MathRenderer content={q.question_text} />
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-200">
                        <div>
                          <label className="text-[10px] font-bold text-stone-500">Marks</label>
                          <input
                            type="number"
                            step="0.5"
                            value={q.marks}
                            onChange={(e) =>
                              updateQuestionMarkOverride(
                                q.question_id,
                                parseFloat(e.target.value) || 0,
                                q.negative_marks
                              )
                            }
                            className="mt-0.5 w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 font-mono focus:border-[#1F3A5C] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-stone-500">Neg Marks</label>
                          <input
                            type="number"
                            step="0.01"
                            value={q.negative_marks}
                            onChange={(e) =>
                              updateQuestionMarkOverride(
                                q.question_id,
                                q.marks,
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="mt-0.5 w-full rounded border border-stone-300 bg-white px-2 py-1 text-xs text-stone-800 font-mono focus:border-[#1F3A5C] focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        )}

        {/* TAB 3: ACADEMIC HIERARCHY MANAGEMENT */}
        {activeTab === 'academic_hierarchy' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <div>
                <h2 className="text-base font-bold font-serif text-[#16293F]">Academic Hierarchy Management</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure Exam Streams, Subjects, Chapters, and Topics used for structured question mapping.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                {/* 1. Create Exam Stream */}
                <form onSubmit={handleCreateExam} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#1F3A5C] uppercase tracking-wider">1. Create Exam Stream</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. GATE Computer Science"
                      value={newExamTitle}
                      onChange={(e) => setNewExamTitle(e.target.value)}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Code</label>
                    <input
                      type="text"
                      placeholder="e.g. GATE-CSE"
                      value={newExamCode}
                      onChange={(e) => setNewExamCode(e.target.value)}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs uppercase font-mono focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingExam}
                    className="w-full rounded-lg bg-[#1F3A5C] py-2 text-xs font-bold text-white hover:bg-[#16293F] transition disabled:opacity-50"
                  >
                    {creatingExam ? 'Creating...' : '+ Add Exam Stream'}
                  </button>
                </form>

                {/* 2. Create Subject */}
                <form onSubmit={handleCreateSubject} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#1F3A5C] uppercase tracking-wider">2. Create Subject</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Parent Exam</label>
                    <select
                      value={subExamId}
                      onChange={(e) => setSubExamId(Number(e.target.value))}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    >
                      <option value="">Select Exam...</option>
                      {hierarchy.map((e) => (
                        <option key={e.id} value={e.id}>{e.title}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Subject Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Data Structures"
                      value={subSubjectName}
                      onChange={(e) => setSubSubjectName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingSubject || !subExamId}
                    className="w-full rounded-lg bg-[#1F3A5C] py-2 text-xs font-bold text-white hover:bg-[#16293F] transition disabled:opacity-50"
                  >
                    {creatingSubject ? 'Creating...' : '+ Add Subject'}
                  </button>
                </form>

                {/* 3. Create Chapter */}
                <form onSubmit={handleCreateChapter} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#1F3A5C] uppercase tracking-wider">3. Create Chapter</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Parent Subject</label>
                    <select
                      value={chapSubjectId}
                      onChange={(e) => setChapSubjectId(Number(e.target.value))}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    >
                      <option value="">Select Subject...</option>
                      {hierarchy.map((e) =>
                        e.subjects?.map((s) => (
                          <option key={s.id} value={s.id}>
                            {e.code} &gt; {s.name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Chapter Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Binary Search Trees"
                      value={chapName}
                      onChange={(e) => setChapName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingChapter || !chapSubjectId}
                    className="w-full rounded-lg bg-[#1F3A5C] py-2 text-xs font-bold text-white hover:bg-[#16293F] transition disabled:opacity-50"
                  >
                    {creatingChapter ? 'Creating...' : '+ Add Chapter'}
                  </button>
                </form>

                {/* 4. Create Topic */}
                <form onSubmit={handleCreateTopic} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-3">
                  <h3 className="text-xs font-bold text-[#1F3A5C] uppercase tracking-wider">4. Create Topic</h3>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Parent Chapter</label>
                    <select
                      value={topChapterId}
                      onChange={(e) => setTopChapterId(Number(e.target.value))}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    >
                      <option value="">Select Chapter...</option>
                      {hierarchy.map((e) =>
                        e.subjects?.map((s) =>
                          s.chapters?.map((c) => (
                            <option key={c.id} value={c.id}>
                              {s.name} &gt; {c.name}
                            </option>
                          ))
                        )
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-stone-500 mb-1">Topic Name</label>
                    <input
                      type="text"
                      placeholder="e.g. AVL Rotations"
                      value={topName}
                      onChange={(e) => setTopName(e.target.value)}
                      required
                      className="w-full rounded-lg border border-stone-300 bg-white px-2.5 py-1.5 text-xs focus:border-[#1F3A5C] focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={creatingTopic || !topChapterId}
                    className="w-full rounded-lg bg-[#1F3A5C] py-2 text-xs font-bold text-white hover:bg-[#16293F] transition disabled:opacity-50"
                  >
                    {creatingTopic ? 'Creating...' : '+ Add Topic'}
                  </button>
                </form>
              </div>
            </div>

            {/* Current Hierarchy Tree Inspection View */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold font-serif text-[#16293F]">Current System Taxonomy Tree</h3>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-2 text-xs">
                {hierarchy.map((exam) => (
                  <div key={exam.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4 space-y-2">
                    <div className="font-bold text-[#1F3A5C] text-sm flex items-center justify-between">
                      <span>📘 {exam.title} ({exam.code})</span>
                      <span className="text-[10px] text-stone-400 font-mono">Exam ID #{exam.id}</span>
                    </div>
                    <div className="pl-4 space-y-2 pt-1 border-t border-stone-200/80">
                      {exam.subjects?.map((subj) => (
                        <div key={subj.id} className="space-y-1">
                          <div className="font-semibold text-stone-800">📂 Subject: {subj.name}</div>
                          <div className="pl-4 space-y-1">
                            {subj.chapters?.map((chap) => (
                              <div key={chap.id} className="text-stone-600">
                                📑 Chapter: <span className="font-medium text-stone-800">{chap.name}</span>
                                <div className="pl-4 flex flex-wrap gap-1 mt-1">
                                  {chap.topics?.map((top) => (
                                    <span key={top.id} className="rounded bg-white border border-stone-200 px-2 py-0.5 text-[10px] text-stone-600 font-mono">
                                      #{top.id}: {top.name}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}