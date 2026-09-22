import { assertEquals } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import {
  eventChecksum,
  integritySignature,
  readDataProperty,
  sha256Hex,
  timingSafeEqualHex,
} from './wompi.ts';

// Vectores publicados en docs.wompi.co (no son secretos de Amarte).

Deno.test('firma de integridad — vector oficial Wompi', async () => {
  const hex = await integritySignature({
    reference: 'sk8-438k4-xmxm392-sn2m',
    amountInCents: 2490000,
    currency: 'COP',
    integritySecret: 'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6',
  });
  assertEquals(
    hex,
    '37c8407747e595535433ef8f6a811d853cd943046624a0ec04662b17bbf33bf5',
  );
});

Deno.test('firma de integridad con expiration-time', async () => {
  const hex = await integritySignature({
    reference: 'sk8-438k4-xmxm392-sn2m',
    amountInCents: 2490000,
    currency: 'COP',
    expirationTime: '2023-06-09T20:28:50.000Z',
    integritySecret: 'prod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6',
  });
  const expected = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(
      'sk8-438k4-xmxm392-sn2m2490000COP2023-06-09T20:28:50.000Zprod_integrity_Z5mMke9x0k8gpErbDqwrJXMqsI6SFli6',
    ),
  );
  const expectedHex = [...new Uint8Array(expected)]
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
  assertEquals(hex, expectedHex);
});

Deno.test('checksum de evento — concatenación documentada (properties + timestamp + secret)', async () => {
  const hex = await eventChecksum({
    data: {
      transaction: {
        id: '1234-1610641025-49201',
        status: 'APPROVED',
        amount_in_cents: 4490000,
      },
    },
    properties: [
      'transaction.id',
      'transaction.status',
      'transaction.amount_in_cents',
    ],
    timestamp: 1530291411,
    eventsSecret: 'prod_events_OcHnIzeBl5socpwByQ4hA52Em3USQ93Z',
  });
  const expected = await sha256Hex(
    '1234-1610641025-49201APPROVED44900001530291411prod_events_OcHnIzeBl5socpwByQ4hA52Em3USQ93Z',
  );
  assertEquals(hex, expected);
  // El valor 3476DDA5… de la página de eventos no coincide con SHA-256 de esa
  // cadena de ejemplo; se trata como ilustrativo. El algoritmo sí es el de la guía.
});

Deno.test('readDataProperty rechaza segmentos no alfanuméricos', () => {
  assertEquals(
    readDataProperty({ transaction: { id: 'x' } }, 'transaction.id.__proto__'),
    null,
  );
  assertEquals(
    readDataProperty({ transaction: { id: 'x' } }, 'transaction[id]'),
    null,
  );
});

Deno.test('timingSafeEqualHex ignora mayúsculas', () => {
  assertEquals(
    timingSafeEqualHex(
      '3476DDA50F64CD7CBD160689640506FEBEA93239BC524FC0469B2C68A3CC8BD0',
      '3476dda50f64cd7cbd160689640506febea93239bc524fc0469b2c68a3cc8bd0',
    ),
    true,
  );
  assertEquals(timingSafeEqualHex('aa', 'ab'), false);
});
