import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { AdSlot } from './ads/AdSlot';
import { SITE_NAME } from '../site';

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="container nav-row">
        <Link to="/" className="brand">
          {SITE_NAME}
        </Link>
        <nav aria-label="Primary">
          <NavLink to="/how-to-compress-a-video-in-the-browser">How-to</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact</NavLink>
        </nav>
      </div>
      <AdSlot slot="header728x90" className="header-ad" />
    </header>
  );
}