import { getTranslations } from 'next-intl/server';
import { getTranslation } from '@/lib/translate';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getFaqs() {
  try { const r = await fetch(`${API}/api/faqs`, { next: { revalidate: 300 } }); return await r.json(); } catch { return []; }
}

export default async function FaqPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const t = await getTranslations('about');
  const faqs = await getFaqs();

  return (
    <div>
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
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('faqTitle')}</h1>
          <p className="text-slate-300 mt-4">{t('faqSubtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          {faqs.length === 0 ? (
            <p className="text-center text-text-secondary">{t('faqEmpty')}</p>
          ) : (
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
          )}
        </div>
      </section>
    </div>
  );
}
