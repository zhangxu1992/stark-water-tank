'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getToken, getAdminInfo, removeToken, isAuthenticated } from '@/lib/auth';
import apiClient from '@/lib/api-client';

const menuItems = [
  { href: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/admin/categories', label: 'Categories', icon: 'M7 7h-1a2 2 0 00-2 2v9a2 2 0 002 2h9a2 2 0 002-2v-1m1-4h-1a2 2 0 00-2 2v1m-8-6h9m-9 4h9m-9 4h9' },
  { href: '/admin/products', label: 'Products', icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
  { href: '/admin/cases', label: 'Cases', icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z' },
  { href: '/admin/news', label: 'News', icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z' },
  { href: '/admin/faqs', label: 'FAQs', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  { href: '/admin/pages', label: 'Pages', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { href: '/admin/seo', label: 'SEO', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { href: '/admin/inquiries', label: 'Inquiries', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { href: '/admin/settings', label: 'Settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const superAdminItems = [
  { href: '/admin/admins', label: 'Admins', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [admin, setAdmin] = useState<{ username: string; role: string } | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Ensure hydration is complete before rendering role-dependent UI
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!isAuthenticated() && pathname !== '/admin/login') {
      router.push('/admin/login');
      return;
    }
    const info = getAdminInfo();
    if (info) setAdmin(info);
    // Fetch unread count using apiClient (with auto-refresh)
    const token = getToken();
    if (token && pathname === '/admin') {
      apiClient.get<{ unread: number }>('/api/dashboard/unread-inquiries-count', token)
        .then(d => setUnreadCount(d.unread || 0))
        .catch(() => {});
    }
  }, [pathname, router]);

  function handleLogout() {
    removeToken();
    router.push('/admin/login');
  }

  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const allMenuItems = admin?.role === 'super_admin'
    ? [...menuItems, ...superAdminItems]
    : menuItems;

  return (
    <div className="min-h-[100dvh] flex">
      {/* Sidebar - only render interactive content after hydration */}
      {!hydrated ? (
        <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-bg-dark text-text-light">
          <div className="flex items-center h-16 px-6 border-b border-white/10">
            <span className="text-xl font-bold tracking-tight">STARK</span>
          </div>
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => (
              <div key={item.href} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-400">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                </svg>
                {item.label}
              </div>
            ))}
          </nav>
        </aside>
      ) : (
        <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-bg-dark text-text-light transform transition-transform duration-200 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
          <div className="flex items-center justify-between h-16 px-6 border-b border-white/10">
            <Link href="/admin" className="text-xl font-bold tracking-tight">STARK</Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 8rem)' }}>
            {allMenuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? 'bg-accent text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {item.label}
                  {item.href === '/admin/inquiries' && unreadCount > 0 && (
                    <span className="ml-auto inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold">{unreadCount}</span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">{admin?.username}</span>
              <button
                onClick={handleLogout}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-border h-16 flex items-center justify-between px-4 md:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 text-text-secondary hover:text-primary rounded-lg hover:bg-bg-alt"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>

          <div className="text-sm text-text-secondary">
            Welcome back, <span className="font-medium text-text-primary">{admin?.username}</span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 md:p-8">
          {children}
        </main>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
