# Free Video Compressor

Client-side video compression for [free-video-compressor.web-free.site](https://free-video-compressor.web-free.site).

Based on [Compress-8MB](https://github.com/odddollar/Compress-8MB) (MIT, Simon Eason). Encoding uses **WebCodecs** H.264/AAC and [mp4-muxer](https://github.com/Vanilagy/mp4-muxer) — no GPL FFmpeg WASM core.

## Commands

- `npm install`
- `npm run dev` — local development
- `npm run build` — output in `dist/`
- `npm run preview` — serve `dist/`
- `npm test` — unit tests

Deploy is handled separately (wrangler config included; do not commit secrets).

## Encoder note

GPL `@ffmpeg/core` / `core-mt` and COEP/COOP are intentionally **not** used so Adsterra ads and Worker static hosting stay compatible. H.265 is not offered because browser-safe encoders require GPL libx265 in WASM builds.