'use client';

import React, { useState, useRef } from 'react';
import { MathRenderer } from '@/components/MathRenderer';

export default function QuestionAuthoringStudio() {
  const [topicId, setTopicId] = useState('1');
  const [questionType, setQuestionType] = useState<'MCQ' | 'MSQ' | 'NAT'>('MCQ');
  const [questionText, setQuestionText] = useState(
    'Consider the following AVL tree:\n\n$$T = \\text{balanced binary search tree}$$\n\nWhat is the height balance factor of the root node?'
  );
  const [solutionText, setSolutionText] = useState(
    'The balance factor is calculated as $\\text{height}(left) - \\text{height}(right)$.'
  );

  const [options, setOptions] = useState([
    { id: 'A', text: '$0$' },
    { id: 'B', text: '$+1$' },
    { id: 'C', text: '$-1$' },
    { id: 'D', text: '$\\pm 2$' },
  ]);
  const [correctKeys, setCorrectKeys] = useState('A');

  const [natExact, setNatExact] = useState('0');
  const [natMin, setNatMin] = useState('0');
  const [natMax, setNatMax] = useState('0');

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setFeedback(null);

    try {
      const token = localStorage.getItem('accqudo_token');
      const ext = file.name.split('.').pop() || 'png';

      // 1. Request presigned upload URL
      const presignedRes = await fetch('http://localhost:8000/api/v1/storage/presigned-upload', {
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

      if (!presignedRes.ok) throw new Error('Failed to obtain presigned upload URL.');
      const { upload_url, public_url } = await presignedRes.json();

      // 2. Upload file directly to R2 / mock endpoint
      const uploadRes = await fetch(upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Direct media upload failed.');

      // 3. Append Markdown Image syntax to questionText
      const markdownImg = `\n\n![Diagram](${public_url})\n\n`;
      setQuestionText((prev) => prev + markdownImg);
      setFeedback('Image attached and markdown tag inserted!');
    } catch (err: any) {
      setFeedback(`Upload error: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    let evaluationData: Record<string, any> = {};
    if (questionType === 'MCQ') {
      evaluationData = { correct_options: [correctKeys.trim().toUpperCase()] };
    } else if (questionType === 'MSQ') {
      evaluationData = {
        correct_options: correctKeys.split(',').map((k) => k.trim().toUpperCase()),
      };
    } else {
      evaluationData = {
        exact_value: parseFloat(natExact),
        range_min: parseFloat(natMin),
        range_max: parseFloat(natMax),
      };
    }

    const payload = {
      topic_id: parseInt(topicId),
      question_type: questionType,
      question_text: questionText,
      options: questionType !== 'NAT' ? options : null,
      evaluation_data: evaluationData,
      solution_text: solutionText,
      default_marks: questionType === 'NAT' ? 2.0 : 1.0,
      default_negative_marks: questionType === 'MCQ' ? 0.33 : 0.0,
    };

    try {
      const token = localStorage.getItem('accqudo_token');
      const res = await fetch('http://localhost:8000/api/v1/admin/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.detail || 'Failed to publish question.');
      }

      const data = await res.json();
      setFeedback(`Question #${data.question_id} created successfully.`);
    } catch (err: any) {
      setFeedback(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Question Authoring Studio</h1>
            <p className="text-sm text-slate-500">
              Compose questions with live KaTeX rendering and direct diagram uploads.
            </p>
          </div>
          {feedback && (
            <span
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                feedback.includes('error') || feedback.includes('Error')
                  ? 'bg-rose-100 text-rose-700'
                  : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {feedback}
            </span>
          )}
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Column: Authoring Form */}
          <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">Topic ID</label>
                <input
                  type="number"
                  value={topicId}
                  onChange={(e) => setTopicId(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-500">Question Type</label>
                <select
                  value={questionType}
                  onChange={(e) => setQuestionType(e.target.value as any)}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                >
                  <option value="MCQ">MCQ (Single Correct)</option>
                  <option value="MSQ">MSQ (Multiple Correct)</option>
                  <option value="NAT">NAT (Numerical Answer)</option>
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold uppercase text-slate-500">
                  Question Statement
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-500"
                >
                  {uploading ? 'Uploading...' : '+ Attach Diagram'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
              <textarea
                rows={6}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                required
              />
            </div>

            {/* Options for MCQ / MSQ */}
            {questionType !== 'NAT' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold uppercase text-slate-500">Options</label>
                {options.map((opt, idx) => (
                  <div key={opt.id} className="flex items-center gap-2">
                    <span className="w-6 font-bold text-slate-400">{opt.id}.</span>
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => {
                        const updated = [...options];
                        updated[idx].text = e.target.value;
                        setOptions(updated);
                      }}
                      className="w-full rounded-lg border border-slate-200 px-3 py-1.5 font-mono text-xs focus:border-indigo-500 focus:outline-none"
                    />
                  </div>
                ))}

                <div className="pt-2">
                  <label className="block text-xs font-semibold uppercase text-slate-500">
                    Correct Option Key(s) (e.g. &quot;B&quot; or &quot;A, C&quot;)
                  </label>
                  <input
                    type="text"
                    value={correctKeys}
                    onChange={(e) => setCorrectKeys(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            {/* NAT Parameters */}
            {questionType === 'NAT' && (
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Exact</label>
                  <input
                    type="number"
                    step="any"
                    value={natExact}
                    onChange={(e) => setNatExact(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Min</label>
                  <input
                    type="number"
                    step="any"
                    value={natMin}
                    onChange={(e) => setNatMin(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-500">Max</label>
                  <input
                    type="number"
                    step="any"
                    value={natMax}
                    onChange={(e) => setNatMax(e.target.value)}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500">
                Detailed Solution
              </label>
              <textarea
                rows={4}
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 p-3 font-mono text-xs focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50"
            >
              {saving ? 'Publishing...' : 'Publish Question to Bank'}
            </button>
          </div>

          {/* Right Column: Live KaTeX & Diagram Preview */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Live Preview</span>
              <span className="rounded bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700">
                {questionType}
              </span>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200/60">
              <MathRenderer content={questionText} />
            </div>

            {questionType !== 'NAT' && (
              <div className="space-y-2 pt-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Options</span>
                {options.map((opt) => (
                  <div key={opt.id} className="flex items-start gap-3 rounded-lg border border-slate-200 bg-white p-3">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {opt.id}
                    </span>
                    <div className="flex-1">
                      <MathRenderer content={opt.text} />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {solutionText && (
              <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                <span className="text-xs font-bold uppercase tracking-wide text-indigo-900">Solution Derivation</span>
                <div className="mt-2 text-sm text-indigo-950">
                  <MathRenderer content={solutionText} />
                </div>
              </div>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}