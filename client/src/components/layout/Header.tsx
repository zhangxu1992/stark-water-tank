import { getTranslations } from 'next-intl/server';
import LanguageSwitcher from './LanguageSwitcher';
import Link from 'next/link';

export default async function Header() {
  const t = await getTranslations('common');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/products', label: t('products') },
    { href: '/cases', label: t('cases') },
    { href: '/news', label: t('news') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="text-xl font-bold text-primary tracking-tight">
              STARK
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors"
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 5h14M3 10h14M3 15h14" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
