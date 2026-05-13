import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'zh', 'es', 'fr', 'de', 'ar', 'pt', 'ru', 'ja', 'ko'],
  defaultLocale: 'en',
  localePrefix: 'always',
});
