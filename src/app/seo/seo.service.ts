import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TITLE,
  SeoConfig,
  SITE_URL,
} from './seo.constants';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);
  private jsonLdEl: HTMLScriptElement | null = null;

  update(config: Partial<SeoConfig>): void {
    const title = config.title ?? DEFAULT_TITLE;
    const description = config.description ?? DEFAULT_DESCRIPTION;
    const path = config.path ?? '/';
    const ogImage = config.ogImage ?? DEFAULT_OG_IMAGE;
    const url = `${SITE_URL}${path === '/' ? '' : path}`;

    this.title.setTitle(title);
    this.setMetaTag('name', 'description', description);
    this.setMetaTag('property', 'og:title', title);
    this.setMetaTag('property', 'og:description', description);
    this.setMetaTag('property', 'og:image', ogImage);
    this.setMetaTag('property', 'og:url', url);
    this.setMetaTag('name', 'twitter:title', title);
    this.setMetaTag('name', 'twitter:description', description);
    this.setMetaTag('name', 'twitter:image', ogImage);
    this.setCanonical(url);
  }

  setJsonLd(data: object): void {
    this.clearJsonLd();
    this.jsonLdEl = this.doc.createElement('script');
    this.jsonLdEl.type = 'application/ld+json';
    this.jsonLdEl.text = JSON.stringify(data);
    this.doc.head.appendChild(this.jsonLdEl);
  }

  clearJsonLd(): void {
    if (this.jsonLdEl) {
      this.jsonLdEl.remove();
      this.jsonLdEl = null;
    }
  }

  private setMetaTag(attr: 'name' | 'property', key: string, content: string): void {
    this.meta.updateTag({ [attr]: key, content });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector('link[rel="canonical"]');
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }
}
