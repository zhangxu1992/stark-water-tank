import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getTranslation } from '@/lib/translate';
import { LazyImage, PlaceholderImage } from '@/components/ui/PlaceholderImage';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getCategories() {
  try { const r = await fetch(`${API}/api/categories?type=news`, { next: { revalidate: 300 } }); return await r.json(); } catch { return []; }
}
async function getNews(categoryId?: string) {
  try {
    const url = `${API}/api/news?limit=12${categoryId ? `&categoryId=${categoryId}` : ''}`;
    const r = await fetch(url, { next: { revalidate: 60 } }); const d = await r.json(); return d.items || [];
  } catch { return []; }
}

export default async function NewsPage({ params, searchParams }: { params: Promise<{ lang: string }>; searchParams: Promise<{ category?: string }> }) {
  const { lang } = await params;
  const { category } = await searchParams;
  const t = await getTranslations('news');
  const common = await getTranslations('common');
  const [categories, news] = await Promise.all([getCategories(), getNews(category)]);

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 mt-4">{t('subtitle')}</p>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex flex-wrap gap-3 mb-12">
            <Link href="/news" className={`px-4 py-2 rounded-lg text-sm font-medium ${!category ? 'bg-primary text-white' : 'bg-bg-alt text-text-secondary hover:bg-border'}`}>{common('all')}</Link>
            {categories.map((c: any) => (
              <Link key={c.id} href={`/news?category=${c.id}`} className={`px-4 py-2 rounded-lg text-sm font-medium ${category === c.id ? 'bg-primary text-white' : 'bg-bg-alt text-text-secondary hover:bg-border'}`}>{getTranslation(c.translations, lang, 'name') || c.name}</Link>
            ))}
          </div>
          {news.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {news.map((n: any) => (
                <Link key={n.id} href={`/news/${n.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
                    {n.coverImage ? <LazyImage src={`${API}${n.coverImage}`} alt={getTranslation(n.translations, lang, 'title')} className="group-hover:scale-105 transition-transform duration-300"/> : <PlaceholderImage type="news" className="w-full h-full" />}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-accent mb-1">{getTranslation(n.category?.translations || '{}', lang, 'name') || n.category?.name}</div>
                    <h3 className="font-semibold group-hover:text-accent transition-colors">{getTranslation(n.translations, lang, 'title')}</h3>
                    <div className="text-xs text-text-secondary mt-2">{new Date(n.publishedAt || n.createdAt).toLocaleDateString()}</div>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-center text-text-secondary py-12">{common('noResults')}</p>}
        </div>
      </section>
    </div>
  );
}
