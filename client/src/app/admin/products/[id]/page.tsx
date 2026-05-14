'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import ImageUploader from '@/components/admin/ImageUploader';

interface Category {
  id: string;
  name: string;
}

export default function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const isNew = id === 'new';
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [descEn, setDescEn] = useState('');
  const [nameZh, setNameZh] = useState('');
  const [descZh, setDescZh] = useState('');
  const [showZh, setShowZh] = useState(false);
  const [parameters, setParameters] = useState<{ key_en: string; key_zh: string; value: string }[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [industryInput, setIndustryInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [isPublished, setIsPublished] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  useEffect(() => {
    loadCategories();
    if (!isNew) {
      loadProduct();
    }
  }, [id]);

  async function loadCategories() {
    const token = getToken();
    try {
      const cats = await apiClient.get<Category[]>('/api/categories?type=product', token!);
      setCategories(cats);
    } catch (err) {}
  }

  async function loadProduct() {
    const token = getToken();
    try {
      const result = await apiClient.get<any>(`/api/products/admin?limit=100`, token!);
      const product = result.items.find((p: any) => p.id === id);
      if (!product) {
        setError('Product not found');
        return;
      }

      setSlug(product.slug);
      setCategoryId(product.categoryId);
      setImages(JSON.parse(product.images || '[]'));
      setIsPublished(product.isPublished);
      setSortOrder(product.sortOrder);

      const t = JSON.parse(product.translations || '{}');
      setNameEn(t.en?.name || '');
      setDescEn(t.en?.description || '');
      setNameZh(t.zh?.name || '');
      setDescZh(t.zh?.description || '');

      setParameters(JSON.parse(product.parameters || '[]'));
      setIndustries(JSON.parse(product.industries || '[]'));
    } catch (err) {
      setError('Failed to load product');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    const data = {
      categoryId,
      slug,
      translations: {
        en: { name: nameEn, description: descEn },
        zh: { name: nameZh, description: descZh },
      },
      parameters,
      industries,
      images,
      coverImage: images[0] || null,
      isPublished,
      sortOrder,
    };

    const token = getToken();
    try {
      if (isNew) {
        await apiClient.post('/api/products', data, token!);
      } else {
        await apiClient.put(`/api/products/${id}`, data, token!);
      }
      router.push('/admin/products');
    } catch (err: any) {
      setError(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  function addParameter() {
    setParameters([...parameters, { key_en: '', key_zh: '', value: '' }]);
  }

  function updateParameter(index: number, field: string, value: string) {
    const updated = [...parameters];
    (updated[index] as any)[field] = value;
    setParameters(updated);
  }

  function removeParameter(index: number) {
    setParameters(parameters.filter((_, i) => i !== index));
  }

  function addIndustry() {
    if (industryInput.trim()) {
      setIndustries([...industries, industryInput.trim()]);
      setIndustryInput('');
    }
  }

  function removeIndustry(index: number) {
    setIndustries(industries.filter((_, i) => i !== index));
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-text-primary">Loading...</h1>
        <div className="space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-12 skeleton rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">
          {isNew ? 'New Product' : 'Edit Product'}
        </h1>
        <button
          onClick={() => router.push('/admin/products')}
          className="px-4 py-2 border border-border text-sm rounded-lg hover:bg-bg-alt transition-colors"
        >
          Cancel
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Basic Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Category *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Slug *</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="stainless-steel-tank-304"
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        {/* English Content (primary) */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Content (English)</h2>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Name *</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-1.5">Description</label>
            <textarea
              value={descEn}
              onChange={(e) => setDescEn(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"
            />
          </div>
        </div>

        {/* Chinese Translation (optional, expandable) */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <button type="button" onClick={() => setShowZh(!showZh)} className="flex items-center gap-2 text-sm text-text-secondary hover:text-primary transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${showZh ? 'rotate-90' : ''}`}>
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Chinese Translation (optional, auto-fallbacks to English)
          </button>
          {showZh && (
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Name (ZH)</label>
                <input type="text" value={nameZh} onChange={(e) => setNameZh(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Description (ZH)</label>
                <textarea value={descZh} onChange={(e) => setDescZh(e.target.value)} rows={4}
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y" />
              </div>
            </div>
          )}
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Images</h2>
          <ImageUploader images={images} onChange={setImages} />
        </div>

        {/* Parameters */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-text-primary">Product Parameters</h2>
            <button type="button" onClick={addParameter} className="text-sm text-accent hover:underline">+ Add Parameter</button>
          </div>

          {parameters.map((param, i) => (
            <div key={i} className="grid grid-cols-3 gap-3 p-3 bg-bg-alt rounded-lg">
              <input
                type="text"
                placeholder="Key (EN)"
                value={param.key_en}
                onChange={(e) => updateParameter(i, 'key_en', e.target.value)}
                className="px-2 py-1.5 border border-border rounded text-sm bg-white"
              />
              <input
                type="text"
                placeholder="Key (ZH)"
                value={param.key_zh}
                onChange={(e) => updateParameter(i, 'key_zh', e.target.value)}
                className="px-2 py-1.5 border border-border rounded text-sm bg-white"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Value"
                  value={param.value}
                  onChange={(e) => updateParameter(i, 'value', e.target.value)}
                  className="flex-1 px-2 py-1.5 border border-border rounded text-sm bg-white"
                />
                <button type="button" onClick={() => removeParameter(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 18L18 6M6 6l12 12" strokeLinecap="round"/></svg>
                </button>
              </div>
            </div>
          ))}
          {parameters.length === 0 && <p className="text-sm text-text-secondary">No parameters added yet.</p>}
        </div>

        {/* Industries */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Applicable Industries</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={industryInput}
              onChange={(e) => setIndustryInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addIndustry(); } }}
              placeholder="Food & Beverage"
              className="flex-1 px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            <button type="button" onClick={addIndustry} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light transition-colors">
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {industries.map((ind, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-bg-alt rounded-full text-sm text-text-secondary">
                {ind}
                <button type="button" onClick={() => removeIndustry(i)} className="text-text-secondary hover:text-red-500">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round"/></svg>
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded border-border text-accent focus:ring-accent"
              />
              <label htmlFor="isPublished" className="text-sm text-text-primary">Published</label>
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Sort Order</label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : isNew ? 'Create Product' : 'Save Changes'}
          </button>
          <button
            type="button"
            onClick={() => router.push('/admin/products')}
            className="px-6 py-2.5 border border-border text-text-secondary font-medium rounded-lg hover:bg-bg-alt transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
