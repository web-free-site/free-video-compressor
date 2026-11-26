/**
 * Shared homepage SEO copy for dist/index.html injection and the React HomeSeoSection.
 */

export const HOME_H1 =
  'Free Video Compressor — Reduce Video Size Online, No Upload';

export const HOME_FAQ = [
  {
    q: 'Is this video compressor really free?',
    a: 'Yes. The tool is free to use with no subscription and no credit card. You can compress as many local files as your device and browser can handle in a single session.',
  },
  {
    q: 'Do I need to create an account or sign up?',
    a: 'No account is required. Open the page, choose a video from your device, pick a preset or target size, and download the smaller MP4. There is no login step.',
  },
  {
    q: 'Is my video uploaded to your servers?',
    a: 'No. Compression runs entirely in your web browser with WebCodecs. Your file is read from disk on your phone or computer, encoded locally, and never sent to our servers for processing.',
  },
  {
    q: 'Which video formats and file sizes are supported?',
    a: 'You can open common containers such as MP4, MOV, WebM, MKV, M4V, AVI, MPEG, OGV, and 3GP when your browser can decode them. Set any target between 1 MB and 500 MB, or use presets for WhatsApp (16 MB), Discord (10 MB), email (25 MB), and Messenger. Output is H.264 MP4 with optional AAC audio.',
  },
  {
    q: 'Can I use this on my phone?',
    a: 'Yes, if your mobile browser supports WebCodecs (many recent Chromium-based Android browsers do). iOS Safari support varies; for large files, a desktop Chrome or Edge browser is often faster. The layout is responsive for small screens.',
  },
];

/** HTML for injection into dist/index.html (includes the single page h1 for crawlers). */
export function buildHomeSeoStaticHtml() {
  const faqItems = HOME_FAQ.map(
    (item) =>
      `<article class="home-seo-faq-item"><h3>${item.q}</h3><p>${item.a}</p></article>`,
  ).join('\n');

  return `<section id="seo-home-static" class="home-seo container" aria-label="About this compressor">
<h1>${HOME_H1}</h1>
<p class="home-seo-intro">Shrink video files to a specific megabyte limit without sending them to a remote server. This free online video compressor runs in your browser: pick a file from your phone or computer, choose a platform preset or custom target size, and download a smaller H.264 MP4. It is built for everyday sharing limits on WhatsApp, Discord, email, and Messenger, while keeping processing private on your device.</p>

<h2>How to compress a video</h2>
<ol class="home-seo-steps">
<li>Open this page in Chrome, Edge, or another browser that supports WebCodecs.</li>
<li>Click or drag your video into the upload box. Common formats include MP4, MOV, WebM, and MKV.</li>
<li>Select a platform preset (WhatsApp 16 MB, Discord 10 MB, email 25 MB, WhatsApp Status, Messenger) or enter a custom target size in megabytes.</li>
<li>Optionally lower resolution or frame rate and choose whether to keep AAC audio in the output.</li>
<li>Click <strong>Compress video</strong>, wait for the progress bar, preview the result if you like, then download the compressed MP4.</li>
</ol>

<h2>When to use a video size reducer</h2>
<p>Large clips from a camera or screen recording often exceed attachment limits. WhatsApp video messages are commonly capped around 16 MB; Discord free uploads are often limited to about 10 MB without Nitro; many email providers reject attachments above roughly 25 MB. Compressing toward those targets before you send helps the file go through on the first try. You can also set a custom cap between 1 and 500 MB when a portal or form names a maximum upload size.</p>
<p>This tool does not host your media and does not download from YouTube or other URLs—you only work with files already on your device. That keeps control with you and avoids cloud queues. Output uses the browser’s H.264 encoder via WebCodecs and muxes MP4 with optional AAC audio, which is widely playable on phones and desktops.</p>

<h2>Formats and quality</h2>
<p>Input is accepted when the file is a video your browser can decode (typically MP4, MOV, WebM, MKV, and related extensions). The exporter writes H.264 video in an MP4 container. H.265 (HEVC) encoding is not offered here because it would require GPL-linked libraries in the page. Bitrate is chosen from your target file size and clip duration so the result aims near the megabyte limit you set. Very long or very high-resolution sources may need a lower resolution preset to hit a small target without heavy artifacts. You can keep or strip audio; stripping saves space for silent clips.</p>

<h2>Frequently asked questions</h2>
<div class="home-seo-faq">
${faqItems}
</div>
</section>`;
}

export function buildFaqJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQ.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };
}