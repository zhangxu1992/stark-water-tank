'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api-client';

const API = process.env.NEXT_PUBLIC_API_URL || '';

interface Settings {
  address?: string; email?: string; phone?: string; mobile?: string;
  whatsapp?: string; company_brief?: string;
  facebook_url?: string; linkedin_url?: string; youtube_url?: string;
  instagram_url?: string; tiktok_url?: string;
}

export default function ContactPage() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [info, setInfo] = useState<Settings>({});

  useEffect(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(setInfo).catch(() => {});
  }, []);

  function update(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })); }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      await apiClient.post('/api/inquiries', { ...form, sourcePage: 'contact' });
      setStatus('success');
      setForm({ name: '', email: '', phone: '', country: '', company: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch {
      setStatus('error');
    }
  }

  const fCls = "w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50";

  const socialLinks = [
    { href: info.facebook_url, label: 'Facebook', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/></svg> },
    { href: info.linkedin_url, label: 'LinkedIn', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 110-4 2 2 0 010 4z"/></svg> },
    { href: info.youtube_url, label: 'YouTube', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 00-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 00-1.94 2A29.94 29.94 0 001 11.75a29.94 29.94 0 00.46 5.33A2.78 2.78 0 003.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 001.94-2 29.94 29.94 0 00.46-5.25 29.94 29.94 0 00-.46-5.33z"/><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#fff"/></svg> },
    { href: info.instagram_url, label: 'Instagram', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><circle cx="12" cy="12" r="5"/><circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" stroke="none"/></svg> },
    { href: info.tiktok_url, label: 'TikTok', icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg> },
  ].filter(s => s.href);

  return (
    <div>
      {/* Hero + Company Brief (merged) */}
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${API}/uploads/contact-hero.webp)` }}
      >
        <div className="absolute inset-0 bg-primary/85" />
        {info.company_brief && (
          <div className="relative max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 py-24 md:py-32">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tighter mb-6 text-white">{t('getInTouch')}</h2>
              <p className="text-slate-200/80 leading-relaxed max-w-[65ch] mx-auto text-lg">{info.company_brief}</p>
            </div>
          </div>
        )}
        {/* fade to next section */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-b from-transparent to-white pointer-events-none" />
      </section>

      {/* Contact Info + Form */}
      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Contact Info */}
            <div>
              <h2 className="text-2xl font-semibold mb-8">{t('contactInfo')}</h2>
              <div className="space-y-5">
                <InfoRow icon={<MapPin />} label={t('address')} value={info.address} />
                <InfoRow icon={<Phone />} label={t('phone')} value={info.phone} />
                <InfoRow icon={<Smartphone />} label={t('mobile')} value={info.mobile} />
                <InfoRow icon={<Mail />} label={t('email')} value={info.email} />
              </div>

              {/* Social */}
              {socialLinks.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-lg font-semibold mb-4">{t('followUs')}</h3>
                  <div className="flex gap-3">
                    {socialLinks.map(s => (
                      <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
                        className="w-10 h-10 rounded-xl bg-bg-alt flex items-center justify-center text-text-secondary hover:text-primary hover:bg-accent/10 transition-colors"
                        title={s.label}
                      >
                        {s.icon}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Form */}
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">{t('formTitle')}</h2>
              {status === 'success' && <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">{t('formSuccess')}</div>}
              {status === 'error' && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{t('formError')}</div>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">{t('formName')} *</label><input required value={form.name} onChange={e => update('name', e.target.value)} className={fCls}/></div>
                  <div><label className="block text-sm font-medium mb-1.5">{t('formEmail')} *</label><input required type="email" value={form.email} onChange={e => update('email', e.target.value)} className={fCls}/></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium mb-1.5">{t('formPhone')}</label><input value={form.phone} onChange={e => update('phone', e.target.value)} className={fCls}/></div>
                  <div><label className="block text-sm font-medium mb-1.5">{t('formCountry')}</label><input value={form.country} onChange={e => update('country', e.target.value)} className={fCls}/></div>
                </div>
                <div><label className="block text-sm font-medium mb-1.5">{t('formCompany')}</label><input value={form.company} onChange={e => update('company', e.target.value)} className={fCls}/></div>
                <div><label className="block text-sm font-medium mb-1.5">{t('formMessage')} *</label><textarea required value={form.message} onChange={e => update('message', e.target.value)} rows={5} className={fCls + ' resize-y'}/></div>
                <button type="submit" disabled={status === 'sending'} className="w-full py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50 transition-colors">
                  {status === 'sending' ? '…' : t('sendMessage')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Map */}
      <section className="pb-16 md:pb-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <h2 className="text-2xl font-semibold text-center mb-8">{t('ourLocation')}</h2>
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3695.4!2d113.7682!3d23.05161!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3403753197a288f3%3A0x223c02342c08c428!2z6b6Z5pi55b6u5Yib5ZyT!5e0!3m2!1szh!2scn!4v1715773600000"
              width="100%" height="400" style={{ border: 0 }} allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="STARK Location"
            />
          </div>
        </div>
      </section>


    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">{icon}</div>
      <div>
        <div className="font-medium text-text-primary">{label}</div>
        <div className="text-sm text-text-secondary mt-1">{value}</div>
      </div>
    </div>
  );
}

function MapPin() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round"/><circle cx="12" cy="10" r="3"/></svg>; }
function Phone() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>; }
function Smartphone() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>; }
function Mail() { return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>; }
