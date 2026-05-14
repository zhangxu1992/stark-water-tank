'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface Faq { id: string; translations: string; isPublished: boolean; sortOrder: number; metaTitle: string | null; metaDescription: string | null; metaKeywords: string | null; }

export default function FaqsAdminPage() {
  const [faqs, setFaqs] = useState<Faq[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [questionEn, setQuestionEn] = useState('');
  const [answerEn, setAnswerEn] = useState('');
  const [questionZh, setQuestionZh] = useState('');
  const [answerZh, setAnswerZh] = useState('');
  const [showZh, setShowZh] = useState(false);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => { loadFaqs(); }, []);

  async function loadFaqs() {
    const token = getToken(); if (!token) return;
    setLoading(true);
    try { setFaqs(await apiClient.get<Faq[]>('/api/faqs/admin', token)); } catch {} finally { setLoading(false); }
  }

  function getQuestion(t: string): string {
    try { const o = JSON.parse(t); return o.en?.question || ''; } catch { return ''; }
  }

  async function handleSave() {
    const token = getToken(); if (!token) return;
    const data = {
      translations: { en: { question: questionEn, answer: answerEn }, zh: { question: questionZh, answer: answerZh } },
      metaTitle: metaTitle || null, metaDescription: metaDesc || null, metaKeywords: metaKeywords || null,
      isPublished, sortOrder,
    };
    try {
      if (editingId) await apiClient.put(`/api/faqs/${editingId}`, data, token!);
      else await apiClient.post('/api/faqs', data, token!);
      cancelEdit();
      loadFaqs();
    } catch {}
  }

  async function handleEdit(faq: Faq) {
    setEditingId(faq.id); setIsPublished(faq.isPublished); setSortOrder(faq.sortOrder);
    const t = JSON.parse(faq.translations || '{}');
    setQuestionEn(t.en?.question || ''); setAnswerEn(t.en?.answer || '');
    setQuestionZh(t.zh?.question || ''); setAnswerZh(t.zh?.answer || '');
    if (t.zh?.question) setShowZh(true);
    setMetaTitle(faq.metaTitle || ''); setMetaDesc(faq.metaDescription || ''); setMetaKeywords(faq.metaKeywords || '');
    if (faq.metaTitle) setShowSeo(true);
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this FAQ?')) return;
    try { await apiClient.delete(`/api/faqs/${id}`, getToken()!); loadFaqs(); } catch {}
  }

  function cancelEdit() {
    setEditingId(null); setQuestionEn(''); setAnswerEn(''); setQuestionZh(''); setAnswerZh('');
    setMetaTitle(''); setMetaDesc(''); setMetaKeywords('');
    setIsPublished(true); setSortOrder(0); setShowZh(false); setShowSeo(false);
  }

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">FAQs</h1><div className="space-y-2">{Array.from({length:3}).map((_,i)=>(<div key={i} className="h-20 skeleton rounded-xl"/>))}</div></div>;

  const f = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">FAQs</h1>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">{editingId ? 'Edit FAQ' : 'Add FAQ'}</h2>
        <div>
          <label className="block text-sm font-medium mb-1.5">Question *</label>
          <input placeholder="Question" value={questionEn} onChange={e=>setQuestionEn(e.target.value)} className={f}/>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Answer</label>
          <textarea placeholder="Answer" value={answerEn} onChange={e=>setAnswerEn(e.target.value)} rows={3} className={f}/>
        </div>

        <button type="button" onClick={() => setShowZh(!showZh)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showZh ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Chinese Translation (optional)
        </button>
        {showZh && (
          <div className="space-y-4 pt-2 pl-4 border-l-2 border-border">
            <div><label className="block text-sm font-medium mb-1.5">Question (ZH)</label><input placeholder="问题" value={questionZh} onChange={e=>setQuestionZh(e.target.value)} className={f}/></div>
            <div><label className="block text-sm font-medium mb-1.5">Answer (ZH)</label><textarea placeholder="答案" value={answerZh} onChange={e=>setAnswerZh(e.target.value)} rows={3} className={f}/></div>
          </div>
        )}

        {/* SEO */}
        <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showSeo ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
          SEO Information (optional, for landing page SEO if this FAQ appears on /about)
        </button>
        {showSeo && (
          <div className="space-y-3 pt-2 pl-4 border-l-2 border-border">
            <div><label className="block text-sm font-medium mb-1">Meta Title</label><input value={metaTitle} onChange={e=>setMetaTitle(e.target.value)} className={f}/></div>
            <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea value={metaDesc} onChange={e=>setMetaDesc(e.target.value)} rows={2} className={f}/></div>
            <div><label className="block text-sm font-medium mb-1">Meta Keywords</label><input value={metaKeywords} onChange={e=>setMetaKeywords(e.target.value)} className={f}/></div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} className="w-4 h-4"/>Published</label>
          <div className="flex items-center gap-2"><label className="text-sm">Order:</label><input type="number" value={sortOrder} onChange={e=>setSortOrder(parseInt(e.target.value)||0)} className="w-20 px-2 py-1 border rounded text-sm"/></div>
        </div>
        <div className="flex gap-3">
          <button onClick={handleSave} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light">{editingId ? 'Update' : 'Add FAQ'}</button>
          {editingId && <button onClick={cancelEdit} className="px-4 py-2 border text-sm rounded-lg">Cancel</button>}
        </div>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-white rounded-xl border border-border p-4 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="text-sm font-medium text-text-primary">{getQuestion(faq.translations)}</div>
              <span className={`text-xs ${faq.isPublished ? 'text-green-600' : 'text-gray-400'}`}>{faq.isPublished ? 'Published' : 'Draft'}</span>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={()=>handleEdit(faq)} className="px-3 py-1 text-xs text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg">Edit</button>
              <button onClick={()=>handleDelete(faq.id)} className="px-3 py-1 text-xs text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
            </div>
          </div>
        ))}
        {faqs.length === 0 && <p className="text-center text-text-secondary py-8">No FAQs yet.</p>}
      </div>
    </div>
  );
}
