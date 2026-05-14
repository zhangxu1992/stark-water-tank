'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import ImageUploader from '@/components/admin/ImageUploader';

export default function CaseFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();

  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [slug, setSlug] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [contentEn, setContentEn] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [descZh, setDescZh] = useState('');
  const [contentZh, setContentZh] = useState('');
  const [showZh, setShowZh] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDesc, setMetaDesc] = useState('');
  const [metaKeywords, setMetaKeywords] = useState('');
  const [showSeo, setShowSeo] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => { if (!isNew) loadCase(); }, [id]);

  async function loadCase() {
    const token = getToken();
    try {
      const result = await apiClient.get<any>(`/api/cases/admin?limit=100`, token!);
      const item = result.items.find((p: any) => p.id === id);
      if (!item) { setError('Case not found'); return; }
      setSlug(item.slug);
      setImages(JSON.parse(item.images || '[]'));
      setIsPublished(item.isPublished);
      setSortOrder(item.sortOrder);
      const t = JSON.parse(item.translations || '{}');
      setNameEn(t.en?.name || ''); setDescEn(t.en?.description || ''); setContentEn(t.en?.content || '');
      setNameZh(t.zh?.name || ''); setDescZh(t.zh?.description || ''); setContentZh(t.zh?.content || '');
      if (t.zh?.name) setShowZh(true);
      setMetaTitle(item.metaTitle || ''); setMetaDesc(item.metaDescription || ''); setMetaKeywords(item.metaKeywords || '');
      if (item.metaTitle) setShowSeo(true);
    } catch (err) { setError('Failed to load case'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const data = {
      slug,
      translations: { en: { name: nameEn, description: descEn, content: contentEn }, zh: { name: nameZh, description: descZh, content: contentZh } },
      images, coverImage: images[0] || null,
      metaTitle: metaTitle || null, metaDescription: metaDesc || null, metaKeywords: metaKeywords || null,
      isPublished, sortOrder,
    };
    const token = getToken();
    try {
      if (isNew) await apiClient.post('/api/cases', data, token!);
      else await apiClient.put(`/api/cases/${id}`, data, token!);
      router.push('/admin/cases');
    } catch (err: any) { setError(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Loading...</h1>{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 skeleton rounded-xl" />))}</div>;

  const f = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{isNew ? 'New Case' : 'Edit Case'}</h1>
        <button onClick={() => router.push('/admin/cases')} className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-bg-alt">Cancel</button>
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium mb-1.5">Slug *</label>
            <input type="text" value={slug} onChange={e => setSlug(e.target.value)} required placeholder="kenya-water-project" className={f} />
          </div>
        </div>

        {/* EN */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Content (English)</h2>
          <div><label className="block text-sm font-medium mb-1.5">Name *</label><input type="text" value={nameEn} onChange={e => setNameEn(e.target.value)} required className={f} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Description</label><textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={3} className={f} /></div>
          <div><label className="block text-sm font-medium mb-1.5">Content</label><textarea value={contentEn} onChange={e => setContentEn(e.target.value)} rows={6} className={f} /></div>
        </div>

        {/* ZH (collapsible) */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <button type="button" onClick={() => setShowZh(!showZh)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showZh ? 'rotate-90' : ''}`}>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chinese Translation (optional, auto-fallbacks to English)
          </button>
          {showZh && (
            <div className="space-y-4 pt-2">
              <div><label className="block text-sm font-medium mb-1.5">Name (ZH)</label><input type="text" value={nameZh} onChange={e => setNameZh(e.target.value)} className={f} /></div>
              <div><label className="block text-sm font-medium mb-1.5">Description (ZH)</label><textarea value={descZh} onChange={e => setDescZh(e.target.value)} rows={3} className={f} /></div>
              <div><label className="block text-sm font-medium mb-1.5">Content (ZH)</label><textarea value={contentZh} onChange={e => setContentZh(e.target.value)} rows={6} className={f} /></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <button type="button" onClick={() => setShowSeo(!showSeo)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showSeo ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            SEO Information
          </button>
          {showSeo && (
            <div className="space-y-3 pt-2">
              <div><label className="block text-sm font-medium mb-1">Meta Title</label><input value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className={f} /></div>
              <div><label className="block text-sm font-medium mb-1">Meta Description</label><textarea value={metaDesc} onChange={e => setMetaDesc(e.target.value)} rows={3} className={f} /></div>
              <div><label className="block text-sm font-medium mb-1">Meta Keywords</label><input value={metaKeywords} onChange={e => setMetaKeywords(e.target.value)} className={f} /></div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Settings</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} className="w-4 h-4 rounded border-border text-accent" />Published</label>
            <div><label className="block text-sm font-medium mb-1.5">Sort Order</label><input type="number" value={sortOrder} onChange={e => setSortOrder(parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50">{saving ? 'Saving...' : isNew ? 'Create Case' : 'Save Changes'}</button>
          <button type="button" onClick={() => router.push('/admin/cases')} className="px-6 py-2.5 border border-border text-text-secondary font-medium rounded-lg hover:bg-bg-alt">Cancel</button>
        </div>
      </form>
    </div>
  );
}
