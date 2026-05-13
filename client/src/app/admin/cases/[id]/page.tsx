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
  const [images, setImages] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    if (!isNew) loadCase();
  }, [id]);

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
    } catch (err) { setError('Failed to load case'); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    const data = {
      slug,
      translations: {
        en: { name: nameEn, description: descEn, content: contentEn },
        zh: { name: nameZh, description: descZh, content: contentZh },
      },
      images,
      coverImage: images[0] || null,
      isPublished,
      sortOrder,
    };
    const token = getToken();
    try {
      if (isNew) await apiClient.post('/api/cases', data, token!);
      else await apiClient.put(`/api/cases/${id}`, data, token!);
      router.push('/admin/cases');
    } catch (err: any) { setError(err.message || 'Failed to save'); }
    finally { setSaving(false); }
  }

  if (loading) {
    return <div className="space-y-4"><h1 className="text-2xl font-semibold text-text-primary">Loading...</h1>{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-12 skeleton rounded-xl" />))}</div>;
  }

  const fieldCls = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y";

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">{isNew ? 'New Case' : 'Edit Case'}</h1>
        <button onClick={() => router.push('/admin/cases')} className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-bg-alt transition-colors">Cancel</button>
      </div>
      {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Slug *</label>
            <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)} required placeholder="kenya-water-project" className={fieldCls} />
          </div>
        </div>

        {/* EN */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">English Content</h2>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Name *</label><input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)} required className={fieldCls} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Description</label><textarea value={descEn} onChange={(e) => setDescEn(e.target.value)} rows={3} className={fieldCls} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Content</label><textarea value={contentEn} onChange={(e) => setContentEn(e.target.value)} rows={6} className={fieldCls} /></div>
        </div>

        {/* ZH */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Chinese Content</h2>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Name</label><input type="text" value={nameZh} onChange={(e) => setNameZh(e.target.value)} className={fieldCls} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Description</label><textarea value={descZh} onChange={(e) => setDescZh(e.target.value)} rows={3} className={fieldCls} /></div>
          <div><label className="block text-sm font-medium text-text-primary mb-1.5">Content</label><textarea value={contentZh} onChange={(e) => setContentZh(e.target.value)} rows={6} className={fieldCls} /></div>
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          <div className="flex flex-wrap gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isPublished} onChange={(e) => setIsPublished(e.target.checked)} className="w-4 h-4 rounded border-border text-accent focus:ring-accent" />Published</label>
            <div><label className="block text-sm font-medium text-text-primary mb-1.5">Sort Order</label><input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)} className="w-24 px-3 py-2 border border-border rounded-lg text-sm" /></div>
          </div>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">{saving ? 'Saving...' : isNew ? 'Create Case' : 'Save Changes'}</button>
          <button type="button" onClick={() => router.push('/admin/cases')} className="px-6 py-2.5 border border-border text-text-secondary font-medium rounded-lg hover:bg-bg-alt transition-colors">Cancel</button>
        </div>
      </form>
    </div>
  );
}
