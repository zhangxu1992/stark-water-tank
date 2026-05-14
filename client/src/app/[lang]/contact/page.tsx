'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import apiClient from '@/lib/api-client';

const API = process.env.NEXT_PUBLIC_API_URL || '';

export default function ContactPage() {
  const t = useTranslations('contact');
  const [form, setForm] = useState({ name: '', email: '', phone: '', country: '', company: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

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

  return (
    <div>
      <section className="bg-primary py-16 md:py-20">
        <div className="max-w-[1400px] mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">{t('title')}</h1>
          <p className="text-slate-300 mt-4">{t('subtitle')}</p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <ContactInfo />
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8">
              <h2 className="text-xl font-semibold mb-6">{t('formMessage')}</h2>
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
                  {status === 'sending' ? 'Sending...' : t('formMessage')}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function ContactInfo() {
  const t = useTranslations('contact');
  const [info, setInfo] = useState<{ address?: string; email?: string; phone?: string; whatsapp?: string }>({});
  useState(() => {
    fetch(`${API}/api/settings`).then(r => r.json()).then(setInfo).catch(() => {});
  });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-8">{t('title')}</h2>
      <div className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0 mt-0.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" strokeLinecap="round"/><circle cx="12" cy="10" r="3"/></svg>
          </div>
          <div>
            <div className="font-medium text-text-primary">{t('address')}</div>
            <div className="text-sm text-text-secondary mt-1">{info.address || 'Dongguan, Guangdong, China'}</div>
          </div>
        </div>
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
          </div>
          <div>
            <div className="font-medium text-text-primary">{t('email')}</div>
            <div className="text-sm text-text-secondary mt-1">{info.email || 'info@starkwatertank.com'}</div>
          </div>
        </div>
        {(info.phone || info.whatsapp) && (
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
            </div>
            <div>
              <div className="font-medium text-text-primary">{t('phone')}</div>
              <div className="text-sm text-text-secondary mt-1">{info.phone || info.whatsapp}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
