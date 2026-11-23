import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import CompressorPage from './pages/CompressorPage';
import ContentPage from './pages/ContentPage';
import { HUB_URL, SITE_NAME } from './site';

function AboutPage() {
  return (
    <ContentPage
      title={`About — ${SITE_NAME}`}
      description="Credits for Compress-8MB, WebCodecs, mp4-muxer, and privacy."
      path="/about"
    >
      <h1>About {SITE_NAME}</h1>
      <p>
        This tool compresses local video files toward a target size using presets for WhatsApp,
        Discord, email, and more. Processing happens entirely in your browser.
      </p>
      <h2>Upstream project</h2>
      <p>
        The UI and target-size logic are based on{' '}
        <a href="https://github.com/odddollar/Compress-8MB">Compress-8MB</a> by Simon Eason (MIT
        License). We retained the MIT <code>LICENSE</code> file from that project.
      </p>
      <h2>Encoder</h2>
      <p>
        We ship <strong>browser WebCodecs</strong> (H.264 <code>VideoEncoder</code> and optional AAC{' '}
        <code>AudioEncoder</code>) and mux output with the{' '}
        <a href="https://github.com/Vanilagy/mp4-muxer">mp4-muxer</a> library (MIT). We do{' '}
        <strong>not</strong> load GPL FFmpeg WebAssembly cores (no <code>libx264</code> in WASM, no
        COEP/COOP headers).
      </p>
      <p>
        <a href="https://ffmpeg.org/">FFmpeg</a> and{' '}
        <a href="https://github.com/ffmpegwasm/ffmpeg.wasm">ffmpeg.wasm</a> power many sister tools on{' '}
        <a href={HUB_URL}>web-free.site</a>; this compressor intentionally avoids GPL cores for
        licensing and ad compatibility.
      </p>
      <h2>Privacy</h2>
      <p>Your videos are not uploaded. See the <a href="/privacy">privacy policy</a>.</p>
    </ContentPage>
  );
}

function PrivacyPage() {
  return (
    <ContentPage
      title="Privacy policy"
      description="Privacy policy for the Free Video Compressor."
      path="/privacy"
    >
      <h1>Privacy policy</h1>
      <p>
        Videos you select are processed locally in your browser. We do not receive, store, or analyze
        your media on our servers.
      </p>
      <p>
        We use Cloudflare Web Analytics and Adsterra advertising scripts that may set cookies or
        collect usage data according to those providers&apos; policies.
      </p>
    </ContentPage>
  );
}

function TermsPage() {
  return (
    <ContentPage
      title="Terms of use"
      description="Terms for using the Free Video Compressor."
      path="/terms"
    >
      <h1>Terms of use</h1>
      <p>Use this tool only on files you have the right to compress. The service is provided as-is
        without warranty.</p>
    </ContentPage>
  );
}

function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      description="Contact the Free Video Compressor maintainers."
      path="/contact"
    >
      <h1>Contact</h1>
      <p>
        Report issues on the{' '}
        <a href="https://github.com/web-free-site/free-video-compressor">GitHub repository</a> or
        visit <a href={HUB_URL}>web-free.site</a>.
      </p>
    </ContentPage>
  );
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/how-to-compress-a-video-in-the-browser"
          element={
            <ContentPage
              title="How to compress a video in the browser"
              description="Step-by-step guide to shrink a video file locally without uploading."
              path="/how-to-compress-a-video-in-the-browser"
            >
              <h1>How to compress a video in the browser</h1>
              <ol>
                <li>Open the compressor and choose a local MP4, MOV, WebM, or MKV file.</li>
                <li>Pick a platform preset or set a custom target size in megabytes.</li>
                <li>Adjust resolution and frame rate if needed; keep audio on for social clips.</li>
                <li>Click Compress and wait for the progress bar to finish.</li>
                <li>Preview the result and download the smaller MP4.</li>
              </ol>
              <p>
                <a href="/">Try the compressor</a>
              </p>
            </ContentPage>
          }
        />
        <Route
          path="/compress-video-for-whatsapp"
          element={
            <CompressorPage
              title="Compress video for WhatsApp"
              lead="Use the WhatsApp preset (16 MB target) to shrink clips before sending."
              initialPreset="whatsapp"
              metaPath="/compress-video-for-whatsapp"
            />
          }
        />
        <Route
          path="/compress-video-to-25mb"
          element={
            <CompressorPage
              title="Compress video to 25 MB"
              lead="Email-friendly compression with a 25 MB target size preset."
              initialPreset="email-25"
              metaPath="/compress-video-to-25mb"
            />
          }
        />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
    </>
  );
}