import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/translate';
import { LazyImage, PlaceholderImage } from '@/components/ui/PlaceholderImage';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

type Props = { params: Promise<{ slug: string; lang: string }> };

async function getCase(slug: string) {
  try { const r = await fetch(`${API}/api/cases/${slug}`, { next: { revalidate: 60 } }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) return { title: 'Case Not Found' };
  const t = JSON.parse(item.translations || '{}');
  const en = t.en || {};
  const title = item.metaTitle || en.name;
  const desc = item.metaDescription || en.description?.slice(0, 160);
  return {
    title,
    description: desc,
    keywords: item.metaKeywords || '',
    openGraph: { title, description: desc },
  };
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  const common = await getTranslations('common');
  const t = await getTranslations('cases');
  const translations = JSON.parse(item.translations || '{}');
  const en = translations.en || {};
  const name = getTranslation(item.translations, lang, 'name');
  const description = getTranslation(item.translations, lang, 'description');
  const content = getTranslation(item.translations, lang, 'content');
  const images = JSON.parse(item.images || '[]');

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-primary">{common('home')}</Link><span>/</span>
            <Link href="/cases" className="hover:text-primary">{common('cases')}</Link><span>/</span>
            <span className="text-text-primary">{name}</span>
          </div>

          <article className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{name}</h1>

            {images.length > 0 && (
              <div className="space-y-4 mb-8">
                <div className="aspect-[16/9] rounded-2xl bg-bg-alt overflow-hidden">
                  <LazyImage src={`${API}${images[0]}`} alt={name} />
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.slice(1).map((img: string, i: number) => (
                      <div key={i} className="aspect-[16/9] rounded-xl bg-bg-alt overflow-hidden">
                        <LazyImage src={`${API}${img}`} alt="" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            {images.length === 0 && <PlaceholderImage type="case" className="aspect-[16/9] rounded-2xl mb-8" />}

            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: (content || description).replace(/\n/g, '<br/>') }} />
          </article>

          <RelatedCases slug={slug} lang={lang} />
        </div>
      </section>
    </div>
  );
}

async function RelatedCases({ slug, lang }: { slug: string; lang: string }) {
  try {
    const r = await fetch(`${process.env.SERVER_API_URL || 'http://127.0.0.1:3001'}/api/cases?limit=4`);
    const d = await r.json();
    const items = (d.items || []).filter((c: any) => c.slug !== slug).slice(0, 3);
    if (items.length === 0) return null;
    const common = { home: 'Home', cases: 'Cases' };
    const t = { relatedCases: 'Related Cases' };
    const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';
    return (
      <>
        <hr className="my-12 border-border" />
        <h2 className="text-2xl font-semibold mb-6">Related Cases</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {items.map((c: any) => (
            <Link key={c.id} href={`/cases/${c.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
              <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
                {c.coverImage ? <img src={`${API}${c.coverImage}`} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <PlaceholderImage type="case" className="w-full h-full" />}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-sm group-hover:text-accent transition-colors">{getTranslation(c.translations, lang, 'name')}</h3>
              </div>
            </Link>
          ))}
        </div>
      </>
    );
  } catch { return null; }
}
