import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getArticle(slug: string) {
  try { const r = await fetch(`${API}/api/news/${slug}`, { next: { revalidate: 60 } }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const t = await getTranslations('news');
  const common = await getTranslations('common');
  const translations = JSON.parse(article.translations || '{}');
  const en = translations.en || {};

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-6">
            <Link href="/" className="hover:text-primary">{common('home')}</Link><span>/</span>
            <Link href="/news" className="hover:text-primary">{common('news')}</Link><span>/</span>
            <span className="text-text-primary">{en.title}</span>
          </div>

          <article>
            <div className="text-sm text-accent font-medium mb-2">{article.category?.name}</div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{en.title}</h1>
            <div className="text-sm text-text-secondary mb-8">{t('publishedOn')}: {new Date(article.publishedAt || article.createdAt).toLocaleDateString()}</div>

            {article.coverImage && (
              <div className="aspect-[16/9] rounded-2xl bg-bg-alt overflow-hidden mb-8">
                <img src={`${API}${article.coverImage}`} alt="" className="w-full h-full object-cover"/>
              </div>
            )}

            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: en.content?.replace(/\n/g, '<br/>') || en.summary || '' }} />
          </article>
        </div>
      </section>
    </div>
  );
}
