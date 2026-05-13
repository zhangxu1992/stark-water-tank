'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface NewsItem {
  id: string; slug: string; coverImage: string | null;
  isPublished: boolean; createdAt: string; translations: string;
  category: { id: string; name: string } | null;
}

interface Category {
  id: string; name: string; _count?: { news: number };
}

export default function NewsAdminPage() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => { loadData(); }, [page, filterCategory]);

  async function loadData() {
    const token = getToken(); if (!token) return;
    setLoading(true);
    try {
      const [data, cats] = await Promise.all([
        apiClient.get<any>(`/api/news/admin?page=${page}&limit=20${filterCategory ? `&categoryId=${filterCategory}` : ''}`, token),
        apiClient.get<Category[]>('/api/categories?type=news', token),
      ]);
      setItems(data.items); setTotalPages(data.totalPages); setCategories(cats);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Delete "${slug}"?`)) return;
    const token = getToken();
    try { await apiClient.delete(`/api/news/${id}`, token!); loadData(); }
    catch (err) { alert('Failed to delete'); }
  }

  function getTitle(t: string): string {
    try { const o: Record<string, any> = JSON.parse(t); return o.en?.title || (Object.values(o)[0] as any)?.title || '—'; }
    catch { return '—'; }
  }

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">News</h1><div className="space-y-2">{Array.from({length:5}).map((_,i)=>(<div key={i} className="h-16 skeleton rounded-xl"/>))}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">News</h1>
        <Link href="/admin/news/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors">+ New Article</Link>
      </div>
      <div className="flex gap-4">
        <select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }} className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50">
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name} ({c._count?.news||0})</option>)}
        </select>
      </div>
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-bg-alt">
            <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Title</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Category</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
            <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
            <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
          </tr></thead>
          <tbody className="divide-y divide-border">
            {items.map(n => (
              <tr key={n.id} className="hover:bg-bg-alt/50 transition-colors">
                <td className="px-6 py-4"><div className="text-sm font-medium text-text-primary">{getTitle(n.translations)}</div><div className="text-xs text-text-secondary">{n.slug}</div></td>
                <td className="px-6 py-4 text-sm text-text-secondary">{n.category?.name||'—'}</td>
                <td className="px-6 py-4"><span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${n.isPublished?'bg-green-50 text-green-700':'bg-gray-100 text-gray-600'}`}>{n.isPublished?'Published':'Draft'}</span></td>
                <td className="px-6 py-4 text-sm text-text-secondary">{new Date(n.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={()=>router.push(`/admin/news/${n.id}`)} className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg">Edit</button>
                  <button onClick={()=>handleDelete(n.id,n.slug)} className="ml-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg">Delete</button>
                </td>
              </tr>
            ))}
            {items.length===0&&<tr><td colSpan={5} className="px-6 py-12 text-center text-text-secondary">No articles. <Link href="/admin/news/new" className="text-accent hover:underline">Create your first article</Link></td></tr>}
          </tbody>
        </table>
        {totalPages>1&&<div className="flex items-center justify-between px-6 py-4 border-t border-border"><button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50">Previous</button><span className="text-sm text-text-secondary">Page {page} of {totalPages}</span><button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50">Next</button></div>}
      </div>
    </div>
  );
}
