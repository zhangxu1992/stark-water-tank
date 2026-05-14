'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

const PRESET_SLUGS = ['about', 'privacy-policy', 'terms-of-service', 'factory-tour', 'quality-control', 'shipping-policy', 'warranty'];
const PRESET_LABELS: Record<string,string> = {
  about: 'About Us', 'privacy-policy': 'Privacy Policy', 'terms-of-service': 'Terms of Service',
  'factory-tour': 'Factory Tour', 'quality-control': 'Quality Control', 'shipping-policy': 'Shipping Policy', warranty: 'Warranty',
};

export default function PagesAdminPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editSlug, setEditSlug] = useState('');
  const [editTitleEn, setEditTitleEn] = useState('');
  const [editContentEn, setEditContentEn] = useState('');
  const [editTitleZh, setEditTitleZh] = useState('');
  const [editContentZh, setEditContentZh] = useState('');
  const [showZh, setShowZh] = useState(false);
  const [isPublished, setIsPublished] = useState(true);
  const token = getToken();

  useEffect(() => { loadPages(); }, []);

  async function loadPages() { if (!token) return; setLoading(true); try { setPages(await apiClient.get<any[]>('/api/pages/admin', token)); } catch {} finally { setLoading(false); } }

  function startNew() {
    setEditingId('new'); setEditSlug(''); setEditTitleEn(''); setEditContentEn('');
    setEditTitleZh(''); setEditContentZh(''); setShowZh(false); setIsPublished(true);
  }

  function startEdit(p: any) {
    setEditingId(p.id); setEditSlug(p.slug); setIsPublished(p.isPublished);
    const t = JSON.parse(p.translations || '{}');
    setEditTitleEn(t.en?.title || ''); setEditContentEn(t.en?.content || '');
    setEditTitleZh(t.zh?.title || ''); setEditContentZh(t.zh?.content || '');
    if (t.zh?.title) setShowZh(true);
  }

  function cancelEdit() {
    setEditingId(null); setEditSlug(''); setEditTitleEn(''); setEditContentEn('');
    setEditTitleZh(''); setEditContentZh(''); setShowZh(false); setIsPublished(true);
  }

  async function handleSave() {
    if (!token || !editSlug) return;
    const data = {
      slug: editSlug,
      translations: { en: { title: editTitleEn, content: editContentEn }, zh: { title: editTitleZh, content: editContentZh } },
      isPublished,
    };
    try {
      if (editingId === 'new') await apiClient.post('/api/pages', data, token);
      else await apiClient.put(`/api/pages/${editingId}`, data, token);
      cancelEdit(); loadPages();
    } catch (e: any) { alert(e.message); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this page?')) return;
    try { await apiClient.delete(`/api/pages/${id}`, token!); loadPages(); } catch {}
  }

  function getTitle(p: any) { try { const t = JSON.parse(p.translations || '{}'); return t.en?.title || p.slug; } catch { return p.slug; } }

  const f = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y";

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Pages Management</h1>

      {/* Quick create from presets */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-semibold">Quick Create Page</h2>
        <p className="text-sm text-text-secondary">Select a preset slug to create a standard page:</p>
        <div className="flex flex-wrap gap-2">
          {PRESET_SLUGS.map(slug => {
            const exists = pages.some(p => p.slug === slug);
            return (
              <button
                key={slug}
                disabled={exists}
                onClick={() => {
                  setEditingId('new'); setEditSlug(slug); setEditTitleEn(PRESET_LABELS[slug] || ''); setEditContentEn('');
                  setEditTitleZh(''); setEditContentZh(''); setShowZh(false); setIsPublished(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${exists ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-bg-alt text-text-secondary hover:bg-border hover:text-text-primary'}`}
              >
                {PRESET_LABELS[slug] || slug} {exists ? '(exists)' : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Form */}
      {editingId && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">{editingId === 'new' ? 'New Page' : 'Edit Page'}</h2>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input value={editSlug} onChange={e => setEditSlug(e.target.value)} className={f} />
            </div>
            <div className="flex items-end gap-2">
              <label className="flex items-center gap-2 text-sm mb-2"><input type="checkbox" checked={isPublished} onChange={e => setIsPublished(e.target.checked)} /> Published</label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Title (EN)</label>
            <input value={editTitleEn} onChange={e => setEditTitleEn(e.target.value)} className={f} />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Content (EN) — HTML supported</label>
            <textarea value={editContentEn} onChange={e => setEditContentEn(e.target.value)} rows={10} className={f} />
          </div>
          <button type="button" onClick={() => setShowZh(!showZh)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showZh ? 'rotate-90' : ''}`}><path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Chinese Translation
          </button>
          {showZh && (
            <div className="space-y-3 pl-4 border-l-2 border-border">
              <div><label className="block text-sm font-medium mb-1">Title (ZH)</label><input value={editTitleZh} onChange={e => setEditTitleZh(e.target.value)} className={f} /></div>
              <div><label className="block text-sm font-medium mb-1">Content (ZH)</label><textarea value={editContentZh} onChange={e => setEditContentZh(e.target.value)} rows={10} className={f} /></div>
            </div>
          )}
          <div className="flex gap-3">
            <button onClick={handleSave} className="px-6 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light">Save</button>
            <button onClick={cancelEdit} className="px-6 py-2.5 border text-sm rounded-lg">Cancel</button>
          </div>
        </div>
      )}

      {!editingId && (
        <button onClick={startNew} className="px-4 py-2 bg-primary text-white text-sm rounded-lg">+ New Page</button>
      )}

      {/* List */}
      {loading ? <div className="space-y-2">{Array.from({length:3}).map((_,i)=>(<div key={i} className="h-12 skeleton rounded-xl"/>))}</div> : (
        <div className="space-y-2">
          {pages.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{getTitle(p)}</span>
                <span className="text-xs text-text-secondary ml-2">/{p.slug}</span>
                {!p.isPublished && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded">Draft</span>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => startEdit(p)} className="text-xs text-accent hover:bg-accent/5 px-2 py-1 rounded">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">Delete</button>
              </div>
            </div>
          ))}
          {pages.length === 0 && <p className="text-center text-text-secondary py-8">No pages yet.</p>}
        </div>
      )}
    </div>
  );
}
