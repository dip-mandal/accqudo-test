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
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api/v1';

  const [activeTab, setActiveTab] = useState<
    'author_question' | 'assemble_paper' | 'taxonomy' | 'bulk_upload' | 'packages'
  >('author_question');
  const [loading, setLoading] = useState(true);
  const [banner, setBanner] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Global State
  const [hierarchy, setHierarchy] = useState<ExamHierarchy[]>([]);
  const [packages, setPackages] = useState<SubscriptionPackageItem[]>([]);
  const [questionBank, setQuestionBank] = useState<QuestionBankItem[]>([]);

  // --- TAB 1: Taxonomy States ---
  const [newExamTitle, setNewExamTitle] = useState('');
  const [newExamCode, setNewExamCode] = useState('');
  const [selExamIdForSub, setSelExamIdForSub] = useState<number | ''>('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [selSubIdForChap, setSelSubIdForChap] = useState<number | ''>('');
  const [newChapterName, setNewChapterName] = useState('');
  const [selChapIdForTopic, setSelChapIdForTopic] = useState<number | ''>('');
  const [newTopicName, setNewTopicName] = useState('');

  // --- TAB 2: Clean Authoring States (Zero Dummy Content) ---
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
  const [savingQuestion, setSavingQuestion] = useState(false);
  const diagramInputRef = useRef<HTMLInputElement>(null);

  // --- TAB 3: Test Paper Assembly Canvas States ---
  const [paperExamId, setPaperExamId] = useState<string>('');
  const [paperTitle, setPaperTitle] = useState('');
  const [paperDuration, setPaperDuration] = useState<number>(180);
  const [paperInstructions, setPaperInstructions] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<SelectedQuestion[]>([]);
  const [selectedPackageIds, setSelectedPackageIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'MCQ' | 'MSQ' | 'NAT'>('ALL');
  const [submittingPaper, setSubmittingPaper] = useState(false);

  // --- TAB 4: Bulk Upload States ---
  const [bulkFile, setBulkFile] = useState<File | null>(null);
  const [bulkUploading, setBulkUploading] = useState(false);
  const bulkFileRef = useRef<HTMLInputElement>(null);

  // --- TAB 5: Package Pricing & Creation States ---
  const [editingPkgId, setEditingPkgId] = useState<number | null>(null);
  
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editValidity, setEditValidity] = useState<number>(365);
  const [editActive, setEditActive] = useState<boolean>(true);
  const [editDescription, setEditDescription] = useState<string>('');

  // Create Package Modal State
  const [showCreatePackageModal, setShowCreatePackageModal] = useState(false);
  const [newPkgExamId, setNewPkgExamId] = useState<string>('');
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgDesc, setNewPkgDesc] = useState('');
  const [newPkgPrice, setNewPkgPrice] = useState('999');
  const [newPkgValidity, setNewPkgValidity] = useState('365');

  // --- Core API Data Fetching ---
  const fetchQuestions = useCallback(async () => {
    try {
      const token = localStorage.getItem('accqudo_token');
      const res = await fetch(`${apiBase}/admin/questions/search`, {
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
    const token = localStorage.getItem('accqudo_token');
    if (!token) {
      router.push('/login');
      return;
    }

    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    try {
      const hierRes = await fetch(`${apiBase}/admin/hierarchy`, { headers });
      if (hierRes.status === 401 || hierRes.status === 403) {
        alert('Access denied: Administrator privileges required.');
        router.push('/dashboard');
        return;
      }
      if (hierRes.ok) {
        const hierData = await hierRes.json();
        setHierarchy(hierData);
        if (hierData.length > 0) {
          setQExamId(hierData[0].id);
          setPaperExamId(String(hierData[0].id));
          setNewPkgExamId(String(hierData[0].id));
        }
      }

      const pkgRes = await fetch(`${apiBase}/admin/packages/all`, { headers });
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

  // --- Handler 1: Taxonomy Form Submissions ---
  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/exams`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newExamTitle, code: newExamCode }),
      });
      if (!res.ok) throw new Error('Failed to create Exam stream.');
      setBanner({ text: `Exam stream "${newExamTitle}" registered!`, type: 'success' });
      setNewExamTitle('');
      setNewExamCode('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selExamIdForSub) return;
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/subjects`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ exam_id: Number(selExamIdForSub), name: newSubjectName }),
      });
      if (!res.ok) throw new Error('Failed to create Subject.');
      setBanner({ text: `Subject "${newSubjectName}" linked!`, type: 'success' });
      setNewSubjectName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selSubIdForChap) return;
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/chapters`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject_id: Number(selSubIdForChap), name: newChapterName }),
      });
      if (!res.ok) throw new Error('Failed to create Chapter.');
      setBanner({ text: `Chapter "${newChapterName}" created!`, type: 'success' });
      setNewChapterName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selChapIdForTopic) return;
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/topics`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ chapter_id: Number(selChapIdForTopic), name: newTopicName }),
      });
      if (!res.ok) throw new Error('Failed to create Topic.');
      setBanner({ text: `Topic "${newTopicName}" registered!`, type: 'success' });
      setNewTopicName('');
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  // --- Handler 2: Question Diagram Presigned Upload ---
  const handleDiagramUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDiagram(true);
    setBanner(null);

    try {
      const token = localStorage.getItem('accqudo_token');
      const ext = file.name.split('.').pop() || 'png';

      const presignedRes = await fetch(`${apiBase}/storage/presigned-upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          file_extension: ext,
          content_type: file.type || 'image/png',
          folder: 'questions',
        }),
      });

      if (!presignedRes.ok) throw new Error('Presigned storage allocation rejected.');
      const { upload_url, public_url } = await presignedRes.json();

      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Direct diagram upload failed.');

      const markdownImg = `\n\n![Diagram](${public_url})\n\n`;
      setQText((prev) => prev + markdownImg);
      setBanner({ text: 'Diagram uploaded and image tag inserted!', type: 'success' });
    } catch (err: any) {
      setBanner({ text: `Diagram upload error: ${err.message}`, type: 'error' });
    } finally {
      setUploadingDiagram(false);
      if (diagramInputRef.current) diagramInputRef.current.value = '';
    }
  };

  // --- Handler 3: Submit Single Question (No Hardcoded Values) ---
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
      const token = localStorage.getItem('accqudo_token');
      const res = await fetch(`${apiBase}/admin/questions`, {
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
      
      // Reset form
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

  // --- Handler 4: Paper Assembler Methods ---
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
      question_ids: selectedQuestions.map((q) => q.question_id),
      package_ids: selectedPackageIds,
    };

    try {
      const token = localStorage.getItem('accqudo_token');
      const res = await fetch(`${apiBase}/admin/tests/assemble`, {
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

  // --- Handler 5: Bulk File Ingestion ---
  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bulkFile) {
      setBanner({ text: 'Please select a .csv or .xlsx file.', type: 'error' });
      return;
    }

    setBulkUploading(true);
    setBanner(null);

    const formData = new FormData();
    formData.append('file', bulkFile);

    try {
      const token = localStorage.getItem('accqudo_token');
      const res = await fetch(`${apiBase}/admin/questions/bulk-upload`, {
        method: 'POST',
        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.detail || 'Spreadsheet ingestion failed.');

      setBanner({ text: result.message || `Ingested ${result.inserted_count} questions successfully.`, type: 'success' });
      setBulkFile(null);
      if (bulkFileRef.current) bulkFileRef.current.value = '';
      await fetchQuestions();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    } finally {
      setBulkUploading(false);
    }
  };

  const downloadSampleTemplate = () => {
    const csvContent =
      'topic_id,question_type,question_text,options,evaluation_data,default_marks,default_negative_marks,solution_text\n' +
      '1,MCQ,"Example Question Statement","A: Option 1, B: Option 2, C: Option 3, D: Option 4","A",1.0,0.33,"Detailed solution derivation."\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'accqudo_bulk_questions_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Handler 6: Package Pricing, Creation & Deletion ---
  const handleUpdatePackagePrice = async (pkgId: number) => {
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/packages/${pkgId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: editDescription,
          price_inr: editPrice,
          validity_days: editValidity,
          is_active: editActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Package update rejected.');

      setBanner({ text: `Package #${pkgId} updated! New Price: ₹${editPrice} INR`, type: 'success' });
      setEditingPkgId(null);
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  const handleDeletePackage = async (pkgId: number) => {
    if (!confirm(`Permanently delete Package #${pkgId}? This will remove all associated bindings.`)) return;
    const token = localStorage.getItem('accqudo_token');
    try {
      const res = await fetch(`${apiBase}/admin/packages/${pkgId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Package deletion failed.');

      setBanner({ text: data.message, type: 'success' });
      fetchInitialData();
    } catch (err: any) {
      setBanner({ text: err.message, type: 'error' });
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#FAF8F3] text-[#1F3A5C] text-xs font-semibold">
        <div className="text-center space-y-3">
          <div className="h-9 w-9 mx-auto animate-spin rounded-full border-[3px] border-[#1F3A5C]/20 border-t-[#1F3A5C]" />
          <p className="text-stone-500 font-serif text-sm">Loading Accqudo Examination Studio &amp; CMS...</p>
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
            <h1 className="text-2xl font-bold font-serif text-[#16293F] mt-2">Accqudo Admin CMS &amp; Paper Studio</h1>
            <p className="text-xs text-stone-500 mt-0.5">
              Taxonomy classification, live LaTeX question authoring, bulk ingestion, and multi-tier examination packaging.
            </p>
          </div>

          <div className="mt-4 md:mt-0 flex items-center gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-[#1F3A5C] transition"
            >
              Candidate Portal
            </button>
            <button
              onClick={() => router.push('/store')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 hover:text-[#1F3A5C] transition"
            >
              Package Store
            </button>
            <button
              onClick={() => router.push('/admin')}
              className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50 transition"
            >
              &larr; Admin Overview Hub
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
            { id: 'taxonomy', label: '3. Academic Hierarchy' },
            { id: 'bulk_upload', label: '4. Bulk Spreadsheet Ingestion' },
            { id: 'packages', label: '5. Packages & Pricing Studio' },
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

        {/* ========================================================================= */}
        {/* TAB 1: QUESTION AUTHORING STUDIO (CLEAN INPUTS)                           */}
        {/* ========================================================================= */}
        {activeTab === 'author_question' && (
          <form onSubmit={handleSubmitQuestion} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Left: Authoring Controls */}
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
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Detailed Solution &amp; Derivation (LaTeX Supported)
                </label>
                <textarea
                  rows={3}
                  placeholder="Explain the derivation and step-by-step logic..."
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

        {/* ========================================================================= */}
        {/* TAB 2: INTERACTIVE 3-COLUMN TEST ASSEMBLY CANVAS                          */}
        {/* ========================================================================= */}
        {activeTab === 'assemble_paper' && (
          <form onSubmit={handleAssemblePaper} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Test Metadata & Target Packages */}
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

              {/* Package Association */}
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

              {/* Running Total Live Counter */}
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

            {/* Column 2: Question Bank Repository Search */}
            <div className="space-y-4 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold font-serif text-[#16293F]">Question Repository</h2>
                <span className="text-[11px] font-semibold text-[#B7862C]">
                  {filteredQuestions.length} Available
                </span>
              </div>

              {/* Search Bar */}
              <input
                type="text"
                placeholder="Search topic or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
              />

              {/* Question Type Pills */}
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

              {/* Available Question Cards */}
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

        {/* ========================================================================= */}
        {/* TAB 3: ACADEMIC TAXONOMY BUILDER                                          */}
        {/* ========================================================================= */}
        {activeTab === 'taxonomy' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <form onSubmit={handleCreateExam} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold font-serif text-[#16293F] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#1F3A5C]" /> Register Exam Stream
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="e.g. GATE Computer Science"
                    value={newExamTitle}
                    onChange={(e) => setNewExamTitle(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Code: GATE_CS"
                    value={newExamCode}
                    onChange={(e) => setNewExamCode(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-[#1F3A5C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#16293F] transition">
                  + Add Exam
                </button>
              </form>

              <form onSubmit={handleCreateSubject} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold font-serif text-[#16293F] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-600" /> Add Subject to Exam
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selExamIdForSub}
                    onChange={(e) => setSelExamIdForSub(Number(e.target.value))}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Exam...</option>
                    {hierarchy.map((e) => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Operating Systems"
                    value={newSubjectName}
                    onChange={(e) => setNewSubjectName(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-600 transition">
                  + Add Subject
                </button>
              </form>

              <form onSubmit={handleCreateChapter} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold font-serif text-[#16293F] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-[#B7862C]" /> Add Chapter to Subject
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selSubIdForChap}
                    onChange={(e) => setSelSubIdForChap(Number(e.target.value))}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Subject...</option>
                    {hierarchy.flatMap((e) => e.subjects || []).map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. CPU Scheduling"
                    value={newChapterName}
                    onChange={(e) => setNewChapterName(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-[#B7862C] px-4 py-1.5 text-xs font-bold text-white hover:bg-[#9C7124] transition">
                  + Add Chapter
                </button>
              </form>

              <form onSubmit={handleCreateTopic} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
                <h3 className="text-sm font-bold font-serif text-[#16293F] flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-purple-600" /> Add Topic to Chapter
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    value={selChapIdForTopic}
                    onChange={(e) => setSelChapIdForTopic(Number(e.target.value))}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  >
                    <option value="">Select Chapter...</option>
                    {hierarchy.flatMap((e) => e.subjects || []).flatMap((s) => s.chapters || []).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="e.g. Round Robin &amp; SRTF"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                    required
                    className="rounded-lg border border-stone-300 bg-stone-50 px-3 py-2 text-xs text-stone-800 focus:border-[#1F3A5C] focus:outline-none"
                  />
                </div>
                <button type="submit" className="rounded-lg bg-purple-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-purple-600 transition">
                  + Add Topic
                </button>
              </form>
            </div>

            {/* Visual Hierarchy Tree */}
            <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-4 shadow-sm">
              <h3 className="text-sm font-bold font-serif text-[#16293F]">
                Academic Knowledge Tree
              </h3>
              <div className="max-h-[620px] overflow-y-auto space-y-3 pr-2">
                {hierarchy.map((exam) => (
                  <div key={exam.id} className="rounded-xl border border-stone-200 bg-stone-50 p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-[#1F3A5C]">
                      <span>{`\u{1F3DB}`} {exam.title} ({exam.code})</span>
                      <span className="text-[10px] text-stone-400 font-mono">Exam #{exam.id}</span>
                    </div>

                    <div className="pl-3 border-l-2 border-stone-200 space-y-2">
                      {exam.subjects && exam.subjects.length > 0 ? (
                        exam.subjects.map((sub) => (
                          <div key={sub.id} className="space-y-1">
                            <span className="text-xs font-bold text-emerald-700">{`\u{1F4DA}`} {sub.name}</span>
                            <div className="pl-3 border-l-2 border-stone-200 space-y-1">
                              {sub.chapters && sub.chapters.length > 0 ? (
                                sub.chapters.map((chap) => (
                                  <div key={chap.id} className="space-y-0.5">
                                    <span className="text-[11px] font-semibold text-[#8A6420]">{`\u{1F4D6}`} {chap.name}</span>
                                    <div className="pl-3 flex flex-wrap gap-1">
                                      {chap.topics && chap.topics.length > 0 ? (
                                        chap.topics.map((top) => (
                                          <span
                                            key={top.id}
                                            className="rounded bg-white px-2 py-0.5 text-[10px] font-mono text-purple-700 border border-purple-200"
                                          >
                                            {`\u{1F516}`}#{top.id}: {top.name}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-[10px] text-stone-400 italic">No topics</span>
                                      )}
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <span className="text-[10px] text-stone-400 italic">No chapters</span>
                              )}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-[10px] text-stone-400 italic">No subjects</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: BULK SPREADSHEET INGESTION (.CSV / .XLSX)                          */}
        {/* ========================================================================= */}
        {activeTab === 'bulk_upload' && (
          <div className="rounded-2xl border border-stone-200 bg-white p-6 space-y-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold font-serif text-[#16293F]">Bulk Spreadsheet Ingestion (.csv / .xlsx)</h2>
                <p className="text-xs text-stone-500 mt-1">
                  Ingest full national papers in a single atomic transaction.
                </p>
              </div>
              <button
                type="button"
                onClick={downloadSampleTemplate}
                className="rounded-lg bg-[#1F3A5C]/5 border border-[#1F3A5C]/20 px-3.5 py-2 text-xs font-bold text-[#1F3A5C] hover:bg-[#1F3A5C]/10 transition"
              >
                Download Sample CSV Template
              </button>
            </div>

            <div className="rounded-xl bg-stone-50 p-4 border border-stone-200 text-xs space-y-2">
              <span className="font-bold text-[#1F3A5C]">Required Spreadsheet Columns:</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-stone-600 font-mono text-[11px]">
                <div className="bg-white p-2 rounded border border-stone-200">topic_id</div>
                <div className="bg-white p-2 rounded border border-stone-200">question_type (MCQ|MSQ|NAT)</div>
                <div className="bg-white p-2 rounded border border-stone-200">question_text</div>
                <div className="bg-white p-2 rounded border border-stone-200">options</div>
                <div className="bg-white p-2 rounded border border-stone-200">evaluation_data</div>
                <div className="bg-white p-2 rounded border border-stone-200">default_marks</div>
                <div className="bg-white p-2 rounded border border-stone-200">default_negative_marks</div>
                <div className="bg-white p-2 rounded border border-stone-200">solution_text</div>
              </div>
            </div>

            <form onSubmit={handleBulkUpload} className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-44 border-2 border-stone-300 border-dashed rounded-2xl cursor-pointer bg-stone-50 hover:bg-[#1F3A5C]/5 hover:border-[#1F3A5C]/40 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <span className="text-3xl mb-2">{`\u{1F4C1}`}</span>
                    <p className="mb-2 text-xs font-semibold text-stone-600">
                      {bulkFile ? bulkFile.name : 'Click to browse or drag and drop .csv or .xlsx'}
                    </p>
                    <p className="text-[10px] text-stone-400">Maximum payload size: 25MB</p>
                  </div>
                  <input
                    ref={bulkFileRef}
                    type="file"
                    accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                    onChange={(e) => setBulkFile(e.target.files ? e.target.files[0] : null)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!bulkFile || bulkUploading}
                  className="rounded-xl bg-[#1F3A5C] px-6 py-2.5 text-xs font-bold text-white hover:bg-[#16293F] disabled:opacity-50 transition flex items-center gap-2"
                >
                  {bulkUploading ? (
                    <>
                      <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      <span>Parsing &amp; Ingesting...</span>
                    </>
                  ) : (
                    <span>Execute Bulk Import \u2192</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: PACKAGES & PRICING STUDIO (WITH CREATE & DELETE CAPABILITIES)      */}
        {/* ========================================================================= */}
        {activeTab === 'packages' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
              <div>
                <h2 className="text-base font-bold font-serif text-[#16293F]">Subscription Package &amp; Pricing Management</h2>
                <p className="text-xs text-stone-500 mt-0.5">
                  Configure package pricing in INR, validity duration, toggle status, create new packages, or purge obsolete series.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreatePackageModal(true)}
                className="rounded-xl bg-[#1F3A5C] px-4 py-2 text-xs font-bold text-white hover:bg-[#16293F] transition shadow-sm"
              >
                + Create New Package
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {packages.map((pkg) => {
                const isEditing = editingPkgId === pkg.id;
                return (
                  <div
                    key={pkg.id}
                    className="rounded-2xl border border-stone-200 bg-white p-6 flex flex-col justify-between space-y-4 shadow-sm"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="rounded bg-[#1F3A5C]/5 border border-[#1F3A5C]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#1F3A5C]">
                          Package #{pkg.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pkg.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {pkg.is_active ? 'ACTIVE' : 'DISABLED'}
                        </span>
                      </div>

                      <h3 className="text-base font-bold font-serif text-[#16293F]">{pkg.title}</h3>
                      <p className="text-xs text-stone-500">{pkg.description}</p>

                      {isEditing ? (
  <div className="mt-4 space-y-4">

    {/* Price / Validity / Status */}
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

      <div>
        <label className="block text-[10px] font-bold text-stone-500 mb-1">
          Price (₹ INR)
        </label>

        <input
          type="number"
          value={editPrice}
          onChange={(e) =>
            setEditPrice(Number(e.target.value))
          }
          className="block w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-500 mb-1">
          Validity (Days)
        </label>

        <input
          type="number"
          value={editValidity}
          onChange={(e) =>
            setEditValidity(Number(e.target.value))
          }
          className="block w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800"
        />
      </div>

      <div>
        <label className="block text-[10px] font-bold text-stone-500 mb-1">
          Status
        </label>

        <select
          value={editActive ? 'true' : 'false'}
          onChange={(e) =>
            setEditActive(e.target.value === 'true')
          }
          className="block w-full rounded-lg border border-stone-300 bg-white p-2 text-xs text-stone-800"
        >
          <option value="true">Active</option>
          <option value="false">Disabled</option>
        </select>
      </div>

    </div>

    {/* DESCRIPTION */}
    <div className="w-full">
      <label
        htmlFor={`package-description-${pkg.id}`}
        className="block text-[10px] font-bold text-stone-500 mb-1"
      >
        Package Description
      </label>

      <textarea
        id={`package-description-${pkg.id}`}
        name={`package-description-${pkg.id}`}
        value={editDescription}
        onChange={(e) => {
          console.log('Description changed:', e.target.value);
          setEditDescription(e.target.value);
        }}
        placeholder="Enter package description..."
        rows={5}
        className="block w-full min-h-[120px] rounded-lg border-2 border-stone-300 bg-white p-3 text-sm text-stone-800 placeholder-stone-400 outline-none focus:border-[#1F3A5C]"
      />

      <p className="mt-1 text-[10px] text-stone-400">
        Current value: {editDescription || '(empty)'}
      </p>
    </div>

  </div>
) : (
                        <div className="flex items-center gap-6 pt-2 text-xs">
                          <span className="font-bold text-emerald-700 text-base">{`\u20B9`} {pkg.price_inr} INR</span>
                          <span className="text-stone-500">{`\u23F1`} {pkg.validity_days} Days Access</span>
                          <span className="text-stone-500">{`\u{1F4DA}`} {pkg.total_tests} Papers Included</span>
                          <span className="text-stone-500">• {pkg.description}</span>
                        </div>
                      )}

                      {/* Bundled Tests */}
                      <div className="pt-2 border-t border-stone-200 space-y-1">
                        <span className="text-[11px] font-semibold text-stone-500">Included Papers:</span>
                        <div className="max-h-24 overflow-y-auto space-y-1 pr-1">
                          {pkg.tests && pkg.tests.length > 0 ? (
                            pkg.tests.map((t) => (
                              <div key={t.id} className="text-[11px] text-stone-600 bg-stone-50 p-1.5 rounded border border-stone-200 flex justify-between">
                                <span className="truncate">{t.title}</span>
                                <span className="text-stone-400 font-mono text-[10px]">{t.duration_minutes}m</span>
                              </div>
                            ))
                          ) : (
                            <p className="text-[10px] text-stone-400 italic">No papers assigned yet.</p>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-stone-200 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="text-xs font-bold text-rose-600 hover:text-rose-800 transition"
                      >
                        Delete Package
                      </button>

                      <div className="flex gap-2">
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingPkgId(null)}
                              className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs text-stone-500 hover:text-stone-800"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleUpdatePackagePrice(pkg.id)}
                              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-600"
                            >
                              Save Updates
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingPkgId(pkg.id);
                              setEditDescription(pkg.description);
                              setEditPrice(pkg.price_inr);
                              setEditValidity(pkg.validity_days);
                              setEditActive(pkg.is_active);
                            }}
                            className="rounded-lg bg-stone-100 border border-stone-300 px-4 py-1.5 text-xs font-bold text-stone-700 hover:bg-[#1F3A5C] hover:text-white hover:border-[#1F3A5C] transition"
                          >
                            Edit Pricing &amp; Details
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal: Create Package */}
            {showCreatePackageModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('accqudo_token');
                    try {
                      const res = await fetch(`${apiBase}/admin/packages`, {
                        method: 'POST',
                        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          exam_id: Number(newPkgExamId) || 1,
                          title: newPkgTitle,
                          description: newPkgDesc,
                          price_inr: parseFloat(newPkgPrice) || 999,
                          validity_days: parseInt(newPkgValidity) || 365,
                          is_active: true,
                        }),
                      });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.detail || 'Creation failed.');
                      setBanner({ text: data.message, type: 'success' });
                      setShowCreatePackageModal(false);
                      setNewPkgTitle('');
                      setNewPkgDesc('');
                      fetchInitialData();
                    } catch (err: any) {
                      alert(err.message);
                    }
                  }}
                  className="w-full max-w-lg rounded-2xl border border-stone-200 bg-white p-6 shadow-xl space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-stone-200 pb-3">
                    <h3 className="text-base font-bold font-serif text-[#16293F]">Create Test Series Package</h3>
                    <button type="button" onClick={() => setShowCreatePackageModal(false)} className="text-stone-400 hover:text-stone-700">✕</button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Target Exam Stream</label>
                    <select
                      value={newPkgExamId}
                      onChange={(e) => setNewPkgExamId(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800"
                      required
                    >
                      {hierarchy.map((exam) => (
                        <option key={exam.id} value={exam.id}>{exam.title} ({exam.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Package Title</label>
                    <input
                      type="text"
                      placeholder="e.g. GATE CS 2027 Subject-Wise Sprint Pack"
                      value={newPkgTitle}
                      onChange={(e) => setNewPkgTitle(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-600 mb-1">Description</label>
                    <textarea
                      rows={2}
                      placeholder="Brief summary of syllabus and paper coverage..."
                      value={newPkgDesc}
                      onChange={(e) => setNewPkgDesc(e.target.value)}
                      className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Price (₹ INR)</label>
                      <input
                        type="number"
                        value={newPkgPrice}
                        onChange={(e) => setNewPkgPrice(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800 font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-600 mb-1">Validity (Days)</label>
                      <input
                        type="number"
                        value={newPkgValidity}
                        onChange={(e) => setNewPkgValidity(e.target.value)}
                        className="w-full rounded-lg border border-stone-300 bg-stone-50 p-2 text-xs text-stone-800 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
                    <button
                      type="button"
                      onClick={() => setShowCreatePackageModal(false)}
                      className="rounded-lg border border-stone-300 px-4 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="rounded-lg bg-[#1F3A5C] px-5 py-2 text-xs font-bold text-white hover:bg-[#16293F]"
                    >
                      Create Package
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}