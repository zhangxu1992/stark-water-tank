import { getTranslations } from 'next-intl/server';
import { getTranslation } from '@/lib/translate';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getFaqs() {
  try { const r = await fetch(`${API}/api/faqs`, { next: { revalidate: 300 } }); return await r.json(); } catch { return []; }
}

async function getSettings() {
  try { const r = await fetch(`${API}/api/settings`, { next: { revalidate: 300 } }); return await r.json(); } catch { return {}; }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('about');
  const home = await getTranslations('home');
  const [faqs, settings] = await Promise.all([getFaqs(), getSettings()]);

  return (
    <div>
      {/* FAQPage Schema */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'FAQPage',
              mainEntity: faqs.map((faq: any) => {
                const q = getTranslation(faq.translations, lang, 'question');
                const a = getTranslation(faq.translations, lang, 'answer');
                return { '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } };
              }),
            }),
          }}
        />
      )}

      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 mt-4">{t('subtitle')}</p>
        </div>
      </section>

      {/* About Content */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-6">{t('ourStory')}</h2>
            <p className="text-text-secondary leading-relaxed">
              {settings.company_slogan || home('aboutDesc')}
            </p>
          </div>
        </div>
      </section>

      {/* Factory Strength */}
      <section className="py-16 md:py-24 bg-bg-alt">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-12">{t('factoryStrength')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              { title: 'Professional Team', desc: 'Experienced engineers and technicians dedicated to water treatment solutions.' },
              { title: 'Modern Facility', desc: 'State-of-the-art manufacturing facility in Dongguan, Guangdong.' },
              { title: 'Quality Control', desc: 'Strict quality management system ensuring every product meets international standards.' },
            ].map(item => (
              <div key={item.title} className="bg-white p-8 rounded-2xl border border-border shadow-sm text-center">
                <h3 className="font-semibold text-text-primary mb-2">{item.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      {faqs.length > 0 && (
        <section id="faq" className="py-16 md:py-24">
          <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
            <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-center mb-12">{t('faq')}</h2>
            <div className="space-y-3">
              {faqs.map((faq: any) => {
                const question = getTranslation(faq.translations, lang, 'question');
                const answer = getTranslation(faq.translations, lang, 'answer');
                return (
                  <details key={faq.id} className="group bg-white rounded-xl border border-border shadow-sm">
                    <summary className="px-6 py-4 cursor-pointer font-medium text-text-primary hover:text-accent transition-colors list-none flex items-center justify-between">
                      {question}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-open:rotate-180 transition-transform shrink-0 ml-4">
                        <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
                      </svg>
                    </summary>
                    <div className="px-6 pb-4 text-sm text-text-secondary leading-relaxed">{answer}</div>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
