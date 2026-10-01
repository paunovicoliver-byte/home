import { defineConfig } from 'astro/config';
import { writeHostFiles } from './src/lib/host-files.mjs';

export default defineConfig({
  site: process.env.SITE_URL || 'https://www.drveno.com',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  compressHTML: true,
  integrations: [
    {
      name: 'drveno-host-files',
      hooks: { 'astro:build:done': ({ dir }) => writeHostFiles(dir) },
    },
  ],
});
