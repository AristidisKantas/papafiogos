import { site, type Locale } from '../config/site';
import { strings, type StringKey } from './strings';

export function t(locale: Locale, key: StringKey): string {
  return strings[locale][key];
}

/** Section anchors per language. */
export const anchors = {
  el: { story: 'istoria', contact: 'epikoinonia' },
  en: { story: 'story', contact: 'contact' },
} as const;

export type Section = keyof (typeof anchors)['el'];

/** Home URL for a language: "/" for Greek, "/en/" for English. */
export function homePath(locale: Locale) {
  return locale === site.defaultLocale ? '/' : `/${locale}/`;
}

export function pagePath(locale: Locale, page: '' | 'privacy') {
  const base = homePath(locale);
  return page ? `${base}${page}/` : base;
}

export function absolute(path: string) {
  return new URL(path, site.url).href;
}

export function otherLocale(locale: Locale): Locale {
  return locale === 'el' ? 'en' : 'el';
}

/** A bilingual value with fallback to the other language. */
export type Bilingual = { el?: string; en?: string };

export function pick(value: Bilingual | undefined, locale: Locale): string | undefined {
  if (!value) return undefined;
  return value[locale] || value[otherLocale(locale)] || undefined;
}
