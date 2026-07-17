import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SITE_NAME = 'SPET Online';
const SITE_URL = 'https://spetonline.co.za';
const DEFAULT_IMAGE = `${SITE_URL}/logo-main.png`;

interface SEOOptions {
  /** Page title. Rendered as "<title> | SPET Online" unless `bare` is set. */
  title: string;
  description: string;
  image?: string;
  /** Skip appending "| SPET Online" — use for the homepage's own full title. */
  bare?: boolean;
  /** Keep this page out of search results (account/checkout/admin/enterprise, etc). */
  noindex?: boolean;
  /** Structured data (schema.org) to embed as a JSON-LD script tag. */
  jsonLd?: Record<string, unknown>;
}

function upsertMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonical(href: string) {
  let el = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

function upsertJsonLd(data: Record<string, unknown> | undefined) {
  const existing = document.querySelector('script[data-seo-jsonld="true"]');
  if (!data) {
    existing?.remove();
    return;
  }
  const el = existing ?? document.createElement('script');
  el.setAttribute('type', 'application/ld+json');
  el.setAttribute('data-seo-jsonld', 'true');
  el.textContent = JSON.stringify({ '@context': 'https://schema.org', ...data });
  if (!existing) document.head.appendChild(el);
}

/** Sets per-page title, meta description, Open Graph/Twitter tags, canonical URL,
 *  robots directive, and optional JSON-LD — the SPA equivalent of per-page <head> tags. */
export function useSEO({ title, description, image, bare, noindex, jsonLd }: SEOOptions) {
  const { pathname } = useLocation();

  useEffect(() => {
    const fullTitle = bare ? title : `${title} | ${SITE_NAME}`;
    const canonicalUrl = `${SITE_URL}${pathname}`;
    const ogImage = image ?? DEFAULT_IMAGE;

    document.title = fullTitle;
    upsertMeta('name', 'description', description);
    upsertMeta('property', 'og:title', fullTitle);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', canonicalUrl);
    upsertMeta('property', 'og:image', ogImage);
    upsertMeta('name', 'twitter:title', fullTitle);
    upsertMeta('name', 'twitter:description', description);
    upsertMeta('name', 'twitter:image', ogImage);
    upsertMeta('name', 'robots', noindex ? 'noindex, nofollow' : 'index, follow');
    upsertCanonical(canonicalUrl);
    upsertJsonLd(jsonLd);
  }, [pathname, title, description, image, bare, noindex, jsonLd]);
}
