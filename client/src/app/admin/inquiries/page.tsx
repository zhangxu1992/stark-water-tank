'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface Inquiry { id: string; name: string; email: string; phone: string; country: string; company: string; message: string; isRead: boolean; createdAt: string; }

export default function InquiriesAdminPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => { loadData(); }, [page, filter]);

  async function loadData() {
    const token = getToken(); if (!token) return;
    setLoading(true);
    try {
      const query = `/api/inquiries?page=${page}&limit=20${filter ? `&is_read=${filter}` : ''}`;
      const result = await apiClient.get<any>(query, token);
      setInquiries(result.items); setTotalPages(result.totalPages);
    } catch {} finally { setLoading(false); }
  }

  async function handleMarkRead(id: string) {
    const token = getToken();
    try { await apiClient.put(`/api/inquiries/${id}/read`, {}, token!); loadData(); } catch {}
  }

  if (loading) return <div className="space-y-4"><h1 className="text-2xl font-semibold">Inquiries</h1><div className="space-y-2">{Array.from({length:5}).map((_,i)=>(<div key={i} className="h-24 skeleton rounded-xl"/>))}</div></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-text-primary">Inquiries</h1>
        <select value={filter} onChange={e => { setFilter(e.target.value); setPage(1); }} className="px-3 py-2 border border-border rounded-lg text-sm">
          <option value="">All</option>
          <option value="false">Unread</option>
          <option value="true">Read</option>
        </select>
      </div>

      <div className="space-y-4">
        {inquiries.map(inq => (
          <div key={inq.id} className={`bg-white rounded-2xl border shadow-sm p-6 ${inq.isRead ? 'border-border' : 'border-accent/30 bg-blue-50/30'}`}>
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-text-primary">{inq.name}</span>
                  <span className="text-sm text-text-secondary">{inq.email}</span>
                  {inq.company && <span className="text-sm text-text-secondary bg-bg-alt px-2 py-0.5 rounded">{inq.company}</span>}
                  {inq.country && <span className="text-sm text-text-secondary">{inq.country}</span>}
                  {inq.phone && <span className="text-sm text-text-secondary">{inq.phone}</span>}
                </div>
                <div className="text-xs text-text-secondary mt-1">{new Date(inq.createdAt).toLocaleString()}</div>
              </div>
              {!inq.isRead && (
                <button onClick={()=>handleMarkRead(inq.id)} className="px-3 py-1 text-xs font-medium text-accent border border-accent rounded-lg hover:bg-accent/5">Mark Read</button>
              )}
            </div>
            <div className="text-sm text-text-secondary bg-bg-alt rounded-lg p-3 whitespace-pre-wrap">{inq.message}</div>
          </div>
        ))}
        {inquiries.length === 0 && <p className="text-center text-text-secondary py-12">No inquiries yet.</p>}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Previous</button>
          <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
          <button onClick={()=>setPage(p=>Math.min(totalPages,p+1))} disabled={page===totalPages} className="px-3 py-1.5 text-sm border rounded-lg disabled:opacity-50">Next</button>
        </div>
      )}
    </div>
  );
}
