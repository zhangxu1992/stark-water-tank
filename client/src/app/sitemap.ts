import { MetadataRoute } from 'next';
import { routing } from '@/i18n/routing';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';
const BASE = 'https://stktank.cosens.cn';

async function getProducts() {
  try { const r = await fetch(`${API}/api/products?limit=100`); const d = await r.json(); return d.items || []; } catch { return []; }
}
async function getCases() {
  try { const r = await fetch(`${API}/api/cases?limit=100`); const d = await r.json(); return d.items || []; } catch { return []; }
}
async function getNews() {
  try { const r = await fetch(`${API}/api/news?limit=100`); const d = await r.json(); return d.items || []; } catch { return []; }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, cases, news] = await Promise.all([getProducts(), getCases(), getNews()]);
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of routing.locales) {
    const prefix = lang === 'en' ? '' : `/${lang}`;

    entries.push({ url: `${BASE}${prefix}`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 });
    entries.push({ url: `${BASE}${prefix}/products`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 });
    entries.push({ url: `${BASE}${prefix}/cases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 });
    entries.push({ url: `${BASE}${prefix}/news`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 });
    entries.push({ url: `${BASE}${prefix}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 });
    entries.push({ url: `${BASE}${prefix}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 });

    for (const p of products) {
      entries.push({ url: `${BASE}${prefix}/products/${p.slug}`, lastModified: new Date(p.updatedAt), changeFrequency: 'monthly', priority: 0.7 });
    }
    for (const c of cases) {
      entries.push({ url: `${BASE}${prefix}/cases/${c.slug}`, lastModified: new Date(c.updatedAt), changeFrequency: 'monthly', priority: 0.6 });
    }
    for (const n of news) {
      entries.push({ url: `${BASE}${prefix}/news/${n.slug}`, lastModified: new Date(n.updatedAt), changeFrequency: 'monthly', priority: 0.6 });
    }
  }

  return entries;
}
