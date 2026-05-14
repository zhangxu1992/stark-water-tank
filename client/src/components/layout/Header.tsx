'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL || '';
import LanguageSwitcher from './LanguageSwitcher';

export default function Header() {
  const t = useTranslations('common');
  const [menuOpen, setMenuOpen] = useState(false);

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
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <img src={`${API}/uploads/logo-blue.webp`} alt="STARK" className="h-9 w-auto" />
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="px-3 py-2 text-sm font-medium text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt transition-colors">
                {item.label}
              </Link>
            ))}
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

        {menuOpen && (
          <nav className="lg:hidden pb-4 border-t border-border">
            <div className="flex flex-col gap-1 pt-3">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)} className="px-4 py-3 text-sm font-medium text-text-secondary hover:text-primary hover:bg-bg-alt rounded-lg transition-colors">
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
