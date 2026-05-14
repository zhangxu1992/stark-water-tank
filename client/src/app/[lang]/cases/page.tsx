import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getTranslation } from '@/lib/translate';
import { LazyImage, PlaceholderImage } from '@/components/ui/PlaceholderImage';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getCases() {
  try { const r = await fetch(`${API}/api/cases?limit=12`, { next: { revalidate: 300 } }); const d = await r.json(); return d.items || []; } catch { return []; }
}

export default async function CasesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('cases');
  const cases = await getCases();

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 mt-4 max-w-[65ch] mx-auto">{t('subtitle')}</p>
        </div>
      </section>
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          {cases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {cases.map((c: any) => (
                <Link key={c.id} href={`/cases/${c.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
                    {c.coverImage ? <LazyImage src={`${API}${c.coverImage}`} alt={getTranslation(c.translations, lang, 'name')} className="group-hover:scale-105 transition-transform duration-300"/> : <PlaceholderImage type="case" className="w-full h-full" />}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold group-hover:text-accent transition-colors">{getTranslation(c.translations, lang, 'name')}</h3>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{getTranslation(c.translations, lang, 'description')}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : <p className="text-center text-text-secondary py-12">No cases yet.</p>}
        </div>
      </section>
    </div>
  );
}
