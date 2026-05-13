'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface CaseItem {
  id: string;
  slug: string;
  coverImage: string | null;
  isPublished: boolean;
  createdAt: string;
  translations: string;
}

export default function CasesAdminPage() {
  const [cases, setCases] = useState<CaseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => { loadData(); }, [page]);

  async function loadData() {
    const token = getToken();
    if (!token) return;
    setLoading(true);
    try {
      const result = await apiClient.get<any>(`/api/cases/admin?page=${page}&limit=20`, token);
      setCases(result.items);
      setTotalPages(result.totalPages);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Delete case "${slug}"?`)) return;
    const token = getToken();
    try {
      await apiClient.delete(`/api/cases/${id}`, token!);
      loadData();
    } catch (err) { alert('Failed to delete'); }
  }

  function getTranslatedName(translationsStr: string): string {
    try {
      const t: Record<string, any> = JSON.parse(translationsStr);
      return t.en?.name || (Object.values(t)[0] as any)?.name || '—';
    } catch { return '—'; }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Cases</h1>
        <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => (<div key={i} className="h-16 skeleton rounded-xl" />))}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Cases</h1>
        <Link href="/admin/cases/new" className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors">
          + New Case
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-alt">
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Case</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {cases.map((c) => (
              <tr key={c.id} className="hover:bg-bg-alt/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {c.coverImage && <img src={`http://localhost:3001${c.coverImage}`} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                    <div>
                      <div className="text-sm font-medium text-text-primary">{getTranslatedName(c.translations)}</div>
                      <div className="text-xs text-text-secondary">{c.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${c.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{new Date(c.createdAt).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => router.push(`/admin/cases/${c.id}`)} className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">Edit</button>
                  <button onClick={() => handleDelete(c.id, c.slug)} className="ml-2 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">Delete</button>
                </td>
              </tr>
            ))}
            {cases.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-12 text-center text-text-secondary">No cases found. <Link href="/admin/cases/new" className="text-accent hover:underline">Create your first case</Link></td></tr>
            )}
          </tbody>
        </table>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-bg-alt">Previous</button>
            <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-bg-alt">Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
