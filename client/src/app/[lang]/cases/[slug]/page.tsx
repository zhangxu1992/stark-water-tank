import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCase(slug: string) {
  try { const r = await fetch(`${API}/api/cases/${slug}`, { next: { revalidate: 60 } }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

export default async function CaseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = await getCase(slug);
  if (!item) notFound();

  const common = await getTranslations('common');
  const t = await getTranslations('cases');
  const translations = JSON.parse(item.translations || '{}');
  const en = translations.en || {};
  const images = JSON.parse(item.images || '[]');

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-primary">{common('home')}</Link><span>/</span>
            <Link href="/cases" className="hover:text-primary">{common('cases')}</Link><span>/</span>
            <span className="text-text-primary">{en.name}</span>
          </div>

          <article className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">{en.name}</h1>

            {images.length > 0 && (
              <div className="space-y-4 mb-8">
                <div className="aspect-[16/9] rounded-2xl bg-bg-alt overflow-hidden">
                  <img src={`${API}${images[0]}`} alt="" className="w-full h-full object-cover"/>
                </div>
                {images.length > 1 && (
                  <div className="grid grid-cols-3 gap-3">
                    {images.slice(1).map((img: string, i: number) => (
                      <div key={i} className="aspect-[16/9] rounded-xl bg-bg-alt overflow-hidden">
                        <img src={`${API}${img}`} alt="" className="w-full h-full object-cover"/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: en.content?.replace(/\n/g, '<br/>') || en.description || '' }} />
          </article>
        </div>
      </section>
    </div>
  );
}
