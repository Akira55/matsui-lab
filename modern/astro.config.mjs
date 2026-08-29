import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import { fileURLToPath } from 'node:url';

const modernRoot = new URL('./', import.meta.url);

export default defineConfig({
  root: fileURLToPath(new URL('../', import.meta.url)),
  srcDir: fileURLToPath(new URL('./src', modernRoot)),
  publicDir: fileURLToPath(new URL('./public', modernRoot)),
  outDir: fileURLToPath(new URL('../dist/modern', modernRoot)),
  site: 'https://akira55.github.io',
  base: '/matsui-lab/modern',
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
