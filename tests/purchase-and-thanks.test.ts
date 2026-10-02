import assert from 'node:assert/strict';
import test from 'node:test';
import { analyticsFromMartinaPayload } from '../src/lib/martinaAnalytics.ts';
import { locationFromWhatsappAnchor } from '../src/lib/whatsappLocation.ts';
import {
  claimPurchaseId,
  readSentPurchaseIds,
  rememberSentPurchaseId,
  shouldFirePurchase,
} from '../src/lib/purchaseTracking.ts';
import { isGraciasPath, parseThanksSearch, shouldRetryPurchaseStatus } from '../src/lib/thanksReturn.ts';
import {
  decideExpressPurchase,
  expressThanksUrl,
  publicSiteOrigin,
} from '../supabase/functions/_shared/wompi.ts';

const RESERVATION_ID = '11111111-1111-4111-8111-111111111111';

test('el Web Checkout vuelve a www /gracias con el id de la reserva', () => {
  assert.equal(publicSiteOrigin(''), 'https://www.amartesuite.com');
  assert.equal(publicSiteOrigin('http://localhost:3005'), 'https://www.amartesuite.com');
  assert.equal(
    expressThanksUrl('https://www.amartesuite.com', RESERVATION_ID),
    `https://www.amartesuite.com/gracias?rt=${RESERVATION_ID}`,
  );
});

test('/gracias lee rt e id aunque Wompi pegue la transacción al token', () => {
  assert.equal(isGraciasPath('/gracias'), true);
  assert.equal(isGraciasPath('/gracias/'), true);
  assert.equal(isGraciasPath('/'), false);
  const parsed = parseThanksSearch(`?rt=${RESERVATION_ID}&id=1234-1610641025-49201`);
  assert.deepEqual(parsed, {
    reservationId: RESERVATION_ID,
    wompiTransactionId: '1234-1610641025-49201',
  });
  const stuck = parseThanksSearch(`?rt=${RESERVATION_ID}%26id%3D1234-1610641025-49201`);
  assert.equal(stuck.reservationId, RESERVATION_ID);
  assert.equal(stuck.wompiTransactionId, '1234-1610641025-49201');
  assert.equal(shouldRetryPurchaseStatus('pending'), true);
  assert.equal(shouldRetryPurchaseStatus('declined'), false);
  assert.equal(shouldRetryPurchaseStatus('amount_mismatch'), false);
});

test('la compra solo se empuja una vez por transaction_id', () => {
  const memory = new Map<string, string>();
  const storage = {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
  };
  const id = '22222222-2222-4222-8222-222222222222';
  const first = shouldFirePurchase(
    { confirmed: true, transactionId: id, value: 180000, currency: 'COP' },
    readSentPurchaseIds(storage),
  );
  assert.equal(first.fire, true);
  assert.equal(first.value, 180000);
  assert.equal(claimPurchaseId(id), true);
  assert.equal(claimPurchaseId(id), false);
  rememberSentPurchaseId(storage, id);
  const second = shouldFirePurchase(
    { confirmed: true, transactionId: id, value: 180000, currency: 'COP' },
    readSentPurchaseIds(storage),
  );
  assert.equal(second.reason, 'duplicate');
  assert.equal(shouldFirePurchase(
    { confirmed: false, transactionId: id, value: 180000, currency: 'COP' },
    new Set(),
  ).reason, 'not-confirmed');
  assert.equal(shouldFirePurchase(
    { confirmed: true, transactionId: '33333333-3333-4333-8333-333333333333', value: 10, currency: 'USD' },
    new Set(),
  ).reason, 'currency');
});

test('no confirma una transacción de otra reserva ni un monto distinto', () => {
  const reservation = {
    id: RESERVATION_ID,
    precio: '80000',
    paymentStatus: null,
    paidAmount: null,
  };
  const tx = {
    id: '1234-1610641025-49201',
    status: 'APPROVED',
    amountInCents: 8_000_000,
    reference: RESERVATION_ID,
    currency: 'COP',
  };
  const approved = decideExpressPurchase(reservation, tx);
  assert.equal(approved.action, 'approve');
  if (approved.action === 'approve') {
    assert.equal(approved.value, 80000);
    assert.equal(approved.reservationTotal, 80000);
    assert.equal(approved.transactionId, RESERVATION_ID);
  }
  assert.equal(decideExpressPurchase(reservation, { ...tx, reference: 'otra-reserva' }).action, 'wait');
  assert.equal(decideExpressPurchase(reservation, { ...tx, status: 'DECLINED' }).action, 'mark_failure');
  assert.equal(decideExpressPurchase(
    { ...reservation, paymentStatus: 'approved', paidAmount: 80000 },
    null,
  ).action, 'return');
});

test('el enlace de WhatsApp declara su location y el widget cae en martina_widget', () => {
  assert.equal(locationFromWhatsappAnchor({
    getAttribute: (name) => (name === 'data-wa-location' ? 'contacto' : null),
    classList: { contains: () => false },
  }), 'contacto');
  assert.equal(locationFromWhatsappAnchor({
    getAttribute: () => null,
    classList: { contains: (token) => token === 'amarte-opt-link' },
  }), 'martina_widget');
  assert.equal(locationFromWhatsappAnchor({
    getAttribute: () => '  location_modal  ',
    classList: { contains: () => true },
  }), 'location_modal');
});

test('live_voice_whatsapp_clicked sigue siendo whatsapp_redirect y no un generate_lead', () => {
  assert.deepEqual(
    analyticsFromMartinaPayload({ event: 'live_voice_whatsapp_clicked' }),
    [{ kind: 'whatsapp_redirect' }],
  );
  assert.deepEqual(analyticsFromMartinaPayload({ event: 'live_voice_connected' }), []);
  assert.deepEqual(analyticsFromMartinaPayload(null), []);
});
