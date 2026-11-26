import fs from 'node:fs';
import path from 'node:path';
import { buildFaqJsonLd, buildHomeSeoStaticHtml } from './home-seo-content.mjs';

const HOST = 'https://free-video-compressor.web-free.site';
const dist = path.resolve('dist');
const baseHtml = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');

const pages = [
  {
    path: '/how-to-compress-a-video-in-the-browser',
    title: 'How to compress a video in the browser',
    description:
      'Compress MP4, MOV, or WebM locally: pick a file, set a target size, and download a smaller MP4.',
    h1: 'How to compress a video in the browser',
    snippet:
      '<p>Shrink video files on your own device using presets for WhatsApp, Discord, and email attachments.</p>',
  },
  {
    path: '/compress-video-for-whatsapp',
    title: 'Compress video for WhatsApp — 16 MB preset',
    description:
      'Reduce MP4 or MOV size for WhatsApp messages. Free browser tool, no upload.',
    h1: 'Compress video for WhatsApp',
    snippet: '<p>Use the WhatsApp preset to aim for a 16 MB MP4 before you send.</p>',
  },
  {
    path: '/compress-video-to-25mb',
    title: 'Compress video to 25 MB for email',
    description: 'Shrink large videos to about 25 MB for email attachments in your browser.',
    h1: 'Compress video to 25 MB',
    snippet: '<p>Email attachment preset with a 25 MB target size.</p>',
  },
  {
    path: '/about',
    title: 'About — Free Video Compressor',
    description: 'Upstream credits, WebCodecs encoder, and privacy.',
    h1: 'About this compressor',
    snippet: '<p>Based on Compress-8MB (MIT) with WebCodecs H.264 and mp4-muxer.</p>',
  },
  {
    path: '/privacy',
    title: 'Privacy policy',
    description: 'Privacy policy for the Free Video Compressor.',
    h1: 'Privacy policy',
    snippet: '<p>Your files stay on your device; we do not receive your videos.</p>',
  },
  {
    path: '/terms',
    title: 'Terms of use',
    description: 'Terms for using the Free Video Compressor.',
    h1: 'Terms of use',
    snippet: '<p>Use the tool lawfully on files you have rights to compress.</p>',
  },
  {
    path: '/contact',
    title: 'Contact',
    description: 'Contact the Free Video Compressor maintainers.',
    h1: 'Contact',
    snippet: '<p>GitHub issues or the web-free.site hub.</p>',
  },
];

function buildPage(page) {
  const url = HOST + page.path;
  let html = baseHtml;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${page.description}" />`,
  );
  if (html.includes('rel="canonical"')) {
    html = html.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${url}" />`,
    );
  } else {
    html = html.replace('</head>', `    <link rel="canonical" href="${url}" />\n  </head>`);
  }
  html = html.replace(/<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/, `<meta property="og:url" content="${url}" />`);
  html = html.replace(/<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/, `<meta property="og:title" content="${page.title}" />`);
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${page.description}" />`,
  );
  const seoBlock = `<section id="seo-prerender" class="seo-prerender"><h1>${page.h1}</h1>${page.snippet}</section>`;
  html = html.replace('<div id="root"></div>', `${seoBlock}<div id="root"></div>`);
  return html;
}

for (const page of pages) {
  const dir = path.join(dist, page.path.replace(/^\//, ''));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), buildPage(page));
}

const homeIndex = path.join(dist, 'index.html');
let homeHtml = fs.readFileSync(homeIndex, 'utf8');
const homeSeo = buildHomeSeoStaticHtml();
if (!homeHtml.includes('id="seo-home-static"')) {
  homeHtml = homeHtml.replace(
    '<div id="root"></div>',
    `<div id="root"></div>\n${homeSeo}`,
  );
}
const faqLd = JSON.stringify(buildFaqJsonLd(), null, 2).replace(/</g, '\\u003c');
homeHtml = homeHtml.replace(
  /<script type="application\/ld\+json">\s*\{\s*"@context": "https:\/\/schema\.org",\s*"@type": "FAQPage"[\s\S]*?<\/script>/,
  `<script type="application/ld+json">\n${faqLd}\n    </script>`,
);
fs.writeFileSync(homeIndex, homeHtml);

console.log('Prerendered', pages.length, 'SEO HTML shells into dist/');
console.log('Injected homepage SEO block into dist/index.html');