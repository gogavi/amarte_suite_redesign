import assert from 'node:assert/strict';
import test from 'node:test';
import {
  attributedReservasHref,
  rememberReservaAttribution,
  reservaHref,
  reservaHrefFromBrowser,
} from '../src/lib/reservaAttribution.ts';

const LANDING = [
  'utm_source=google',
  'utm_medium=cpc',
  'utm_campaign=mayo',
  'utm_content=hero',
  'utm_term=jacuzzi',
  'gclid=gclidValue01',
  'gbraid=gbraidValue01',
  'wbraid=wbraidValue01',
  'fbclid=fbclidValue01',
  'ref=no-reenviar',
].join('&');

function memoryStorage() {
  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
}

test('reenvía la atribución de la URL y la conserva como primer toque', () => {
  const storage = memoryStorage();
  const first = new URL(reservaHref('https://reservas.amartesuite.com', `?${LANDING}`, storage));

  assert.equal(first.origin + first.pathname, 'https://reservas.amartesuite.com/');
  assert.equal(first.searchParams.get('utm_source'), 'google');
  assert.equal(first.searchParams.get('utm_medium'), 'cpc');
  assert.equal(first.searchParams.get('utm_campaign'), 'mayo');
  assert.equal(first.searchParams.get('utm_content'), 'hero');
  assert.equal(first.searchParams.get('utm_term'), 'jacuzzi');
  assert.equal(first.searchParams.get('gclid'), 'gclidValue01');
  assert.equal(first.searchParams.get('gbraid'), 'gbraidValue01');
  assert.equal(first.searchParams.get('wbraid'), 'wbraidValue01');
  assert.equal(first.searchParams.get('fbclid'), 'fbclidValue01');
  assert.equal(first.searchParams.get('ref'), null);
  assert.equal(first.searchParams.getAll('utm_source').length, 1);

  const later = new URL(reservaHref(
    'https://reservas.amartesuite.com',
    '?utm_source=facebook&utm_medium=social&fbclid=otroFbclid99',
    storage,
  ));
  assert.equal(later.searchParams.get('utm_source'), 'google');
  assert.equal(later.searchParams.get('utm_medium'), 'cpc');
  assert.equal(later.searchParams.get('fbclid'), 'fbclidValue01');
  assert.equal(later.searchParams.getAll('utm_source').length, 1);

  const afterNavigation = new URL(reservaHref('https://reservas.amartesuite.com', '', storage));
  assert.equal(afterNavigation.searchParams.get('gclid'), 'gclidValue01');
  assert.equal(afterNavigation.searchParams.get('utm_campaign'), 'mayo');
});

test('no duplica parámetros que el destino ya trae y no toca otros enlaces', () => {
  const storage = memoryStorage();
  rememberReservaAttribution(storage, '?utm_source=google&utm_medium=cpc&gclid=gclidValue01');

  const reservas = new URL(attributedReservasHref(
    'https://reservas.amartesuite.com/suites?utm_source=interno&promo=1',
    '',
    storage,
  ));
  assert.equal(reservas.searchParams.getAll('utm_source').length, 1);
  assert.equal(reservas.searchParams.get('utm_source'), 'interno');
  assert.equal(reservas.searchParams.get('utm_medium'), 'cpc');
  assert.equal(reservas.searchParams.get('gclid'), 'gclidValue01');
  assert.equal(reservas.searchParams.get('promo'), '1');
  assert.equal(reservas.pathname, '/suites');

  assert.equal(
    attributedReservasHref('https://instagram.com/amarte_suite', '?utm_source=google', storage),
    'https://instagram.com/amarte_suite',
  );
});

test('sin window el enlace de reservas queda igual', () => {
  assert.equal(
    reservaHrefFromBrowser('https://reservas.amartesuite.com'),
    'https://reservas.amartesuite.com',
  );
  assert.equal(reservaHref('https://reservas.amartesuite.com', '', null), 'https://reservas.amartesuite.com');
});
