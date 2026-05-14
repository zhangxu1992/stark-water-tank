'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

export default function SettingsAdminPage() {
  const [settings, setSettings] = useState<Record<string,string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'general'|'social'|'seo'|'languages'>('general');
  const router = useRouter();
  const token = getToken();

  useEffect(() => { loadSettings(); }, []);

  async function loadSettings() {
    if (!token) return;
    try { setSettings(await apiClient.get<Record<string,string>>('/api/settings', token)); } catch {}
    finally { setLoading(false); }
  }

  async function handleSave() {
    setSaving(true);
    try { await apiClient.put('/api/settings', settings, token!); alert('Saved!'); } catch {}
    finally { setSaving(false); }
  }

  function update(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }));
  }

  const Field = ({ label, key: k, type = 'text', multiline = false }: { label: string; key: string; type?: string; multiline?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-text-primary mb-1.5">{label}</label>
      {multiline ? (
        <textarea value={settings[k] || ''} onChange={e => update(k, e.target.value)} rows={3} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 resize-y"/>
      ) : (
        <input type={type} value={settings[k] || ''} onChange={e => update(k, e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-accent/50"/>
      )}
    </div>
  );

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Settings</h1><div className="space-y-2">{Array.from({length:6}).map((_,i)=>(<div key={i} className="h-12 skeleton rounded-xl"/>))}</div></div>;

  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Site Settings</h1>

      <div className="flex gap-2 border-b border-border pb-2">
        {(['general','social','seo','languages'] as const).map(t => (
          <button key={t} onClick={()=>setTab(t)} className={`px-4 py-2 text-sm rounded-lg capitalize ${tab===t?'bg-primary text-white':'text-text-secondary hover:bg-bg-alt'}`}>{t}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        {tab === 'general' && (
          <>
            <Field label="Company Name" key="company_name" />
            <Field label="Company Slogan" key="company_slogan" />
            <Field label="Logo Text" key="logo_text" />
            <Field label="Address" key="address" multiline />
            <Field label="Phone" key="phone" />
            <Field label="Email" key="email" type="email" />
            <Field label="WhatsApp" key="whatsapp" />
          </>
        )}

        {tab === 'social' && (
          <>
            <Field label="Facebook URL" key="facebook_url" type="url" />
            <Field label="LinkedIn URL" key="linkedin_url" type="url" />
            <Field label="YouTube URL" key="youtube_url" type="url" />
            <Field label="Instagram URL" key="instagram_url" type="url" />
            <Field label="TikTok URL" key="tiktok_url" type="url" />
          </>
        )}

        {tab === 'seo' && (
          <>
            <Field label="Meta Title" key="meta_title" />
            <Field label="Meta Description" key="meta_description" multiline />
            <Field label="Google Analytics ID (e.g. G-XXXXXXXXXX)" key="ga_measurement_id" />
          </>
        )}

        {tab === 'languages' && (
          <LanguagesManager token={token!} />
        )}
      </div>

      <button onClick={handleSave} disabled={saving} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary-light disabled:opacity-50">
        {saving ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
}

function LanguagesManager({ token }: { token: string }) {
  const [langs, setLangs] = useState<any[]>([]);
  useEffect(() => {
    apiClient.get<any[]>('/api/languages', token).then(setLangs).catch(()=>{});
  }, []);

  async function toggle(code: string, active: boolean) {
    try {
      await apiClient.put(`/api/languages/${code}`, { isActive: !active }, token);
      setLangs(prev => prev.map(l => l.code === code ? {...l, isActive: !active} : l));
    } catch {}
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-3">Active Languages</h3>
      <div className="space-y-2">
        {langs.map(l => (
          <label key={l.code} className="flex items-center justify-between p-2 hover:bg-bg-alt rounded-lg cursor-pointer">
            <span className="text-sm">{l.name} ({l.code})</span>
            <input type="checkbox" checked={l.isActive} onChange={() => toggle(l.code, l.isActive)} className="w-4 h-4 rounded border-border text-accent"/>
          </label>
        ))}
      </div>
    </div>
  );
}
