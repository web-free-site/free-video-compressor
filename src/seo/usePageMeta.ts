import { useEffect } from 'react';
import { SITE_HOST } from '../site';

export function usePageMeta(title: string, description: string, path = '/') {
  useEffect(() => {
    document.title = title;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute('content', description);
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = SITE_HOST + path;
    const ogTitle = document.querySelector('meta[property="og:title"]');
    const ogDesc = document.querySelector('meta[property="og:description"]');
    const ogUrl = document.querySelector('meta[property="og:url"]');
    ogTitle?.setAttribute('content', title);
    ogDesc?.setAttribute('content', description);
    ogUrl?.setAttribute('content', SITE_HOST + path);
  }, [title, description, path]);
}