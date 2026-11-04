import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const poster = html.slice(html.indexOf('<picture>'), html.indexOf('</picture>') + '</picture>'.length);

test('el póster del hero está en el HTML, en AVIF y WebP, y no espera a JavaScript', () => {
  assert.match(poster, /type="image\/avif"/);
  assert.match(poster, /type="image\/webp"/);
  assert.match(poster, /srcset="[^"]+ 480w[^"]+"/);
  assert.match(poster, /srcset="[^"]+ 1440w[^"]+"/);
  assert.match(poster, /id="lcp-poster"/);
  assert.match(poster, /fetchpriority="high"/);
  assert.match(poster, /loading="eager"/);
  assert.doesNotMatch(poster, /loading="lazy"/);
});

test('el póster se precarga con la misma prioridad que el LCP', () => {
  assert.match(html, /rel="preload"/);
  assert.match(html, /as="image"/);
  assert.match(html, /space-mobile-768\.avif/);
  assert.match(html, /space-desktop-1440\.avif/);
});

test('el planeta está en el HTML, con prioridad alta, para pintar sin esperar al bundle', () => {
  assert.match(html, /id="lcp-planet"/);
  assert.match(html, /src="\/media\/planeta-687\.avif"/);
  assert.match(html, /href="\/media\/planeta-687\.avif"/);
  assert.match(html, /fetchpriority="high"/);
  assert.match(html, /is-gracias/);
});
