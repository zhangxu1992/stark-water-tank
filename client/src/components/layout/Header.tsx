'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL || '';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('common');
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const aboutRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (aboutRef.current && !aboutRef.current.contains(e.target as Node)) {
        setAboutOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Close dropdown on route change
  useEffect(() => { setAboutOpen(false); }, [pathname]);

  const aboutSubs = [
    { href: '/about/faq', label: t('aboutFaq') },
    { href: '/about/why-us', label: t('aboutWhyUs') },
    { href: '/about/company', label: t('aboutCompany') },
    { href: '/about/factory', label: t('aboutFactory') },
  ];

  const isAboutActive = pathname.startsWith('/about');

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={`${API}/uploads/logo-blue.webp`} alt="STARK" className="h-9 w-auto" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/" className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
              {t('home')}
            </Link>
            <Link href="/products" className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
              {t('products')}
            </Link>
            <Link href="/cases" className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
              {t('cases')}
            </Link>
            <Link href="/news" className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
              {t('news')}
            </Link>

            {/* About Us dropdown */}
            <div ref={aboutRef} className="relative">
              <button
                onClick={() => setAboutOpen(!aboutOpen)}
                className={`flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${isAboutActive ? 'text-primary bg-accent/10' : 'text-text-secondary hover:text-primary hover:bg-bg-alt'}`}
              >
                {t('about')}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={`transition-transform ${aboutOpen ? 'rotate-180' : ''}`}>
                  <path d="M6 9l6 6 6-6" strokeLinecap="round"/>
                </svg>
              </button>
              {aboutOpen && (
                <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-border shadow-lg py-1 z-50">
                  {aboutSubs.map(sub => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className="block px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-bg-alt transition-colors"
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link href="/contact" className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
              {t('contact')}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors" aria-label="Toggle menu">
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 5h14M3 10h14M3 15h14" /></svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <nav className="lg:hidden pb-4 border-t border-border">
            <div className="flex flex-col gap-1 pt-3">
              <Link href="/" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                {t('home')}
              </Link>
              <Link href="/products" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                {t('products')}
              </Link>
              <Link href="/cases" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                {t('cases')}
              </Link>
              <Link href="/news" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                {t('news')}
              </Link>
              <div className="px-4 py-3 text-sm font-medium text-primary">{t('about')}</div>
              <div className="ml-4 flex flex-col gap-1">
                {aboutSubs.map(sub => (
                  <Link key={sub.href} href={sub.href} onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                    {sub.label}
                  </Link>
                ))}
              </div>
              <Link href="/contact" onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                {t('contact')}
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
