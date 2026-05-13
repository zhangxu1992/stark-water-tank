import { getTranslations } from 'next-intl/server';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const API = process.env.SERVER_API_URL || 'http://127.0.0.1:3001';

async function getProduct(slug: string) {
  try {
    const r = await fetch(`${API}/api/products/${slug}`, { next: { revalidate: 60 } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; }
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const t = await getTranslations('products');
  const common = await getTranslations('common');

  const translations = JSON.parse(product.translations || '{}');
  const en = translations.en || {};
  const parameters = JSON.parse(product.parameters || '[]');
  const industries = JSON.parse(product.industries || '[]');
  const images = JSON.parse(product.images || '[]');

  return (
    <div>
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-secondary mb-8">
            <Link href="/" className="hover:text-primary">{common('home')}</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary">{common('products')}</Link>
            <span>/</span>
            <span className="text-text-primary">{en.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Images */}
            <div>
              <div className="aspect-[4/3] rounded-2xl bg-bg-alt overflow-hidden mb-4">
                {images[0] ? (
                  <img src={`${API}${images[0]}`} alt={en.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-secondary">No Image</div>
                )}
              </div>
              {images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {images.slice(1, 5).map((img: string, i: number) => (
                    <div key={i} className="aspect-square rounded-xl bg-bg-alt overflow-hidden">
                      <img src={`${API}${img}`} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div>
              <div className="text-sm text-accent font-medium mb-2">{product.category?.name}</div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-text-primary">{en.name}</h1>
              <p className="text-text-secondary mt-4 leading-relaxed">{en.description}</p>

              {/* Parameters */}
              {parameters.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-4">{t('parameters')}</h2>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {parameters.map((p: any, i: number) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-bg-alt' : ''}>
                            <td className="px-4 py-2.5 font-medium text-text-primary">{p.key_en}</td>
                            <td className="px-4 py-2.5 text-text-secondary">{p.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Industries */}
              {industries.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-semibold mb-3">{t('applicableIndustries')}</h2>
                  <div className="flex flex-wrap gap-2">
                    {industries.map((ind: string, i: number) => (
                      <span key={i} className="px-3 py-1.5 bg-bg-alt rounded-full text-sm text-text-secondary">{ind}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href={`/contact?product=${encodeURIComponent(en.name)}`}
                  className="inline-flex items-center px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light transition-colors"
                >
                  {t('inquiryForProduct')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
