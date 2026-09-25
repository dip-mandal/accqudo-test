"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, BookOpen, ChevronDown, ChevronRight, FileText,
  Layers3, Package, RefreshCw, Target, Users, CheckCircle2
} from "lucide-react";

type Topic = { id:number; name:string; contributed_questions:number; total_questions:number; contribution_percent:number };
type Chapter = { id:number; name:string; contributed_questions:number; total_questions:number; contribution_percent:number; topics:Topic[] };
type Subject = { id:number; name:string; contributed_questions:number; total_questions:number; contribution_percent:number; chapters:Chapter[]; exam?:{id:number;title:string;code:string} };
type Paper = { id:number; title:string; exam_title:string|null; exam_code:string|null; duration_minutes:number; total_marks:number; total_questions:number; questions_added_by_me:number; created_at:string|null };
type PackageNode = { id:number; title:string; exam_id:number|null; paper_count:number; contributed_questions:number; total_questions:number; contribution_percent:number; academic_contributed_questions:number; academic_total_questions:number; academic_contribution_percent:number; subjects:Array<{id:number;name:string;contributed_questions:number;total_questions:number;contribution_percent:number;chapters:Array<{id:number;name:string;contributed_questions:number;total_questions:number;contribution_percent:number;topics:Array<{id:number;name:string;contributed_questions:number;total_questions:number;contribution_percent:number}>}>}>; papers: Array<{id:number;title:string;contributed_questions:number;total_questions:number;contribution_percent:number;questions:Array<{id:number;order:number;topic:{id:number;name:string};chapter:{id:number;name:string};subject:{id:number;name:string}}>}> };
type Data = { user:{id:number;name:string|null;email:string;role:string}; summary:{subjects:number;chapters:number;topics:number;questions:number;packages:number;papers_assembled:number;questions_added_to_papers:number}; hierarchy:Subject[]; packages:PackageNode[]; papers:Paper[]; collaborative_paper_additions:Array<any>; generated_at:string };

const API = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8001/api/v1").replace(/\/$/, "");
const money = (n:number) => new Intl.NumberFormat("en-IN", {style:"currency",currency:"INR",maximumFractionDigits:0}).format(n || 0);
const date = (v:string|null) => v ? new Date(v).toLocaleDateString("en-IN", {day:"2-digit",month:"short",year:"numeric"}) : "—";

