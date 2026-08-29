import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
  // Macintosh is the primary design at the project-page root.
  // All internal links use the `u()` helper in src/lib/url.ts so they pick up the base.
  site: 'https://akira55.github.io',
  base: '/matsui-lab',
  trailingSlash: 'always',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ja'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
