'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api-client';
import { getToken } from '@/lib/auth';

interface DashboardData {
  products: number;
  cases: number;
  news: number;
  faqs: number;
  inquiries: { total: number; unread: number };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ products: number; cases: number; news: number; faqs: number; inquiries: { total: number; unread: number } } | null>(null);

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    apiClient.get<DashboardData>('/api/dashboard', token)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const cards = [
    { label: 'Products', value: data?.products ?? 0, href: '/admin/products', color: 'bg-blue-50 text-blue-700' },
    { label: 'Cases', value: data?.cases ?? 0, href: '/admin/cases', color: 'bg-green-50 text-green-700' },
    { label: 'News', value: data?.news ?? 0, href: '/admin/news', color: 'bg-purple-50 text-purple-700' },
    { label: 'FAQs', value: data?.faqs ?? 0, href: '/admin/faqs', color: 'bg-orange-50 text-orange-700' },
    { label: 'Total Inquiries', value: data?.inquiries?.total ?? 0, href: '/admin/inquiries', color: 'bg-cyan-50 text-cyan-700' },
    { label: 'Unread Inquiries', value: data?.inquiries?.unread ?? 0, href: '/admin/inquiries', color: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-text-primary">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="bg-white p-6 rounded-2xl border border-border shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 rounded-xl ${card.color} mb-4`}>
              <span className="text-lg font-bold">{card.value}</span>
            </div>
            <h3 className="text-sm font-medium text-text-secondary">{card.label}</h3>
          </Link>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-border shadow-sm">
        <h2 className="text-lg font-semibold text-text-primary mb-2">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/admin/products/new" className="px-4 py-2 bg-primary text-white text-sm rounded-lg text-center hover:bg-primary-light transition-colors">
            + New Product
          </Link>
          <Link href="/admin/cases/new" className="px-4 py-2 bg-primary text-white text-sm rounded-lg text-center hover:bg-primary-light transition-colors">
            + New Case
          </Link>
          <Link href="/admin/news/new" className="px-4 py-2 bg-primary text-white text-sm rounded-lg text-center hover:bg-primary-light transition-colors">
            + New Article
          </Link>
          <Link href="/admin/faqs" className="px-4 py-2 bg-primary text-white text-sm rounded-lg text-center hover:bg-primary-light transition-colors">
            + New FAQ
          </Link>
        </div>
      </div>
    </div>
  );
}
