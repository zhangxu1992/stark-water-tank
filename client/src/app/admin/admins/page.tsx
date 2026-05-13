'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const token = getToken();

  useEffect(() => { loadAdmins(); }, []);

  async function loadAdmins() {
    if (!token) return;
    try { setAdmins(await apiClient.get<any[]>('/api/auth/admins', token)); } catch {}
    finally { setLoading(false); }
  }

  async function handleCreate() {
    if (!newUsername || !newPassword) return alert('Fill all fields');
    try {
      await apiClient.post('/api/auth/admins', { username: newUsername, password: newPassword, role: newRole }, token!);
      setNewUsername(''); setNewPassword(''); setNewRole('admin');
      loadAdmins();
    } catch (e: any) { alert(e.message); }
  }

  async function handleDelete(id: string, username: string) {
    if (!confirm(`Delete admin "${username}"?`)) return;
    try { await apiClient.delete(`/api/auth/admins/${id}`, token!); loadAdmins(); } catch {}
  }

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Admins</h1><div className="space-y-2">{Array.from({length:3}).map((_,i)=>(<div key={i} className="h-12 skeleton rounded-xl"/>))}</div></div>;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Administrators</h1>

      <div className="bg-white rounded-2xl border border-border shadow-sm p-6 space-y-4">
        <h2 className="text-lg font-semibold">Add Admin</h2>
        <div className="flex flex-wrap gap-3">
          <input placeholder="Username" value={newUsername} onChange={e=>setNewUsername(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm w-40"/>
          <input placeholder="Password" type="password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm w-40"/>
          <select value={newRole} onChange={e=>setNewRole(e.target.value)} className="px-3 py-2 border border-border rounded-lg text-sm">
            <option value="admin">Admin</option>
            <option value="super_admin">Super Admin</option>
          </select>
          <button onClick={handleCreate} className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-light">Create</button>
        </div>
      </div>

      <div className="space-y-2">
        {admins.map(a => (
          <div key={a.id} className="bg-white rounded-xl border border-border p-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">{a.username}</span>
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${a.role==='super_admin' ? 'bg-purple-50 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>{a.role}</span>
            </div>
            <button onClick={()=>handleDelete(a.id, a.username)} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
