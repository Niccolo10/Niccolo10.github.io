import { defineConfig } from 'astro/config';
import redirects from './legacy-redirects.json' with { type: 'json' };
export default defineConfig({ site: 'https://niccoloparlanti.com', trailingSlash: 'always', output: 'static', markdown: { shikiConfig: { theme: 'github-light' } }, redirects: Object.fromEntries(Object.entries(redirects).filter(([path]) => !path.endsWith('.xml'))), devToolbar: { enabled: false } });
