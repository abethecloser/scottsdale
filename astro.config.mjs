import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static output with a serverless function for /api/lead.
export default defineConfig({
  site: 'https://scottsdalesalestraining.com', // provisional; update at domain cutover
  output: 'static',
  adapter: vercel(),
  integrations: [tailwind(), sitemap()],
});
