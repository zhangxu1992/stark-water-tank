'use client';

import { useEffect } from 'react';

export default function GoogleAnalytics({ measurementId }: { measurementId?: string | null }) {
  useEffect(() => {
    if (!measurementId || measurementId === 'G-XXXXXXXXXX') return;

    // Load gtag script
    const script = document.createElement('script');
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.async = true;
    document.head.appendChild(script);

    // Initialize gtag
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', measurementId, {
      page_location: window.location.href,
      page_path: window.location.pathname,
    });
  }, [measurementId]);

  return null;
}

// Extend Window type
declare global {
  interface Window {
    dataLayer: any[];
  }
}
