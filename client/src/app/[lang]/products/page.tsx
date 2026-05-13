import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function getCategories() {
  try { const r = await fetch(`${API}/api/categories?type=product`, { next: { revalidate: 300 } }); return await r.json(); } catch { return []; }
}

async function getProducts(categoryId?: string) {
  try {
    const url = `${API}/api/products?limit=12${categoryId ? `&categoryId=${categoryId}` : ''}`;
    const r = await fetch(url, { next: { revalidate: 60 } });
    const d = await r.json();
    return d.items || [];
  } catch { return []; }
}

function getName(item: any, field = 'name'): string {
  try { const t = JSON.parse(item.translations || '{}'); return t.en?.[field] || ''; } catch { return ''; }
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const t = await getTranslations('products');
  const common = await getTranslations('common');
  const [categories, products] = await Promise.all([getCategories(), getProducts(category)]);

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 mt-4 max-w-[65ch] mx-auto">{t('subtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-3 mb-12">
            <Link
              href="/products"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${!category ? 'bg-primary text-white' : 'bg-bg-alt text-text-secondary hover:bg-border'}`}
            >
              {t('allCategories')}
            </Link>
            {categories.map((c: any) => (
              <Link
                key={c.id}
                href={`/products?category=${c.id}`}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${category === c.id ? 'bg-primary text-white' : 'bg-bg-alt text-text-secondary hover:bg-border'}`}
              >
                {c.name}
              </Link>
            ))}
          </div>

          {/* Product Grid */}
          {products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p: any) => (
                <Link key={p.id} href={`/products/${p.slug}`} className="group bg-white rounded-2xl border border-border shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <div className="aspect-[4/3] bg-bg-alt overflow-hidden">
                    {p.coverImage ? (
                      <img src={`${API}${p.coverImage}`} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-text-secondary">{common('noResults')}</div>
                    )}
                  </div>
                  <div className="p-5">
                    <div className="text-xs text-accent mb-1">{p.category?.name}</div>
                    <h3 className="font-semibold text-text-primary group-hover:text-accent transition-colors">{getName(p)}</h3>
                    <p className="text-sm text-text-secondary mt-2 line-clamp-2">{getName(p, 'description')}</p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-text-secondary py-12">{common('noResults')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
