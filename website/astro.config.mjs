import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://minhngocn.com',
  trailingSlash: 'never',
  integrations: [sitemap()],
});
