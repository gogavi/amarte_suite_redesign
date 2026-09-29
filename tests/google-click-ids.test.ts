import assert from 'node:assert/strict';
import test from 'node:test';
import {
  captureGoogleClickIds,
  clickIdFromGclCookie,
  clickIdsForReservation,
  isMissingClickIdColumn,
  mergeClickIds,
  rememberGoogleClickIds,
  sanitizeClickId,
} from '../src/lib/googleClickIds.ts';

test('descarta click ids vacíos o con caracteres raros', () => {
  assert.equal(sanitizeClickId(''), null);
  assert.equal(sanitizeClickId('ab'), null);
  assert.equal(sanitizeClickId('abc def'), null);
  assert.equal(sanitizeClickId('Cj0KCQjw_test'), 'Cj0KCQjw_test');
});

test('gclid sale de la URL y, si no está, de la cookie _gcl_aw', () => {
  const now = new Date('2026-09-29T15:00:00.000Z');
  const fromUrl = captureGoogleClickIds({
    search: '?gclid=fromUrlClick&gbraid=fromUrlBraid&wbraid=fromUrlWbraid',
    cookie: '_gcl_aw=GCL.1700000000.fromCookieClick',
    now,
  });
  assert.equal(fromUrl.gclid, 'fromUrlClick');
  assert.equal(fromUrl.gbraid, 'fromUrlBraid');
  assert.equal(fromUrl.wbraid, 'fromUrlWbraid');

  const fromCookie = captureGoogleClickIds({
    search: '',
    cookie: '_gcl_aw=GCL.1700000000.cookieGclid; _gcl_gb=GCL.1700000000.cookieGbraid',
    now,
  });
  assert.equal(fromCookie.gclid, 'cookieGclid');
  assert.equal(fromCookie.gbraid, 'cookieGbraid');
  assert.equal(fromCookie.wbraid, null);
  assert.equal(clickIdFromGclCookie('not-a-gcl-cookie'), null);
});

test('guarda el click id de la primera visita y lo manda en la reserva', () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
  const now = new Date('2026-09-29T15:00:00.000Z');
  rememberGoogleClickIds(storage, '?gclid=storedGclidValue', '', now);
  const later = rememberGoogleClickIds(storage, '', '', new Date('2026-09-29T16:00:00.000Z'));
  assert.equal(later.gclid, 'storedGclidValue');

  const columns = clickIdsForReservation(later, now);
  assert.deepEqual(columns, {
    gclid: 'storedGclidValue',
    click_ids_captured_at: '2026-09-29T15:00:00.000Z',
  });
  assert.deepEqual(mergeClickIds(later, { gclid: null, gbraid: null, wbraid: null, capturedAt: null }).gclid, 'storedGclidValue');
});

test('un click id viejo sigue enviándose, con fecha de captura actual', () => {
  const now = new Date('2026-09-29T15:00:00.000Z');
  const columns = clickIdsForReservation({
    gclid: 'oldButValidGclid',
    gbraid: null,
    wbraid: null,
    capturedAt: '2020-01-01T00:00:00.000Z',
  }, now);
  assert.equal(columns.gclid, 'oldButValidGclid');
  assert.equal(columns.click_ids_captured_at, now.toISOString());
});

test('solo reintenta el insert si faltan las columnas de click id', () => {
  assert.equal(isMissingClickIdColumn({
    code: 'PGRST204',
    message: "Could not find the 'gclid' column of 'reservations' in the schema cache",
  }), true);
  assert.equal(isMissingClickIdColumn({
    code: '23505',
    message: 'duplicate key value violates unique constraint',
  }), false);
  assert.equal(isMissingClickIdColumn({
    code: 'PGRST204',
    message: "Could not find the 'precio' column of 'reservations' in the schema cache",
  }), false);
});
