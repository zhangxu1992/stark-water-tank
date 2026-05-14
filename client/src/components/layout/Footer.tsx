'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function Footer() {
  const t = useTranslations('footer');
  const c = useTranslations('common');
  const [settings, setSettings] = useState<Record<string,string>>({});

  useEffect(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(setSettings).catch(()=>{});
  }, []);

  const socialLinks = [
    { name: 'Facebook', href: settings.facebook_url || '#', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3V2z' },
    { name: 'LinkedIn', href: settings.linkedin_url || '#', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z M2 9h4v12H2z M4 6a2 2 0 100-4 2 2 0 000 4z' },
    { name: 'YouTube', href: settings.youtube_url || '#', icon: 'M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29.94 29.94 0 001 11.75a29.94 29.94 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29.94 29.94 0 00.46-5.25 29.94 29.94 0 00-.46-5.33z M9.75 15.02l5.75-3.27-5.75-3.27v6.54z' },
    { name: 'Instagram', href: settings.instagram_url || '#', icon: 'M7.8 2h8.4A5.8 5.8 0 0122 7.8v8.4a5.8 5.8 0 01-5.8 5.8H7.8A5.8 5.8 0 012 16.2V7.8A5.8 5.8 0 017.8 2zm-.2 2A3.6 3.6 0 004 7.6v8.8A3.6 3.6 0 007.6 20h8.8a3.6 3.6 0 003.6-3.6V7.6A3.6 3.6 0 0016.4 4H7.6zm9.65 1.5a1.25 1.25 0 110 2.5 1.25 1.25 0 010-2.5zM12 7a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6z' },
    { name: 'TikTok', href: settings.tiktok_url || '#', icon: 'M12.53.02C13.84 0 15.14.01 16.44 0c.05 2.29.77 4.86 3.03 6.08-.04 1.77-1.33 3.34-2.62 4.49-.73 2.28-2.34 4.46-4.74 5.23-2.6.84-5.7.29-7.71-1.5-2.36-2.07-3.36-5.52-2.53-8.56C3.06 2.35 6.34.45 9.48.47c.03 1.65-.04 3.29-.05 4.94-1.13-.36-2.51-.33-3.52.3-1.16.72-1.84 2.06-1.78 3.41.09 1.52 1.27 2.87 2.77 3.19 1.71.37 3.61-.46 4.27-2.12.29-.75.37-1.56.38-2.37.01-2.54.01-5.09.01-7.63h-.03z' },
  ];

  const quickLinks = [
    { href: '/about', label: c('about') },
    { href: '/cases', label: c('cases') },
    { href: '/news', label: c('news') },
    { href: '/contact', label: c('contact') },
  ];

  return (
    <footer className="bg-bg-dark text-text-light">
      <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div>
            <img src={`${API}/uploads/logo-white.png`} alt="STARK" className="h-8 w-auto mb-4" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-[65ch]">{t('about')}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{c('products')}</h4>
            <ul className="space-y-3">
              <li><Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">Stainless Steel Water Tank</Link></li>
              <li><Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">RO System</Link></li>
              <li><Link href="/products" className="text-sm text-slate-400 hover:text-white transition-colors">Filtration Equipment</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t('quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((item) => (
                <li key={item.href}><Link href={item.href} className="text-sm text-slate-400 hover:text-white transition-colors">{item.label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t('followUs')}</h4>
            <div className="flex gap-3 mb-6">
              {socialLinks.map((social) => (
                <a key={social.name} href={social.href} target="_blank" rel="noopener noreferrer" className="w-9 h-9 flex items-center justify-center rounded-lg bg-white/10 hover:bg-accent transition-colors" aria-label={social.name}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d={social.icon} /></svg>
                </a>
              ))}
            </div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">{t('contactInfo')}</h4>
            <p className="text-sm text-slate-400">{settings.address || 'Dongguan, Guangdong, China'}</p>
            <p className="text-sm text-slate-400 mt-1">{settings.email || ''}</p>
            <p className="text-sm text-slate-400">{settings.phone || ''}</p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} STARK Environmental Solutions Ltd. {t('copyright')}</p>
          <div className="flex gap-6">
            <Link href="/about#faq" className="text-sm text-slate-500 hover:text-white transition-colors">FAQ</Link>
            <Link href="/contact" className="text-sm text-slate-500 hover:text-white transition-colors">{c('contact')}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
