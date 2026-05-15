import { getTranslations } from 'next-intl/server';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getSettings() {
  try { const r = await fetch(`${API}/api/settings`, { next: { revalidate: 300 } }); return await r.json(); } catch { return {}; }
}

export default async function CompanyInfoPage({ params }: { params: Promise<{ lang: string }> }) {
  const t = await getTranslations('about');
  const settings = await getSettings();

  const infoItems = [
    { label: t('companyName'), value: settings.company_name || 'STARK Environmental Solutions Ltd' },
    { label: t('founded'), value: settings.founded_year || '2004' },
    { label: t('businessScope'), value: settings.business_scope || '' },
    { label: t('address'), value: settings.address || '' },
    { label: t('phone'), value: settings.phone || '' },
    { label: t('email'), value: settings.email || '' },
  ].filter(x => x.value);

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('companyInfoTitle')}</h1>
          <p className="text-slate-300 mt-4">{t('companyInfoSubtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 md:px-6 lg:px-8">
          {settings.company_brief && (
            <div className="mb-12 bg-bg-alt rounded-2xl p-8 md:p-10">
              <h2 className="text-xl font-semibold mb-4">{t('companyProfile')}</h2>
              <p className="text-text-secondary leading-relaxed">{settings.company_brief}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl border border-border shadow-sm divide-y divide-border">
            {infoItems.map(item => (
              <div key={item.label} className="flex items-start gap-6 px-8 py-5">
                <span className="text-sm font-medium text-text-secondary shrink-0 w-32">{item.label}</span>
                <span className="text-sm text-text-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
