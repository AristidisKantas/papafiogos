import { site, type Locale } from '../config/site';
import { absolute, homePath, pick } from '../i18n/utils';
import type { Moment } from './timeline-validate';

/** Structured data for the home page (Person, WebSite, ProfessionalService, VideoObjects). */
export function homeJsonLd(locale: Locale, moments: Moment[], urls: Record<string, string> = {}) {
  const url = absolute(homePath(locale));
  const personId = `${site.url}/#person`;
  const instagram = `https://instagram.com/${site.contact.instagram}`;
  const graph: object[] = [
    {
      '@type': 'Person',
      '@id': personId,
      name: site.name,
      alternateName: site.alternateNames,
      url: site.url + '/',
      image: absolute('/og-image.jpg'),
      email: `mailto:${site.contact.email}`,
      telephone: site.contact.phoneHref,
      sameAs: [instagram],
    },
    {
      '@type': 'WebSite',
      '@id': `${site.url}/#website`,
      name: site.name,
      url: site.url + '/',
      inLanguage: locale,
      publisher: { '@id': personId },
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${site.url}/#business`,
      name: site.name,
      alternateName: site.alternateNames,
      url,
      image: absolute('/og-image.jpg'),
      description: site.description[locale],
      email: site.contact.email,
      telephone: site.contact.phoneHref,
      founder: { '@id': personId },
      address: {
        '@type': 'PostalAddress',
        addressLocality: site.location.locality[locale],
        addressRegion: site.location.region[locale],
        addressCountry: site.location.country,
      },
      areaServed: site.location.areaServed,
      sameAs: [instagram],
    },
  ];

  for (const m of moments) {
    for (const media of m.media) {
      if (media.kind === 'photo') continue;
      const d =
        m.date.length === 4 ? `${m.date}-01-01` : m.date.length === 7 ? `${m.date}-01` : m.date;
      const base = {
        '@type': 'VideoObject',
        name: pick(m.title, locale),
        description: pick(m.text, locale) ?? pick(media.alt, locale),
        uploadDate: d,
        thumbnailUrl: urls[`poster:${m.id}`] ?? absolute('/og-image.jpg'),
        inLanguage: locale,
      };
      if (media.kind === 'video') graph.push({ ...base, contentUrl: urls[`video:${m.id}`] });
      else if (media.kind === 'youtube')
        graph.push({
          ...base,
          embedUrl: `https://www.youtube-nocookie.com/embed/${media.youtube}`,
          url: `https://www.youtube.com/watch?v=${media.youtube}`,
        });
      else
        graph.push({
          ...base,
          embedUrl: `https://player.vimeo.com/video/${media.vimeo}`,
          url: `https://vimeo.com/${media.vimeo}`,
        });
    }
  }
  return graph;
}
