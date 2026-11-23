import React from 'react';
import { usePageMeta } from '../seo/usePageMeta';
import SiteFooter from '../components/SiteFooter';
import { AdSlot } from '../components/ads/AdSlot';

export default function ContentPage({
  title,
  description,
  path,
  children,
}: {
  title: string;
  description: string;
  path: string;
  children: React.ReactNode;
}) {
  usePageMeta(title, description, path);
  return (
    <article className="container content-page space-elements">
      <AdSlot slot="homeTop728x90" className="center-ad" />
      {children}
      <SiteFooter />
    </article>
  );
}