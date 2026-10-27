import { defineConfig } from 'astro/config';
const base=process.env.BASE_PATH||'/smart-clinic-assistant/';
if(!/^\/(?:[A-Za-z0-9_-]+\/)*$/.test(base))throw new Error('BASE_PATH inválido');
export default defineConfig({output:'static',base,trailingSlash:'always',vite:{build:{assetsInlineLimit:0}}});
