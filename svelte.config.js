import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { mdsvex } from 'mdsvex';
import { fileURLToPath } from 'node:url';

// Build setup for the kb export: pages are .svx, `layout: runbook` picks the shared frame,
// `#lib/…` points at src/lib. Every page is prerendered to plain HTML in build/.
export default {
  extensions: ['.svelte', '.svx'],
  preprocess: [
    vitePreprocess(),
    mdsvex({ extensions: ['.svx'], layout: { runbook: fileURLToPath(new URL('./src/lib/layouts/runbook.svelte', import.meta.url)) } }),
  ],
  kit: {
    adapter: adapter(),
    alias: { '#lib': 'src/lib' },
    prerender: { entries: ['/kb'] },
  },
};
