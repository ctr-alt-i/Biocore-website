import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = fileURLToPath(new URL('../dist/', import.meta.url));
const siteOrigin = 'https://biocore-solution.biocoresolution.workers.dev';
const pages = ['index.html', 'products-specializations.html', 'contact.html', '404.html'];
await rm(output, { recursive: true, force: true });
await mkdir(output, { recursive: true });
for (const page of pages) await cp(`${root}${page}`, `${output}${page}`);
await cp(`${root}assets`, `${output}assets`, { recursive: true });
await cp(`${root}_headers`, `${output}_headers`);
await writeFile(`${output}robots.txt`, `User-agent: *\nAllow: /\nSitemap: ${siteOrigin}/sitemap.xml\n`);
const paths = ['/', '/products-specializations', '/contact'];
await writeFile(`${output}sitemap.xml`, `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map(path=>`  <url><loc>${siteOrigin}${path}</loc></url>`).join('\n')}\n</urlset>\n`);
// Only public website files are copied. PHP, documentation, review images,
// dependencies, repository metadata and deployment config stay local.
console.log(`Built ${pages.length} HTML pages plus public assets in dist/`);
