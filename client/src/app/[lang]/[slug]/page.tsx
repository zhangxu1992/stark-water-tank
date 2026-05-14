import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getTranslation } from '@/lib/translate';
import { getTranslations } from 'next-intl/server';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getPage(slug: string) {
  try { const r = await fetch(`${API}/api/pages/${slug}`, { next: { revalidate: 300 } }); if (!r.ok) return null; return await r.json(); } catch { return null; }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug } = await params;
  const page = await getPage(slug);
  if (!page) return { title: 'Page Not Found' };
  const title = getTranslation(page.translations, 'en', 'title') || slug;
  return { title: `${title} | STARK` };
}

export default async function PagePage({ params }: { params: Promise<{ slug: string; lang: string }> }) {
  const { slug, lang } = await params;
  const page = await getPage(slug);
  if (!page) notFound();

  const common = await getTranslations('common');
  const title = getTranslation(page.translations, lang, 'title') || slug;
  const content = getTranslation(page.translations, lang, 'content');

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4">
          <div className="flex items-center gap-2 text-sm text-slate-300 mb-2">
            <Link href="/" className="hover:text-white">{common('home')}</Link>
            <span>/</span>
            <span className="text-white">{title}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mt-2">{title}</h1>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-4 md:px-6 lg:px-8">
          <div className="prose prose-slate max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
      </section>
    </div>
  );
}
