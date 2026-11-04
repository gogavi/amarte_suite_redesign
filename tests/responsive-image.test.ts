import assert from 'node:assert/strict';
import test from 'node:test';
import { imageLoadingAttrs, responsiveFromPicture } from '../src/lib/responsiveImage.ts';

test('el póster LCP se pide eager y con prioridad alta', () => {
  assert.deepEqual(imageLoadingAttrs('lcp'), {
    loading: 'eager',
    fetchPriority: 'high',
    decoding: 'sync',
  });
});

test('una imagen visible que no es el LCP no compite con prioridad alta', () => {
  assert.deepEqual(imageLoadingAttrs('visible'), {
    loading: 'eager',
    fetchPriority: 'low',
    decoding: 'async',
  });
});

test('el resto de las imágenes espera a estar cerca del viewport', () => {
  assert.deepEqual(imageLoadingAttrs('content'), {
    loading: 'lazy',
    fetchPriority: 'auto',
    decoding: 'async',
  });
});

test('una foto de suite expone AVIF, WebP y un src de respaldo', () => {
  const image = responsiveFromPicture({
    sources: {
      avif: '/suite-480.avif 480w, /suite-960.avif 960w',
      webp: '/suite-480.webp 480w, /suite-960.webp 960w',
    },
    img: { src: '/suite-960.webp', w: 960, h: 640 },
  });

  assert.equal(image.src, '/suite-960.webp');
  assert.equal(image.width, 960);
  assert.equal(image.height, 640);
  assert.match(image.avifSrcSet, /480w/);
  assert.match(image.avifSrcSet, /960w/);
  assert.match(image.webpSrcSet, /\.webp 960w/);
});

test('sin srcset AVIF o WebP la foto no se publica', () => {
  assert.throws(
    () => responsiveFromPicture({
      sources: { webp: '/solo.webp 480w' },
      img: { src: '/solo.webp', w: 480, h: 320 },
    }),
    /AVIF/,
  );
});
