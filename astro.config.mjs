// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import pruneMedia from './integrations/prune-media.mjs';

export default defineConfig({
  site: 'https://papafiogos.gr',
  output: 'static',
  trailingSlash: 'ignore',
  build: { inlineStylesheets: 'always', format: 'directory' },
  i18n: {
    defaultLocale: 'el',
    locales: ['el', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    pruneMedia(),
    sitemap({
      i18n: { defaultLocale: 'el', locales: { el: 'el-GR', en: 'en-US' } },
      filter: (page) => !page.includes('/404'),
    }),
  ],
  image: { responsiveStyles: false },
  // Strict Content-Security-Policy, emitted as a <meta> tag with hashes for
  // every inline script/style. Only self + Cloudflare analytics + video players.
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "media-src 'self'",
        "font-src 'self'",
        "connect-src 'self' https://cloudflareinsights.com",
        'frame-src https://www.youtube-nocookie.com https://player.vimeo.com',
        "base-uri 'self'",
        "form-action 'none'",
        "object-src 'none'",
      ],
      scriptDirective: { resources: ["'self'", 'https://static.cloudflareinsights.com'] },
    },
  },
  devToolbar: { enabled: false },
  markdown: { syntaxHighlight: false },
});
