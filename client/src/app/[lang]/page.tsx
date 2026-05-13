import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[80dvh] flex items-center bg-gradient-to-br from-primary to-primary-light overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.15),transparent_50%)]" />
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tighter leading-[1.1] mb-6">
              {t('heroTitle')}
            </h1>
            <p className="text-lg md:text-xl text-slate-300 leading-relaxed mb-8 max-w-[65ch]">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/products"
                className="inline-flex items-center px-6 py-3 bg-accent text-white font-medium rounded-lg hover:brightness-110 transition-all"
              >
                {t('heroCta')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center px-6 py-3 border border-white/30 text-white font-medium rounded-lg hover:bg-white/10 transition-all"
              >
                {t('heroCta2')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
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
                <div className="text-3xl md:text-4xl font-bold text-primary tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-2 text-sm text-text-secondary">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-bg-alt">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-semibold text-center tracking-tight mb-12">
            {t('whyChooseUs')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: t('advantage1Title'), desc: t('advantage1Desc'), icon: 'M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5' },
              { title: t('advantage2Title'), desc: t('advantage2Desc'), icon: 'M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3' },
              { title: t('advantage3Title'), desc: t('advantage3Desc'), icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
              { title: t('advantage4Title'), desc: t('advantage4Desc'), icon: 'M1 21V9a2 2 0 012-2h3.5l2-3h7l2 3H21a2 2 0 012 2v12a2 2 0 01-2 2H3a2 2 0 01-2-2z' },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-white p-8 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-accent/10 text-accent mb-4">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d={item.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-primary">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            {t('ctaTitle')}
          </h2>
          <p className="text-slate-300 text-lg mb-8 max-w-[65ch] mx-auto">
            {t('ctaDesc')}
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-4 bg-accent text-white font-semibold rounded-lg hover:brightness-110 transition-all text-lg"
          >
            {t('ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
