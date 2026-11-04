import assert from 'node:assert/strict';
import test from 'node:test';
import { shouldMountHeroVideo } from '../src/lib/heroMedia.ts';

const ready = { isMobile: false, reducedMotion: false, inView: true, armed: true };

test('el video del hero no se monta en móvil', () => {
  assert.equal(shouldMountHeroVideo({ ...ready, isMobile: true }), false);
});

test('el video del hero espera a que el póster ya pudo pintar', () => {
  assert.equal(shouldMountHeroVideo({ ...ready, armed: false }), false);
});

test('el video del hero no corre con reduced motion ni fuera de vista', () => {
  assert.equal(shouldMountHeroVideo({ ...ready, reducedMotion: true }), false);
  assert.equal(shouldMountHeroVideo({ ...ready, inView: false }), false);
});

test('en escritorio el video entra cuando el arranque ya pasó', () => {
  assert.equal(shouldMountHeroVideo(ready), true);
});
