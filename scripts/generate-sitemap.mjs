import fs from 'node:fs';
import path from 'node:path';

const HOST = 'https://free-video-compressor.web-free.site';
const paths = [
  '/',
  '/compress-video-for-whatsapp',
  '/compress-video-to-25mb',
  '/how-to-compress-a-video-in-the-browser',
  '/about',
  '/privacy',
  '/terms',
  '/contact',
];

const lastmod = new Date().toISOString().slice(0, 10);
const urls = paths
  .map(
    p => `  <url>\n    <loc>${HOST}${p === '/' ? '/' : p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`,
  )
  .join('\n');

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

fs.writeFileSync(path.join('dist', 'sitemap.xml'), xml);
console.log('Wrote sitemap.xml with', paths.length, 'URLs');