// @ts-check
import { defineConfig, envField } from 'astro/config';
import node from '@astrojs/node';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'standalone',
  }),
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
      API_BE: envField.string({ context: "client", access: "public", optional: true }),
      KATA_SANDI: envField.string({ context: "client", access: "public", optional: true }),
      KATA_SANDI_ASLI: envField.string({ context: "client", access: "public", optional: true }),
      PASSWORD: envField.string({ context: "client", access: "public", optional: true }),
      KEY: envField.string({ context: "client", access: "public", optional: true }),
      PLAIN_TEXT: envField.string({ context: "client", access: "public", optional: true }),
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