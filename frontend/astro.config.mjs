// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  compressHTML: true,
  security: {
    checkOrigin: true
  },
  build: {
    inlineStylesheets: `never`,
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: 'hover'
  }
  /*
  site: 'https://www.example.com',
  base: '/docs',
  trailingSlash: 'always',
  */
})