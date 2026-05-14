import { NextIntlClientProvider, hasLocale } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import GoogleAnalytics from '@/components/analytics/GoogleAnalytics';
import '@/app/globals.css';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getSettings() {
  try { const r = await fetch(`${API}/api/settings`, { next: { revalidate: 300 } }); return await r.json(); } catch { return {}; }
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const settings = await getSettings();
  const title = settings.meta_title || 'STARK Environmental Solutions | Stainless Steel Water Treatment';
  const desc = settings.meta_description || 'Professional manufacturer of stainless steel water tanks, RO systems, and filtration equipment since 2000.';

  return {
    title: { default: title, template: '%s | STARK' },
    description: desc,
    metadataBase: new URL('https://stktank.cosens.cn'),
    alternates: {
      languages: Object.fromEntries(
        routing.locales.map(l => [l, `/${l}`])
      ),
    },
    openGraph: {
      title,
      description: desc,
      url: `https://stktank.cosens.cn`,
      siteName: 'STARK Environmental Solutions',
      locale: lang,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: desc,
    },
    robots: { index: true, follow: true },
    icons: { icon: '/favicon.ico' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(routing.locales, lang)) notFound();

  const messages = await getMessages();

  return (
    <html lang={lang}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* Organization Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'STARK Environmental Solutions Ltd.',
              url: 'https://stktank.cosens.cn',
              description: 'Professional manufacturer of stainless steel water tanks, RO systems, and filtration equipment.',
              address: { '@type': 'PostalAddress', addressLocality: 'Dongguan', addressRegion: 'Guangdong', addressCountry: 'CN' },
              contactPoint: { '@type': 'ContactPoint', contactType: 'sales', email: 'info@starkwatertank.com' },
            }),
          }}
        />
      </head>
      <body className="min-h-[100dvh] flex flex-col bg-white text-text-primary">
        <NextIntlClientProvider messages={messages}>
          <GoogleAnalytics measurementId={settings.ga_measurement_id} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
