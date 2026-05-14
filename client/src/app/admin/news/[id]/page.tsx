'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category { id: string; name: string; }

export default function NewsFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new'; const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [titleEn, setTitleEn] = useState(''); const [summaryEn, setSummaryEn] = useState(''); const [contentEn, setContentEn] = useState('');
  const [titleZh, setTitleZh] = useState(''); const [summaryZh, setSummaryZh] = useState(''); const [contentZh, setContentZh] = useState('');
  const [showZh, setShowZh] = useState(false);
  const [coverImage, setCoverImage] = useState<string|null>(null);
  const [isPublished, setIsPublished] = useState(true);
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().slice(0,10));

  useEffect(() => { loadCategories(); if (!isNew) loadNews(); }, [id]);

  async function loadCategories() {
    const token = getToken(); try { setCategories(await apiClient.get<Category[]>('/api/categories?type=news', token!)); } catch {}
  }
  async function loadNews() {
    const token = getToken();
    try {
      const r = await apiClient.get<any>(`/api/news/admin?limit=100`, token!);
      const n = r.items.find((p:any)=>p.id===id);
      if(!n){setError('Not found');return}
      setSlug(n.slug); setCategoryId(n.categoryId); setCoverImage(n.coverImage); setIsPublished(n.isPublished);
      if(n.publishedAt) setPublishedAt(new Date(n.publishedAt).toISOString().slice(0,10));
      const t = JSON.parse(n.translations||'{}');
      setTitleEn(t.en?.title||''); setSummaryEn(t.en?.summary||''); setContentEn(t.en?.content||'');
      setTitleZh(t.zh?.title||''); setSummaryZh(t.zh?.summary||''); setContentZh(t.zh?.content||'');
      if (t.zh?.title) setShowZh(true);
    } catch(e){setError('Failed');} finally {setLoading(false);}
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSaving(true); setError('');
    const data = { categoryId, slug, translations:{en:{title:titleEn,summary:summaryEn,content:contentEn},zh:{title:titleZh,summary:summaryZh,content:contentZh}}, coverImage, isPublished, publishedAt };
    try {
      if(isNew) await apiClient.post('/api/news', data, getToken()!);
      else await apiClient.put(`/api/news/${id}`, data, getToken()!);
      router.push('/admin/news');
    } catch(e:any){setError(e.message||'Failed');} finally {setSaving(false);}
  }

  if(loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Loading...</h1>{Array.from({length:5}).map((_,i)=>(<div key={i} className="h-12 skeleton rounded-xl"/>))}</div>;

  const f = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold text-text-primary">{isNew?'New Article':'Edit Article'}</h1><button onClick={()=>router.push('/admin/news')} className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-bg-alt">Cancel</button></div>
      {error&&<div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1.5">Category *</label><select value={categoryId} onChange={e=>setCategoryId(e.target.value)} required className={f}><option value="">Select</option>{categories.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div><label className="block text-sm font-medium mb-1.5">Slug *</label><input type="text" value={slug} onChange={e=>setSlug(e.target.value)} required className={f}/></div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Content (English)</h2>
          <div><label className="block text-sm font-medium mb-1.5">Title *</label><input type="text" value={titleEn} onChange={e=>setTitleEn(e.target.value)} required className={f}/></div>
          <div><label className="block text-sm font-medium mb-1.5">Summary</label><textarea value={summaryEn} onChange={e=>setSummaryEn(e.target.value)} rows={2} className={f}/></div>
          <div><label className="block text-sm font-medium mb-1.5">Content</label><textarea value={contentEn} onChange={e=>setContentEn(e.target.value)} rows={8} className={f}/></div>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <button type="button" onClick={() => setShowZh(!showZh)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showZh ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Chinese Translation (optional, auto-fallbacks to English)
          </button>
          {showZh && (
            <div className="space-y-4 pt-2">
              <div><label className="block text-sm font-medium mb-1.5">Title (ZH)</label><input type="text" value={titleZh} onChange={e=>setTitleZh(e.target.value)} className={f}/></div>
              <div><label className="block text-sm font-medium mb-1.5">Summary (ZH)</label><textarea value={summaryZh} onChange={e=>setSummaryZh(e.target.value)} rows={2} className={f}/></div>
              <div><label className="block text-sm font-medium mb-1.5">Content (ZH)</label><textarea value={contentZh} onChange={e=>setContentZh(e.target.value)} rows={8} className={f}/></div>
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Cover Image</h2>
          <ImageUploader images={coverImage?[coverImage]:[]} onChange={(imgs)=>setCoverImage(imgs[0]||null)} max={1}/>
        </div>
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublished} onChange={e=>setIsPublished(e.target.checked)} className="w-4 h-4 rounded border-border text-accent"/>Published</label>
            <div><label className="block text-sm font-medium mb-1.5">Publish Date</label><input type="date" value={publishedAt} onChange={e=>setPublishedAt(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm"/></div>
          </div>
        </div>
        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50">{saving?'Saving...':isNew?'Create Article':'Save Changes'}</button>
          <button type="button" onClick={()=>router.push('/admin/news')} className="px-6 py-2.5 border border-border text-text-secondary font-medium rounded-lg hover:bg-bg-alt">Cancel</button>
        </div>
      </form>
    </div>
  );
}
