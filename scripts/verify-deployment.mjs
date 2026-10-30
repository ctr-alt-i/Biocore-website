import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const origin = 'https://biocore-solution.biocoresolution.workers.dev';
const pages = [
  ['/', 'index.html'],
  ['/contact', 'contact.html'],
  ['/products-specializations', 'products-specializations.html'],
  ['/assets/js/main.js', 'assets/js/main.js'],
  ['/assets/css/styles.css', 'assets/css/styles.css'],
];

for (const [route, file] of pages) {
  const expected = await readFile(new URL(`../dist/${file}`, import.meta.url), 'utf8');
  let matched = false;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const response = await fetch(`${origin}${route}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      });
      if (response.ok && await response.text() === expected) {
        matched = true;
        break;
      }
    } catch (error) {
      console.warn(`${route}: ${error.message}`);
    }
    if (attempt < 6) await setTimeout(5000);
  }
  if (!matched) throw new Error(`Live page does not match this build: ${origin}${route}`);
  console.log(`Verified ${origin}${route}`);
}
