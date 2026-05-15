import { getTranslations } from 'next-intl/server';

export default async function WhyUsPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = await getTranslations('about');

  const reasons = [
    { key: 'whyUs1', icon: '🏭' },
    { key: 'whyUs2', icon: '✅' },
    { key: 'whyUs3', icon: '🌍' },
    { key: 'whyUs4', icon: '🔧' },
    { key: 'whyUs5', icon: '📦' },
    { key: 'whyUs6', icon: '🤝' },
  ];

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('whyUsTitle')}</h1>
          <p className="text-slate-300 mt-4">{t('whyUsSubtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {reasons.map((item, i) => (
              <div key={item.key} className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center hover:shadow-md transition-shadow">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-semibold text-text-primary mb-2">{t(`${item.key}Title`)}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{t(`${item.key}Desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
