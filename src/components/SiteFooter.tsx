import React from 'react';
import { HUB_URL } from '../site';

export default function SiteFooter() {
  return (
    <footer className="site-footer container center">
      <small>All files are processed client-side — nothing is uploaded to our servers.</small>
      <br />
      <small>
        Based on{' '}
        <a href="https://github.com/odddollar/Compress-8MB" rel="noopener noreferrer">
          Compress-8MB
        </a>{' '}
        (MIT, Simon Eason). Video uses the browser WebCodecs H.264 encoder with{' '}
        <a href="https://github.com/Vanilagy/mp4-muxer" rel="noopener noreferrer">
          mp4-muxer
        </a>
        . See <a href="/about">About</a> for upstream and codec credits.
      </small>
      <br />
      <small>
        More tools at{' '}
        <a href={HUB_URL} rel="noopener">
          web-free.site
        </a>
      </small>
    </footer>
  );
}