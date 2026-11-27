import assert from 'node:assert/strict';
import test from 'node:test';
import {
  checkoutChargePesos,
  paymentFieldsForTrigger,
  quoteStay,
} from '../src/lib/reservationPricing.ts';
import {
  eligiblePlanSuites,
  isPlanRoomType,
  isPlanStayPack,
  planDirectBookingFromFlag,
  referenceWeekdayPrice,
  type PricedSuite,
} from '../src/lib/planSuites.ts';

function suite(
  name: string,
  weekday4h: number,
  extra?: { hours: number; weekday: number },
): PricedSuite {
  const packs = [
    { hours: 4, order: 1, weekdayPrice: weekday4h, weekendPrice: weekday4h + 60000 },
    { hours: 12, order: 3, weekdayPrice: weekday4h + 100000, weekendPrice: weekday4h + 180000 },
  ];
  if (extra) {
    packs.push({
      hours: extra.hours,
      order: 2,
      weekdayPrice: extra.weekday,
      weekendPrice: extra.weekday,
    });
  }
  return { name, packs };
}

test('pago total, abono 50 % y WhatsApp replican el trigger con fee 0', () => {
  const quote = quoteStay(360000);
  assert.deepEqual(quote, {
    catalog: 360000,
    totalCharge: 288000,
    depositTotal: 324000,
    depositCharge: 162000,
  });

  assert.deepEqual(paymentFieldsForTrigger('wompi', 360000), {
    formaPago: 'Pago total',
    precio: '288000',
    abono: '288000',
  });
  assert.deepEqual(paymentFieldsForTrigger('wompi_abono', 360000), {
    formaPago: 'Abono 50%',
    precio: '324000',
    abono: '162000',
  });
  assert.deepEqual(paymentFieldsForTrigger('whatsapp', 360000), {
    formaPago: 'Sin pago / Continuar por WhatsApp',
    precio: '360000',
    abono: '0',
  });
  assert.equal(
    checkoutChargePesos(paymentFieldsForTrigger('wompi_abono', 360000)),
    '162000',
  );
  assert.equal(checkoutChargePesos(paymentFieldsForTrigger('wompi', 210000)), '168000');
});

test('el abono redondea como round(round(pack * 0.90) * 0.50)', () => {
  const quote = quoteStay(100001);
  assert.equal(quote.depositTotal, 90001);
  assert.equal(quote.depositCharge, 45001);
});

test('un plan de mismo precio ofrece todas las suites de ese nivel y marca las nombradas', () => {
  const catalog = [
    suite('Suite Gold', 240000),
    suite('Suite Amarte', 90000),
    suite('Suite Queen', 240000),
    suite('Suite Jacuzzi', 200000),
    suite('Suite Rubí', 240000),
    suite('Suite Gamer', 0, { hours: 6, weekday: 250000 }),
    suite('Suite Zafiro', 240000),
  ];

  const eligible = eligiblePlanSuites(catalog, {
    mode: 'same-price',
    recommendedSuites: ['Suite Gold', 'Suite Rubí', 'Suite Zafiro'],
  });

  assert.deepEqual(
    eligible.map((item) => [item.suite.name, item.recommended]),
    [
      ['Suite Gold', true],
      ['Suite Rubí', true],
      ['Suite Zafiro', true],
      ['Suite Queen', false],
    ],
  );
  assert.equal(referenceWeekdayPrice(catalog[5]), 250000);
});

test('un plan de una sola suite no abre el resto del mismo precio', () => {
  const catalog = [suite('Suite Amarte', 90000), suite('Suite Otra', 90000)];
  const eligible = eligiblePlanSuites(catalog, { mode: 'locked', suite: 'Suite Amarte' });
  assert.deepEqual(eligible.map((item) => item.suite.name), ['Suite Amarte']);
});

test('las duraciones de plan son 6 h, 12 h y día hotelero con tarifa', () => {
  assert.equal(isPlanStayPack({ hours: 6, weekdayPrice: 360000, weekendPrice: 420000 }), true);
  assert.equal(isPlanStayPack({ hours: 12, weekdayPrice: 0, weekendPrice: 540000 }), true);
  assert.equal(isPlanStayPack({ hours: 24, weekdayPrice: 540000, weekendPrice: 590000 }), true);
  assert.equal(isPlanStayPack({ hours: 4, weekdayPrice: 0, weekendPrice: 0 }), false);
  assert.equal(isPlanStayPack({ hours: 8, weekdayPrice: 0, weekendPrice: 0 }), false);
  assert.equal(isPlanRoomType('Plan Romántico'), true);
  assert.equal(isPlanRoomType('Suite Gold'), false);
});

test('el kill switch apaga la reserva directa de planes', () => {
  assert.equal(planDirectBookingFromFlag(undefined), true);
  assert.equal(planDirectBookingFromFlag(''), true);
  assert.equal(planDirectBookingFromFlag('true'), true);
  assert.equal(planDirectBookingFromFlag('false'), false);
  assert.equal(planDirectBookingFromFlag('off'), false);
});
