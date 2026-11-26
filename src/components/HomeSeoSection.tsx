import React, { useLayoutEffect } from 'react';
import { HOME_FAQ } from '../seo/homeSeoContent';

/**
 * Visible SEO body copy below the compressor tool (homepage only).
 * The page’s single &lt;h1&gt; lives in the hero; this section uses h2/h3.
 */
export default function HomeSeoSection() {
  useLayoutEffect(() => {
    document.getElementById('seo-home-static')?.remove();
  }, []);

  return (
    <section className="home-seo container" aria-label="About this compressor">
      <p className="home-seo-intro">
        Shrink video files to a specific megabyte limit without sending them to a remote server.
        This free online video compressor runs in your browser: pick a file from your phone or
        computer, choose a platform preset or custom target size, and download a smaller H.264 MP4.
        It is built for everyday sharing limits on WhatsApp, Discord, email, and Messenger, while
        keeping processing private on your device.
      </p>

      <h2>How to compress a video</h2>
      <ol className="home-seo-steps">
        <li>
          Open this page in Chrome, Edge, or another browser that supports WebCodecs.
        </li>
        <li>
          Click or drag your video into the upload box. Common formats include MP4, MOV, WebM, and
          MKV.
        </li>
        <li>
          Select a platform preset (WhatsApp 16 MB, Discord 10 MB, email 25 MB, WhatsApp Status,
          Messenger) or enter a custom target size in megabytes.
        </li>
        <li>
          Optionally lower resolution or frame rate and choose whether to keep AAC audio in the
          output.
        </li>
        <li>
          Click <strong>Compress video</strong>, wait for the progress bar, preview the result if
          you like, then download the compressed MP4.
        </li>
      </ol>

      <h2>When to use a video size reducer</h2>
      <p>
        Large clips from a camera or screen recording often exceed attachment limits. WhatsApp video
        messages are commonly capped around 16 MB; Discord free uploads are often limited to about 10
        MB without Nitro; many email providers reject attachments above roughly 25 MB. Compressing
        toward those targets before you send helps the file go through on the first try. You can also
        set a custom cap between 1 and 500 MB when a portal or form names a maximum upload size.
      </p>
      <p>
        This tool does not host your media and does not download from YouTube or other URLs—you only
        work with files already on your device. That keeps control with you and avoids cloud queues.
        Output uses the browser’s H.264 encoder via WebCodecs and muxes MP4 with optional AAC audio,
        which is widely playable on phones and desktops.
      </p>

      <h2>Formats and quality</h2>
      <p>
        Input is accepted when the file is a video your browser can decode (typically MP4, MOV, WebM,
        MKV, and related extensions). The exporter writes H.264 video in an MP4 container. H.265
        (HEVC) encoding is not offered here because it would require GPL-linked libraries in the
        page. Bitrate is chosen from your target file size and clip duration so the result aims near
        the megabyte limit you set. Very long or very high-resolution sources may need a lower
        resolution preset to hit a small target without heavy artifacts. You can keep or strip
        audio; stripping saves space for silent clips.
      </p>

      <h2>Frequently asked questions</h2>
      <div className="home-seo-faq">
        {HOME_FAQ.map(item => (
          <article key={item.q} className="home-seo-faq-item">
            <h3>{item.q}</h3>
            <p>{item.a}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
