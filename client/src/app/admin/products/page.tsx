'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface Product {
  id: string;
  slug: string;
  coverImage: string | null;
  isPublished: boolean;
  sortOrder: number;
  createdAt: string;
  category: { id: string; name: string } | null;
  translations: string;
}

interface Category {
  id: string;
  name: string;
  _count?: { products: number };
}

export default function ProductsAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, [page, filterCategory]);

  async function loadData() {
    const token = getToken();
    if (!token) return;

    setLoading(true);
    try {
      const [prodResult, cats] = await Promise.all([
        apiClient.get<any>(`/api/products/admin?page=${page}&limit=20${filterCategory ? `&categoryId=${filterCategory}` : ''}`, token),
        apiClient.get<Category[]>('/api/categories?type=product', token),
      ]);
      setProducts(prodResult.items);
      setTotalPages(prodResult.totalPages);
      setCategories(cats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTogglePublished(id: string, current: boolean) {
    const token = getToken();
    try {
      await apiClient.put(`/api/products/${id}`, { isPublished: !current }, token!);
      setProducts(prev => prev.map(p => p.id === id ? { ...p, isPublished: !current } : p));
    } catch {}
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const a = products[index];
    const b = products[index - 1];
    const token = getToken();
    try {
      await Promise.all([
        apiClient.put(`/api/products/${a.id}`, { sortOrder: b.sortOrder }, token!),
        apiClient.put(`/api/products/${b.id}`, { sortOrder: a.sortOrder }, token!),
      ]);
      loadData();
    } catch {}
  }

  async function handleMoveDown(index: number) {
    if (index >= products.length - 1) return;
    const a = products[index];
    const b = products[index + 1];
    const token = getToken();
    try {
      await Promise.all([
        apiClient.put(`/api/products/${a.id}`, { sortOrder: b.sortOrder }, token!),
        apiClient.put(`/api/products/${b.id}`, { sortOrder: a.sortOrder }, token!),
      ]);
      loadData();
    } catch {}
  }

  async function handleDelete(id: string, slug: string) {
    if (!confirm(`Delete product "${slug}"?`)) return;
    const token = getToken();
    try {
      await apiClient.delete(`/api/products/${id}`, token!);
      loadData();
    } catch (err) {
      alert('Failed to delete');
    }
  }

  function getTranslatedName(translationsStr: string): string {
    try {
      const t: Record<string, any> = JSON.parse(translationsStr);
      return t.en?.name || (Object.values(t)[0] as any)?.name || '—';
    } catch {
      return '—';
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Products</h1>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Products</h1>
        <Link
          href="/admin/products/new"
          className="px-4 py-2 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary-light transition-colors"
        >
          + New Product
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={filterCategory}
          onChange={(e) => { setFilterCategory(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-border rounded-lg text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.name} ({cat._count?.products || 0})</option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-bg-alt">
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Product</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Category</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Status</th>
              <th className="text-left px-6 py-3 text-xs font-medium text-text-secondary uppercase">Date</th>
              <th className="text-right px-6 py-3 text-xs font-medium text-text-secondary uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products.map((prod, idx) => (
              <tr key={prod.id} className="hover:bg-bg-alt/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    {prod.coverImage && (
                      <img src={`http://localhost:3001${prod.coverImage}`} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div>
                      <div className="text-sm font-medium text-text-primary">{getTranslatedName(prod.translations)}</div>
                      <div className="text-xs text-text-secondary">{prod.slug}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">{prod.category?.name || '—'}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${prod.isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                    {prod.isPublished ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-text-secondary">
                  {new Date(prod.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:text-primary hover:bg-bg-alt disabled:opacity-30 disabled:cursor-not-allowed" title="Move up">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => handleMoveDown(idx)} disabled={idx === products.length - 1} className="w-7 h-7 flex items-center justify-center rounded text-text-secondary hover:text-primary hover:bg-bg-alt disabled:opacity-30 disabled:cursor-not-allowed" title="Move down">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button onClick={() => handleTogglePublished(prod.id, prod.isPublished)} className={`w-8 h-5 rounded-full relative transition-colors ${prod.isPublished ? 'bg-green-500' : 'bg-gray-300'}`} title={prod.isPublished ? 'Published — click to unpublish' : 'Draft — click to publish'}>
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${prod.isPublished ? 'left-3.5' : 'left-0.5'}`} />
                    </button>
                    <button
                      onClick={() => router.push(`/admin/products/${prod.id}`)}
                      className="px-3 py-1.5 text-xs font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(prod.id, prod.slug)}
                      className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-text-secondary">
                  No products found.{' '}
                  <Link href="/admin/products/new" className="text-accent hover:underline">Create your first product</Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-bg-alt"
            >
              Previous
            </button>
            <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-border rounded-lg disabled:opacity-50 hover:bg-bg-alt"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
