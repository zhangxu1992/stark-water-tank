import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/translate';
import { LazyImage, PlaceholderImage } from '@/components/ui/PlaceholderImage';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

type Props = { params: Promise<{ slug: string; lang: string }> };

async function getArticle(slug: string) {
  try { const r = await fetch(`${API}/api/news/${slug}`, { next: { revalidate: 60 } }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Article Not Found' };
  const t = JSON.parse(article.translations || '{}');
  const en = t.en || {};
  const title = article.metaTitle || en.title;
  const desc = article.metaDescription || en.summary?.slice(0, 160) || en.title;
  return {
    title,
    description: desc,
    keywords: article.metaKeywords || '',
    openGraph: { title, description: desc, type: 'article', publishedTime: article.publishedAt },
  };
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const t = await getTranslations('news');
  const common = await getTranslations('common');
  const translations = JSON.parse(article.translations || '{}');
  const en = translations.en || {};
  const title = getTranslation(article.translations, lang, 'title');
  const summary = getTranslation(article.translations, lang, 'summary');
  const content = getTranslation(article.translations, lang, 'content');

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">{common('home')}</Link><span>/</span>
            <Link href="/news" className="hover:text-primary">{common('news')}</Link><span>/</span>
            <span className="text-text-primary">{title}</span>
          </div>

          <article>
            <div className="text-sm text-accent font-medium mb-2">{getTranslation(article.category?.translations || '{}', lang, 'name') || article.category?.name}</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{title}</h1>
            <div className="text-sm text-text-secondary mb-8">{t('publishedOn')}: {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</div>

            {article.coverImage && (
              <div className="aspect-[16/9] rounded-2xl bg-bg-alt overflow-hidden mb-8">
                <LazyImage src={`${API}${article.coverImage}`} alt={title} />
              </div>
            )}

            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: (content || summary).replace(/\n/g, '<br/>') }} />
          </article>

          <RelatedNews slug={slug} lang={lang} />
        </div>
      </section>
    </div>
  );
}

async function RelatedNews({ slug, lang }: { slug: string; lang: string }) {
  try {
    const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';
    const r = await fetch(`${API}/api/news?limit=4`);
    const d = await r.json();
    const items = (d.items || []).filter((n: any) => n.slug !== slug).slice(0, 3);
    if (items.length === 0) return null;
    return (
      <>
        <hr className="my-12 border-border" />
        <h2 className="text-2xl font-semibold mb-6">Related News</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((n: any) => (
            <Link key={n.id} href={`/news/${n.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
                {n.coverImage ? <img src={`${API}${n.coverImage}`} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <PlaceholderImage type="news" className="w-full h-full" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{getTranslation(n.translations, lang, 'title')}</h3>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  } catch { return null; }
}
