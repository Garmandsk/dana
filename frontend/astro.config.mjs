// @ts-check
import { defineConfig, envField } from 'astro/config';

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
  },
  env: {
    schema: {
      API_URL_HAPI: envField.string({ context: "client", access: "public", optional: true }),
      /* API_PORT_HAPI: envField.number({ context: "server", access: "public", default: 5000 }),
      API_HOST_HAPI: envField.string({ context: "server", access: "public", default: "localhost" }),
      API_SECRET: envField.string({ context: "server", access: "secret" }), */
    },
  },
  /*
  site: 'https://www.example.com',
  base: '/docs',
  trailingSlash: 'always',
  */
})