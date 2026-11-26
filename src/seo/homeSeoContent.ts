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
] as const;