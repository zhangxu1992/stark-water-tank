import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCases() {
  try { const r = await fetch(`${API}/api/cases?limit=12`, { next: { revalidate: 300 } }); const d = await r.json(); return d.items || []; } catch { return []; }
}
function getName(item: any, field = 'name'): string {
  try { const t = JSON.parse(item.translations || '{}'); return t.en?.[field] || ''; } catch { return ''; }
}

export default async function CasesPage() {
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
                    {c.coverImage ? <img src={`${API}${c.coverImage}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/> : <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold group-hover:text-accent transition-colors">{getName(c)}</h3>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{getName(c, 'description')}</p>
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
