import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🗺️  Generating multilingual sitemap...');

  const sitemapConfigs = await prisma.sitemapConfig.findMany({ where: { isIncluded: true } });
  const languages = await prisma.language.findMany({ where: { isActive: true } });
  const baseUrl = process.env.SITE_URL || 'https://www.starkwatertank.com';

  // Generate sitemap index
  let sitemapIndex = '<?xml version="1.0" encoding="UTF-8"?>\n';
  sitemapIndex += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const lang of languages) {
    sitemapIndex += `  <sitemap>\n`;
    sitemapIndex += `    <loc>${baseUrl}/sitemap-${lang.code}.xml</loc>\n`;
    sitemapIndex += `  </sitemap>\n`;
  }

  sitemapIndex += '</sitemapindex>\n';

  // Generate per-language sitemaps
  for (const lang of languages) {
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    sitemap += '        xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    for (const config of sitemapConfigs) {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/${lang.code}${config.pagePath === '/' ? '' : config.pagePath}</loc>\n`;

      // hreflang alternates
      for (const alt of languages) {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${alt.code}" href="${baseUrl}/${alt.code}${config.pagePath === '/' ? '' : config.pagePath}"/>\n`;
      }

      sitemap += `    <changefreq>${config.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${config.priority}</priority>\n`;
      sitemap += '  </url>\n';
    }

    sitemap += '</urlset>\n';

    const outputPath = path.resolve(__dirname, '../../client/public', `sitemap-${lang.code}.xml`);
    fs.writeFileSync(outputPath, sitemap);
    console.log(`  ✅ sitemap-${lang.code}.xml`);
  }

  // Write sitemap index
  const indexPath = path.resolve(__dirname, '../../client/public', 'sitemap.xml');
  fs.writeFileSync(indexPath, sitemapIndex);
  console.log(`  ✅ sitemap.xml (index)`);

  // Also write robots.txt
  const robotsTxt = `User-agent: *\nAllow: /\nSitemap: ${baseUrl}/sitemap.xml\n`;
  const robotsPath = path.resolve(__dirname, '../../client/public', 'robots.txt');
  fs.writeFileSync(robotsPath, robotsTxt);
  console.log(`  ✅ robots.txt`);

  console.log('🗺️  Sitemap generation complete!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => prisma.$disconnect());
