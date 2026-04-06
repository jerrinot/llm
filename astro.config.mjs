import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';

// GitHub Pages deployment policy:
// - For custom domain: set site to 'https://yourdomain.com', remove base
// - For project pages (github.io/repo): set base to '/repo'
// - Default: custom domain assumed, no base path
//
// Override via environment:
//   SITE_URL=https://yourdomain.com BASE_PATH=/llmsite astro build

export default defineConfig({
  site: process.env.SITE_URL || 'https://llm.jerrinot.info',
  base: process.env.BASE_PATH || '/',
  integrations: [react(), mdx()],
  output: 'static',
  vite: {
    server: {
      allowedHosts: true,
    },
    optimizeDeps: {
      exclude: ['@huggingface/transformers'],
    },
  },
});
