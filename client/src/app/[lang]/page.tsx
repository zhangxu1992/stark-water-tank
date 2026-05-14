import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { getTranslation } from '@/lib/translate';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getSettings() {
  try {
    const res = await fetch(`${API}/api/settings`, { next: { revalidate: 300 } });
    return await res.json();
  } catch { return {}; }
}

async function getProducts() {
  try {
    const res = await fetch(`${API}/api/products?limit=4`, { next: { revalidate: 300 } });
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

async function getCases() {
  try {
    const res = await fetch(`${API}/api/cases?limit=3`, { next: { revalidate: 300 } });
    const data = await res.json();
    return data.items || [];
  } catch { return []; }
}

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('home');
  const [settings, products, cases] = await Promise.all([getSettings(), getProducts(), getCases()]);

  return (
    <>
      {/* Hero */}
      <section className="relative min-h-[80dvh] flex items-center bg-gradient-to-br from-primary to-primary-light overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%)]" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
              {settings.meta_title || t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-[65ch]">
              {settings.company_slogan || t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:brightness-110 transition-all">
                {t('heroCta')}
              </Link>
              <Link href="/contact" className="inline-flex items-center px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all">
                {t('heroCta2')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '2000-2024', label: t('statsYears') },
              { value: '100+', label: t('statsCountries') },
              { value: '10-15%', label: 'Price Advantage' },
              { value: '24/7', label: 'Service Support' },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl md:text-4xl font-bold text-primary tracking-tight">{stat.value}</div>
                <div className="mt-2 text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-bg-alt">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-tight mb-12">{t('whyChooseUs')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t('advantage1Title'), desc: t('advantage1Desc') },
              { title: t('advantage2Title'), desc: t('advantage2Desc') },
              { title: t('advantage3Title'), desc: t('advantage3Desc') },
              { title: t('advantage4Title'), desc: t('advantage4Desc') },
            ].map((item) => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow">
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {products.length > 0 && (
        <section className="py-16 md:py-24 bg-white">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('featuredProducts')}</h2>
              <Link href="/products" className="text-sm text-accent hover:underline font-medium">{t('viewAll')}</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((p: any) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="aspect-[4/3] bg-bg-alt overflow-hidden">
                    {p.coverImage ? (
                      <img src={`${API}${p.coverImage}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">No Image</div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">{getTranslation(p.translations, lang, 'name')}</h3>
                    <p className="text-xs text-text-secondary mt-1 line-clamp-2">{getTranslation(p.translations, lang, 'description')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Cases */}
      {cases.length > 0 && (
        <section className="py-16 md:py-24 bg-bg-alt">
          <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold tracking-tight">{t('featuredCases')}</h2>
              <Link href="/cases" className="text-sm text-accent hover:underline font-medium">{t('viewAll')}</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {cases.map((c: any) => (
                <Link key={c.id} href={`/cases/${c.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="aspect-[16/9] bg-bg-alt overflow-hidden">
                    {c.coverImage ? (
                      <img src={`${API}${c.coverImage}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary text-sm">No Image</div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">{getTranslation(c.translations, lang, 'name')}</h3>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{getTranslation(c.translations, lang, 'description')}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">{t('ctaTitle')}</h2>
          <p className="text-slate-300 text-lg mb-8 max-w-[65ch] mx-auto">{t('ctaDesc')}</p>
          <Link href="/contact" className="inline-flex items-center px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:brightness-110 transition-all text-lg">
            {t('ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
