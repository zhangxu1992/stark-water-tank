import { getTranslations } from 'next-intl/server';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getCases() {
  try { const r = await fetch(`${API}/api/cases?category=factory`, { next: { revalidate: 300 } }); return await r.json(); } catch { return []; }
}

// Fallback factory images if no cases with category=factory exist
const fallbackImages = Array.from({ length: 6 }, (_, i) => ({
  id: `factory-${i + 1}`,
  imageUrl: '',
  translations: JSON.stringify({ en: { title: `Factory View ${i + 1}`, description: '' } }),
}));

export default async function FactoryViewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('about');
  const cases = await getCases();
  const items = cases.length > 0 ? cases : [];

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('factoryViewTitle')}</h1>
          <p className="text-slate-300 mt-4">{t('factoryViewSubtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          {items.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-text-secondary text-lg">{t('factoryViewEmpty')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item: any) => {
                const title = (() => { try { return JSON.parse(item.translations)[lang]?.title || ''; } catch { return ''; } })();
                const desc = (() => { try { return JSON.parse(item.translations)[lang]?.description || ''; } catch { return ''; } })();
                return (
                  <div key={item.id} className="group bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
                    {item.imageUrl ? (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img src={item.imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] bg-bg-alt flex items-center justify-center">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-text-muted"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                    {title && (
                      <div className="p-4">
                        <h3 className="font-medium text-text-primary">{title}</h3>
                        {desc && <p className="text-sm text-text-secondary mt-1">{desc}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