function Meter({value,total}:{value:number;total:number}) {
  const pct = total ? Math.min(100, Math.max(0, value/total*100)) : 0;
  return <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-stone-100"><div className="h-full rounded-full bg-[#1F3A5C]" style={{width:`${pct}%`}} /></div>;
}

export default function ContributionPage() {
  const router = useRouter();
  const [data,setData] = useState<Data|null>(null);
  const [loading,setLoading] = useState(true);
  const [refreshing,setRefreshing] = useState(false);
  const [error,setError] = useState("");
  const [openSubjects,setOpenSubjects] = useState<Record<number,boolean>>({});
  const [openChapters,setOpenChapters] = useState<Record<number,boolean>>({});
  const [openPackages,setOpenPackages] = useState<Record<number,boolean>>({});
  const [openPapers,setOpenPapers] = useState<Record<number,boolean>>({});

  const load = async (refresh=false) => {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      const token = localStorage.getItem("accqudo_token") || localStorage.getItem("token");
      if (!token) { router.replace("/login"); return; }
      const res = await fetch(`${API}/team/contribution`, {headers:{Authorization:`Bearer ${token}`,Accept:"application/json"},cache:"no-store"});
      if (res.status === 401) { localStorage.removeItem("accqudo_token"); localStorage.removeItem("token"); router.replace("/login"); return; }
      if (res.status === 403) { router.replace("/team"); return; }
      if (!res.ok) throw new Error((await res.text()) || `Request failed (${res.status})`);
      setData(await res.json());
    } catch(e) { console.error(e); setError(e instanceof Error ? e.message : "Unable to load contribution data."); }
    finally { setLoading(false); setRefreshing(false); }
  };
  useEffect(()=>{ load(); },[]);

  if (loading) return <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center"><div className="text-center"><RefreshCw className="mx-auto h-7 w-7 animate-spin text-[#1F3A5C]"/><p className="mt-3 text-xs font-bold text-stone-500">Loading your contributions...</p></div></div>;
  if (error) return <div className="min-h-screen bg-[#FAF8F3] p-6"><div className="mx-auto max-w-5xl rounded-2xl border border-rose-200 bg-rose-50 p-8 text-center"><h1 className="font-serif text-xl font-bold text-rose-900">Unable to Load Contributions</h1><p className="mt-2 text-sm text-rose-700">{error}</p><button onClick={()=>load(true)} className="mt-5 rounded-lg bg-[#1F3A5C] px-4 py-2 text-xs font-bold text-white">Try Again</button></div></div>;
  if (!data) return null;

  const toggle = (setter:React.Dispatch<React.SetStateAction<Record<number,boolean>>>, id:number) => setter(x=>({...x,[id]:!x[id]}));
  const kpis: Array<{label:string;value:number;Icon:React.ComponentType<{className?:string}>;cls:string}> = [
    {label:"Questions",value:data.summary.questions,Icon:FileText,cls:"bg-blue-100 text-blue-700"},
    {label:"Topics",value:data.summary.topics,Icon:Target,cls:"bg-purple-100 text-purple-700"},
    {label:"Chapters",value:data.summary.chapters,Icon:Layers3,cls:"bg-amber-100 text-amber-700"},
    {label:"Subjects",value:data.summary.subjects,Icon:BookOpen,cls:"bg-emerald-100 text-emerald-700"},
    {label:"Packages",value:data.summary.packages,Icon:Package,cls:"bg-pink-100 text-pink-700"},
    {label:"Papers",value:data.summary.papers_assembled,Icon:FileText,cls:"bg-indigo-100 text-indigo-700"},
    {label:"Added to Papers",value:data.summary.questions_added_to_papers,Icon:CheckCircle2,cls:"bg-teal-100 text-teal-700"},
  ];

  return <div className="min-h-screen bg-[#FAF8F3] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="rounded-2xl border border-stone-200 border-t-4 border-t-[#1F3A5C] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <button onClick={()=>router.push("/team")} className="mb-3 flex items-center gap-1.5 text-xs font-bold text-stone-500 hover:text-[#1F3A5C]"><ArrowLeft className="h-3.5 w-3.5"/> Team Portal</button>
            <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Contribution Intelligence</span><span className="rounded bg-stone-100 px-2 py-1 font-mono text-[10px] font-bold text-stone-500">{data.user.role}</span></div>
            <h1 className="mt-3 font-serif text-3xl font-bold text-[#16293F]">My Contributions</h1>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone-500">Your own questions, topics, chapters, subjects, packages and papers, with the complete academic hierarchy and question contribution ratios.</p>
          </div>
          <button onClick={()=>load(true)} disabled={refreshing} className="flex items-center gap-2 self-start rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-xs font-bold text-stone-600 hover:bg-stone-50"><RefreshCw className={`h-3.5 w-3.5 ${refreshing?"animate-spin":""}`}/> Refresh</button>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4 xl:grid-cols-7">
        {kpis.map(({label,value,Icon,cls})=><div key={label} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm"><div className={`flex h-9 w-9 items-center justify-center rounded-lg ${cls}`}><Icon className="h-4 w-4"/></div><p className="mt-3 text-[9px] font-bold uppercase tracking-wider text-stone-400">{label}</p><p className="mt-1 text-2xl font-bold text-[#16293F]">{value}</p></div>)}
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div><h2 className="font-serif text-xl font-bold text-[#16293F]">My Question Contribution Hierarchy</h2><p className="mt-1 text-xs text-stone-500">For every topic: <b>your questions / total questions in the topic</b>.</p></div>
        <div className="mt-5 space-y-3">
          {data.hierarchy.length===0 ? <Empty text="No question contributions are attributed to your account yet."/> : data.hierarchy.map(subject=><div key={subject.id} className="rounded-xl border border-stone-200">
            <button onClick={()=>toggle(setOpenSubjects,subject.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-stone-50"><ChevronRight className={`h-4 w-4 transition ${openSubjects[subject.id]?"rotate-90":""}`}/><BookOpen className="h-4 w-4 text-emerald-600"/><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="text-sm font-bold text-[#16293F]">{subject.name}</span>{subject.exam&&<span className="text-[9px] text-stone-400">{subject.exam.code}</span>}</div><p className="text-[10px] text-stone-400">{subject.contributed_questions} contributed / {subject.total_questions} total questions</p></div><span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-700">{subject.contribution_percent}%</span></button>
            {openSubjects[subject.id]&&<div className="border-t border-stone-100 p-3 space-y-2">{subject.chapters.map(chapter=><div key={chapter.id} className="rounded-lg border border-stone-100"><button onClick={()=>toggle(setOpenChapters,chapter.id)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-stone-50"><ChevronRight className={`h-3.5 w-3.5 transition ${openChapters[chapter.id]?"rotate-90":""}`}/><Layers3 className="h-3.5 w-3.5 text-amber-600"/><div className="flex-1"><span className="text-xs font-bold text-stone-700">{chapter.name}</span><p className="text-[9px] text-stone-400">{chapter.contributed_questions} / {chapter.total_questions} questions</p></div><span className="text-[10px] font-bold text-stone-500">{chapter.contribution_percent}%</span></button>
              {openChapters[chapter.id]&&<div className="border-t border-stone-100 p-3 grid gap-2 md:grid-cols-2">{chapter.topics.map(topic=><div key={topic.id} className="rounded-lg bg-stone-50 p-3"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold text-stone-700">{topic.name}</p><p className="mt-1 text-[10px] text-stone-400">You contributed <b className="text-[#1F3A5C]">{topic.contributed_questions}</b> out of <b>{topic.total_questions}</b></p></div><span className="text-xs font-bold text-[#1F3A5C]">{topic.contribution_percent}%</span></div><Meter value={topic.contributed_questions} total={topic.total_questions}/></div>)}</div>}
            </div>)}</div>}
          </div>)}
        </div>
      </section>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <div><h2 className="font-serif text-xl font-bold text-[#16293F]">Package → Paper → My Questions</h2><p className="mt-1 text-xs text-stone-500">Shows your contributed questions inside the current package/test structure.</p></div>
        <div className="mt-5 space-y-3">{data.packages.length===0?<Empty text="No current packages are attributed or linked to your contributions."/>:data.packages.map(pkg=><div key={pkg.id} className="rounded-xl border border-stone-200"><button onClick={()=>toggle(setOpenPackages,pkg.id)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-stone-50"><ChevronRight className={`h-4 w-4 transition ${openPackages[pkg.id]?"rotate-90":""}`}/><Package className="h-4 w-4 text-pink-600"/><div className="flex-1"><p className="text-sm font-bold text-[#16293F]">{pkg.title}</p><p className="text-[10px] text-stone-400">{pkg.paper_count} papers · {pkg.contributed_questions} / {pkg.total_questions} questions</p></div><span className="text-xs font-bold text-[#1F3A5C]">{pkg.contribution_percent}%</span></button>
          {openPackages[pkg.id]&&<div className="border-t border-stone-100 p-3 space-y-4">
            <div className="rounded-xl bg-stone-50 p-4">
              <div className="flex items-center justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-stone-500">Academic hierarchy in this package</p><p className="mt-1 text-[10px] text-stone-400">Your questions / all unique questions in the package</p></div><span className="text-sm font-bold text-[#1F3A5C]">{pkg.academic_contributed_questions} / {pkg.academic_total_questions}</span></div>
              <Meter value={pkg.academic_contributed_questions} total={pkg.academic_total_questions}/>
              <div className="mt-4 space-y-2">
                {pkg.subjects.length===0?<p className="text-xs text-stone-400">No contributed question is linked to this package yet.</p>:pkg.subjects.map(subject=><div key={subject.id} className="rounded-lg border border-stone-200 bg-white p-3">
                  <div className="flex items-center justify-between"><p className="text-xs font-bold text-[#16293F]">{subject.name}</p><span className="text-[10px] font-bold text-stone-500">{subject.contributed_questions} / {subject.total_questions}</span></div>
                  <div className="mt-2 space-y-2">{subject.chapters.map(chapter=><div key={chapter.id} className="rounded-lg bg-stone-50 p-3">
                    <div className="flex items-center justify-between"><p className="text-[11px] font-bold text-stone-700">{chapter.name}</p><span className="text-[9px] font-bold text-stone-500">{chapter.contributed_questions} / {chapter.total_questions}</span></div>
                    <div className="mt-2 grid gap-2 md:grid-cols-2">{chapter.topics.map(topic=><div key={topic.id} className="rounded-md border border-stone-200 bg-white p-2.5"><div className="flex items-center justify-between gap-2"><p className="text-[10px] font-semibold text-stone-700">{topic.name}</p><span className="text-[9px] font-bold text-[#1F3A5C]">{topic.contributed_questions} / {topic.total_questions}</span></div><Meter value={topic.contributed_questions} total={topic.total_questions}/><p className="mt-1 text-[8px] text-stone-400">{topic.contribution_percent}% contributed</p></div>)}</div>
                  </div>)}</div>
                </div>)}
              </div>
            </div>

            <div><p className="mb-2 px-1 text-[10px] font-bold uppercase tracking-wider text-stone-400">Papers in this package</p>{pkg.papers.length===0?<p className="p-3 text-xs text-stone-400">No paper is linked to this package yet.</p>:pkg.papers.map(paper=><div key={paper.id} className="mb-2 rounded-lg border border-stone-100"><button onClick={()=>toggle(setOpenPapers,paper.id)} className="flex w-full items-center gap-3 p-3 text-left hover:bg-stone-50"><ChevronRight className={`h-3.5 w-3.5 transition ${openPapers[paper.id]?"rotate-90":""}`}/><FileText className="h-3.5 w-3.5 text-indigo-600"/><div className="flex-1"><p className="text-xs font-bold text-stone-700">{paper.title}</p><p className="text-[9px] text-stone-400">Your {paper.contributed_questions} / {paper.total_questions} questions</p></div><span className="text-[10px] font-bold text-stone-500">{paper.contribution_percent}%</span></button>
              {openPapers[paper.id]&&<div className="border-t border-stone-100 p-3">{paper.questions.length===0?<p className="text-xs text-stone-400">No question created by you is currently in this paper.</p>:<div className="space-y-2">{paper.questions.map(q=><div key={q.id} className="rounded-lg bg-stone-50 p-3"><div className="flex flex-wrap items-center gap-2"><span className="rounded bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700">Q#{q.id}</span><span className="text-[10px] text-stone-500">{q.subject.name} / {q.chapter.name} / {q.topic.name}</span></div></div>)}</div>}</div>}
            </div>)}</div>
          </div>}
        </div>)}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 p-6"><h2 className="font-serif text-xl font-bold text-[#16293F]">Papers I Assembled</h2><p className="mt-1 text-xs text-stone-500">Tests/papers where you are the recorded assembler.</p></div><div className="divide-y divide-stone-100">{data.papers.length===0?<Empty text="No papers are attributed to your account yet."/>:data.papers.map(p=><div key={p.id} className="p-4"><div className="flex items-start gap-3"><FileText className="mt-0.5 h-4 w-4 text-indigo-600"/><div className="min-w-0 flex-1"><p className="text-sm font-bold text-[#16293F]">{p.title}</p><p className="mt-1 text-[10px] text-stone-400">{p.exam_code||"—"} · {p.total_questions} questions · {p.total_marks} marks</p></div><span className="rounded-full bg-indigo-50 px-2 py-1 text-[9px] font-bold text-indigo-700">{p.questions_added_by_me} added</span></div><p className="mt-2 text-[9px] text-stone-400">Created {date(p.created_at)}</p></div>)}</div></div>
        <div className="rounded-2xl border border-stone-200 bg-white shadow-sm"><div className="border-b border-stone-200 p-6"><h2 className="font-serif text-xl font-bold text-[#16293F]">Questions Added to Papers</h2><p className="mt-1 text-xs text-stone-500">Collaborative paper assembly contributions recorded with added_by.</p></div><div className="max-h-[520px] overflow-y-auto divide-y divide-stone-100">{data.collaborative_paper_additions.length===0?<Empty text="No collaborative paper additions found."/>:data.collaborative_paper_additions.map((x,i)=><div key={`${x.test_id}-${x.question_id}-${i}`} className="p-4"><div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-teal-600"/><p className="text-xs font-bold text-[#16293F]">{x.test_title}</p></div><p className="mt-1 text-[10px] text-stone-500">Question #{x.question_id} · {x.subject.name} / {x.chapter.name} / {x.topic.name}</p></div>)}</div></div>
      </section>

      <footer className="flex flex-col gap-2 rounded-xl border border-stone-200 bg-white p-4 text-[10px] text-stone-400 sm:flex-row sm:justify-between"><span>Showing only your attributed contributions.</span><span>Generated {date(data.generated_at)}</span></footer>
    </div>
  </div>;
}

function Empty({text}:{text:string}) { return <div className="p-10 text-center text-xs text-stone-400">{text}</div>; }
