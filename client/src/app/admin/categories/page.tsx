'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

type CategoryType = 'product' | 'news' | 'case';

const categoryLabels: Record<CategoryType, string> = {
  product: 'Product Categories',
  news: 'News Categories',
  case: 'Case Categories',
};

export default function CategoriesAdminPage() {
  const [activeType, setActiveType] = useState<CategoryType>('product');
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [newTrEn, setNewTrEn] = useState('');
  const [newTrZh, setNewTrZh] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');
  const [editTrEn, setEditTrEn] = useState('');
  const [editTrZh, setEditTrZh] = useState('');
  const token = getToken();

  useEffect(() => { loadCategories(activeType); }, [activeType]);

  async function loadCategories(type: CategoryType) {
    if (!token) return;
    setLoading(true);
    try { setCategories(await apiClient.get<any[]>(`/api/categories?type=${type}`, token)); } catch {}
    finally { setLoading(false); }
  }

  function switchType(type: CategoryType) {
    setActiveType(type);
    resetForm();
    resetEdit();
  }

  function resetForm() {
    setNewName(''); setNewSlug(''); setNewTrEn(''); setNewTrZh('');
  }

  function resetEdit() {
    setEditingId(null); setEditName(''); setEditSlug(''); setEditTrEn(''); setEditTrZh('');
  }

  async function handleCreate() {
    if (!newName || !newSlug) return alert('Name and slug are required');
    try {
      await apiClient.post('/api/categories', {
        type: activeType,
        name: newName,
        slug: newSlug,
        translations: { en: newTrEn || newName, zh: newTrZh || newName },
        sortOrder: categories.length,
      }, token!);
      resetForm();
      loadCategories(activeType);
    } catch (e: any) { alert(e.message); }
  }

  function startEdit(c: any) {
    const tr = JSON.parse(c.translations || '{}');
    setEditingId(c.id);
    setEditName(c.name);
    setEditSlug(c.slug);
    setEditTrEn(tr.en || '');
    setEditTrZh(tr.zh || '');
  }

  async function handleUpdate() {
    if (!editingId) return;
    try {
      await apiClient.put(`/api/categories/${editingId}?type=${activeType}`, {
        name: editName,
        slug: editSlug,
        translations: { en: editTrEn, zh: editTrZh },
      }, token!);
      resetEdit();
      loadCategories(activeType);
    } catch (e: any) { alert(e.message); }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete category "${name}"?`)) return;
    try {
      await apiClient.delete(`/api/categories/${id}?type=${activeType}`, token!);
      loadCategories(activeType);
    } catch (e: any) { alert(e.message); }
  }

  const fCls = "px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Category Management</h1>

      {/* Type Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {(Object.keys(categoryLabels) as CategoryType[]).map(t => (
          <button
            key={t}
            onClick={() => switchType(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${activeType === t ? 'bg-primary text-white' : 'text-text-secondary hover:bg-bg-alt'}`}
          >
            {categoryLabels[t]}
          </button>
        ))}
      </div>

      {/* Create Form */}
      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-3">
        <h2 className="text-lg font-semibold">Add {activeType} Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-text-secondary mb-1">Name *</label>
            <input value={newName} onChange={e => { setNewName(e.target.value); setNewSlug(e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')); }} className={fCls + ' w-full'} placeholder="Water Tank"/>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Slug *</label>
            <input value={newSlug} onChange={e => setNewSlug(e.target.value)} className={fCls + ' w-full'} placeholder="water-tank"/>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Translation (EN)</label>
            <input value={newTrEn} onChange={e => setNewTrEn(e.target.value)} className={fCls + ' w-full'} placeholder="Water Tank"/>
          </div>
          <div>
            <label className="block text-xs text-text-secondary mb-1">Translation (ZH)</label>
            <input value={newTrZh} onChange={e => setNewTrZh(e.target.value)} className={fCls + ' w-full'} placeholder="水箱"/>
          </div>
        </div>
        <button onClick={handleCreate} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors text-sm">Add Category</button>
      </div>

      {/* Category List */}
      {loading ? (
        <div className="space-y-2">{Array.from({length:3}).map((_,i)=>(<div key={i} className="h-14 skeleton rounded-xl"/>))}</div>
      ) : categories.length === 0 ? (
        <div className="text-center text-text-secondary py-8">No categories yet.</div>
      ) : (
        <div className="space-y-2">
          {categories.map(c => (
            <div key={c.id} className="bg-white rounded-xl border border-border p-4">
              {editingId === c.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Name</label>
                      <input value={editName} onChange={e => setEditName(e.target.value)} className={fCls + ' w-full'}/>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">Slug</label>
                      <input value={editSlug} onChange={e => setEditSlug(e.target.value)} className={fCls + ' w-full'}/>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">EN Translation</label>
                      <input value={editTrEn} onChange={e => setEditTrEn(e.target.value)} className={fCls + ' w-full'}/>
                    </div>
                    <div>
                      <label className="block text-xs text-text-secondary mb-1">ZH Translation</label>
                      <input value={editTrZh} onChange={e => setEditTrZh(e.target.value)} className={fCls + ' w-full'}/>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleUpdate} className="px-4 py-1.5 bg-primary text-white text-sm rounded-lg hover:bg-primary-light">Save</button>
                    <button onClick={resetEdit} className="px-4 py-1.5 border border-border text-sm rounded-lg hover:bg-bg-alt">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-text-primary">{c.name}</span>
                    <span className="text-xs text-text-secondary">/{c.slug}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(c)} className="text-xs text-accent hover:bg-accent/5 px-2 py-1 rounded">Edit</button>
                    <button onClick={() => handleDelete(c.id, c.name)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
