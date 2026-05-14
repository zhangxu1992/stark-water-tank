'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'ar', label: 'Arabic' },
  { code: 'pt', label: 'Portuguese' },
  { code: 'ru', label: 'Russian' },
  { code: 'ja', label: 'Japanese' },
  { code: 'ko', label: 'Korean' },
];

interface SeoRecord {
  id?: string;
  pagePath: string;
  language: string;
  metaTitle: string | null;
  metaDescription: string | null;
  ogTitle: string | null;
  ogDescription: string | null;
  ogImage: string | null;
  canonicalUrl: string | null;
}

export default function SeoAdminPage() {
  const [tab, setTab] = useState<'pages'|'sitemap'>('pages');
  const [pages] = useState([
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/cases', label: 'Cases' },
    { path: '/news', label: 'News' },
    { path: '/about', label: 'About Us' },
    { path: '/contact', label: 'Contact' },
  ]);
  const [activePage, setActivePage] = useState('/');
  const [activeLang, setActiveLang] = useState('en');
  const [seoData, setSeoData] = useState<SeoRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [allSeo, setAllSeo] = useState<SeoRecord[]>([]);
  const [sitemapConfigs, setSitemapConfigs] = useState<any[]>([]);
  const token = getToken();

  useEffect(() => {
    if (tab === 'pages') loadSeoForPage();
    else loadSitemap();
  }, [tab, activePage, activeLang]);

  async function loadSeoForPage() {
    if (!token) return;
    setLoading(true);
    try {
      const items = await apiClient.get<SeoRecord[]>(`/api/seo?pagePath=${encodeURIComponent(activePage)}&language=${activeLang}`, token);
      setSeoData(items[0] || { pagePath: activePage, language: activeLang, metaTitle: null, metaDescription: null, ogTitle: null, ogDescription: null, ogImage: null, canonicalUrl: null });
    } catch {} finally { setLoading(false); }
  }

  async function loadAllSeo() {
    try { setAllSeo(await apiClient.get<SeoRecord[]>('/api/seo', token!)); } catch {}
  }

  async function loadSitemap() {
    try { setSitemapConfigs(await apiClient.get<any[]>('/api/seo/sitemap-config', token!)); } catch {}
  }

  function updateField(field: keyof SeoRecord, value: string) {
    setSeoData(prev => prev ? { ...prev, [field]: value } : null);
  }

  async function saveSeo() {
    if (!seoData || !token) return;
    setSaving(true);
    try {
      await apiClient.put('/api/seo', seoData, token);
      alert('SEO saved!');
    } catch (e: any) { alert(e.message); }
    finally { setSaving(false); }
  }

  const f = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y";

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">SEO Management</h1>

      <div className="flex gap-2 border-b border-border pb-2">
        <button onClick={()=>setTab('pages')} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='pages'?'bg-primary text-white':'text-text-secondary hover:bg-bg-alt'}`}>Page SEO</button>
        <button onClick={()=>{setTab('sitemap');loadSitemap();}} className={`px-4 py-2 rounded-lg text-sm font-medium ${tab==='sitemap'?'bg-primary text-white':'text-text-secondary hover:bg-bg-alt'}`}>Sitemap Config</button>
      </div>

      {tab === 'pages' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          {/* Page + Lang selector */}
          <div className="flex flex-wrap gap-3">
            <div>
              <label className="block text-xs text-text-secondary mb-1">Page</label>
              <select value={activePage} onChange={e => setActivePage(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm">
                {pages.map(p => <option key={p.path} value={p.path}>{p.label} ({p.path})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-text-secondary mb-1">Language</label>
              <select value={activeLang} onChange={e => setActiveLang(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm">
                {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.label} ({l.code})</option>)}
              </select>
            </div>
          </div>

          {loading ? <div className="h-40 skeleton rounded-xl" /> : (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Meta Title</label>
                <input value={seoData?.metaTitle || ''} onChange={e => updateField('metaTitle', e.target.value)} className={f} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Meta Description</label>
                <textarea value={seoData?.metaDescription || ''} onChange={e => updateField('metaDescription', e.target.value)} rows={3} className={f} />
              </div>
              <details className="group">
                <summary className="text-sm text-text-secondary cursor-pointer hover:text-primary">Open Graph (optional)</summary>
                <div className="space-y-3 pt-3 pl-4 border-l-2 border-border mt-2">
                  <div><label className="block text-sm font-medium mb-1">OG Title</label><input value={seoData?.ogTitle || ''} onChange={e => updateField('ogTitle', e.target.value)} className={f} /></div>
                  <div><label className="block text-sm font-medium mb-1">OG Description</label><textarea value={seoData?.ogDescription || ''} onChange={e => updateField('ogDescription', e.target.value)} rows={2} className={f} /></div>
                  <div><label className="block text-sm font-medium mb-1">OG Image URL</label><input value={seoData?.ogImage || ''} onChange={e => updateField('ogImage', e.target.value)} className={f} /></div>
                  <div><label className="block text-sm font-medium mb-1">Canonical URL</label><input value={seoData?.canonicalUrl || ''} onChange={e => updateField('canonicalUrl', e.target.value)} className={f} /></div>
                </div>
              </details>

              <button onClick={saveSeo} disabled={saving} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 text-sm">
                {saving ? 'Saving...' : 'Save SEO'}
              </button>
            </div>
          )}

          {/* Quick overview */}
          <button onClick={loadAllSeo} className="text-sm text-accent hover:underline">Load All SEO Records</button>
          {allSeo.length > 0 && (
            <div className="space-y-1 text-xs">
              {allSeo.map((s, i) => (
                <div key={i} className="flex gap-4 text-text-secondary">{s.pagePath} [{s.language}] → {s.metaTitle?.slice(0,60)}</div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === 'sitemap' && (
        <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
          <h2 className="text-lg font-semibold">Sitemap Config</h2>
          <p className="text-sm text-text-secondary">Configure priority and change frequency for each page in the sitemap.</p>
          <div className="space-y-2">
            {pages.map(p => {
              const cfg = sitemapConfigs.find(c => c.pagePath === p.path);
              return (
                <div key={p.path} className="flex items-center gap-4 p-3 bg-bg-alt rounded-lg">
                  <span className="w-32 text-sm font-medium">{p.label}</span>
                  <span className="text-xs text-text-secondary w-20">{p.path}</span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Priority</label>
                    <input
                      type="number"
                      min="0" max="1" step="0.1"
                      value={cfg?.priority ?? 0.5}
                      onChange={async e => {
                        try {
                          await apiClient.put('/api/seo/sitemap-config', { pagePath: p.path, priority: parseFloat(e.target.value) || 0.5 }, token!);
                          loadSitemap();
                        } catch {}
                      }}
                      className="w-16 px-2 py-1 border rounded text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-xs">Freq</label>
                    <select
                      value={cfg?.changefreq || 'weekly'}
                      onChange={async e => {
                        try {
                          await apiClient.put('/api/seo/sitemap-config', { pagePath: p.path, changefreq: e.target.value }, token!);
                          loadSitemap();
                        } catch {}
                      }}
                      className="px-2 py-1 border rounded text-sm"
                    >
                      {['always','hourly','daily','weekly','monthly','yearly','never'].map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
