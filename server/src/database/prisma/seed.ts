import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // --- Create Super Admin ---
  const passwordHash = await bcrypt.hash('Stark@2026!Adm', 12);
  await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      passwordHash,
      role: 'super_admin',
    },
  });
  console.log('✅ Super admin created (username: admin, password: Stark@2026!Adm)');

  // --- Create Languages ---
  const languages = [
    { code: 'en', name: 'English', sortOrder: 0 },
    { code: 'zh', name: '中文', sortOrder: 1 },
    { code: 'es', name: 'Español', sortOrder: 2 },
    { code: 'fr', name: 'Français', sortOrder: 3 },
    { code: 'de', name: 'Deutsch', sortOrder: 4 },
    { code: 'ar', name: 'العربية', sortOrder: 5 },
    { code: 'pt', name: 'Português', sortOrder: 6 },
    { code: 'ru', name: 'Русский', sortOrder: 7 },
    { code: 'ja', name: '日本語', sortOrder: 8 },
    { code: 'ko', name: '한국어', sortOrder: 9 },
  ];

  for (const lang of languages) {
    await prisma.language.upsert({
      where: { code: lang.code },
      update: {},
      create: lang,
    });
  }
  console.log('✅ 10 languages created');

  // --- Create Site Settings ---
  const settings = [
    { key: 'company_name', value: 'STARK Environmental Solutions Ltd.', group: 'general' },
    { key: 'company_slogan', value: 'Professional Stainless Steel Water Treatment Solutions', group: 'general' },
    { key: 'address', value: 'Dongguan, Guangdong, China', group: 'contact' },
    { key: 'phone', value: '', group: 'contact' },
    { key: 'email', value: '', group: 'contact' },
    { key: 'whatsapp', value: '', group: 'contact' },
    { key: 'facebook_url', value: '', group: 'social' },
    { key: 'linkedin_url', value: '', group: 'social' },
    { key: 'tiktok_url', value: '', group: 'social' },
    { key: 'instagram_url', value: '', group: 'social' },
    { key: 'youtube_url', value: '', group: 'social' },
    { key: 'meta_title', value: 'STARK Environmental Solutions | Stainless Steel Water Treatment Products', group: 'seo' },
    { key: 'meta_description', value: 'Professional manufacturer of stainless steel water tanks, RO systems, filtration equipment since 2000. Serving 100+ countries worldwide.', group: 'seo' },
    { key: 'logo_text', value: 'STARK', group: 'general' },
  ];

  for (const setting of settings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    });
  }
  console.log('✅ Site settings created');

  // --- Create Sitemap Configs ---
  const sitemapPages = [
    { pagePath: '/', priority: 1.0, changefreq: 'weekly' },
    { pagePath: '/products', priority: 0.9, changefreq: 'weekly' },
    { pagePath: '/cases', priority: 0.8, changefreq: 'weekly' },
    { pagePath: '/news', priority: 0.8, changefreq: 'daily' },
    { pagePath: '/about', priority: 0.7, changefreq: 'monthly' },
    { pagePath: '/contact', priority: 0.7, changefreq: 'monthly' },
  ];

  for (const page of sitemapPages) {
    await prisma.sitemapConfig.upsert({
      where: { pagePath: page.pagePath },
      update: {},
      create: page,
    });
  }
  console.log('✅ Sitemap configs created');

  console.log('🌱 Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
