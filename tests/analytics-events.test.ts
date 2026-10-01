import assert from 'node:assert/strict';
import { after, before, describe, test } from 'node:test';
import {
  trackAddPaymentInfo,
  trackBeginCheckout,
  trackEvent,
  trackGenerateLeadPhone,
  trackGenerateLeadReserva,
  trackGenerateLeadWhatsapp,
  trackMartinaOpen,
  trackViewItemListSuites,
} from '../src/lib/analytics.ts';
import { parseExpressPurchaseStatusPayload } from '../src/lib/expressPurchaseStatus.ts';
import { eventsForLeadAnchor } from '../src/lib/leadClicks.ts';
import { analyticsFromMartinaPayload } from '../src/lib/martinaAnalytics.ts';
import { commitServerPurchase, PURCHASE_IDS_STORAGE_KEY } from '../src/lib/purchaseTracking.ts';
import { installMartinaAnalyticsBridge } from '../src/services/amarteChatbot.ts';
import { applyMeasuredLeadClick, resetLeadClickDedupeForTests } from '../src/lib/whatsappTracking.ts';
import { copFromWompiCheckoutUrl } from '../src/lib/wompiAmount.ts';
import { decideExpressPurchase } from '../supabase/functions/_shared/wompi.ts';

const RESERVATION_ID = '44444444-4444-4444-8444-444444444444';

function anchor(href: string, attrs: Record<string, string> = {}, className = ''): {
  getAttribute: (name: string) => string | null;
  classList: { contains: (token: string) => boolean };
} {
  return {
    getAttribute: (name) => {
      if (name === 'href') return href;
      return attrs[name] ?? null;
    },
    classList: { contains: (token) => className.split(/\s+/).includes(token) },
  };
}

describe('medición homepage', { concurrency: false }, () => {
  const dataLayer: Record<string, unknown>[] = [];
  let previousWindow: typeof globalThis.window;

  before(() => {
    previousWindow = globalThis.window;
    globalThis.window = { dataLayer } as Window & typeof globalThis;
    installMartinaAnalyticsBridge();
  });

  after(() => {
    if (previousWindow === undefined) {
      delete (globalThis as { window?: Window }).window;
    } else {
      globalThis.window = previousWindow;
    }
  });

  test('cada evento nuevo llega a dataLayer y los legacy siguen', () => {
    dataLayer.length = 0;

    trackGenerateLeadWhatsapp({
      location: 'contacto',
      linkUrl: 'https://wa.me/573007416683',
    });
    trackGenerateLeadPhone({ location: 'contacto', phoneNumber: '+57 300 741 6683' });
    trackGenerateLeadReserva({ transactionId: RESERVATION_ID, tipoPago: 'sin_pago' });
    trackMartinaOpen({ location: 'hero', interactionType: 'voice' });
    trackViewItemListSuites('www');
    trackBeginCheckout('reserva_express');
    trackAddPaymentInfo({
      transactionId: RESERVATION_ID,
      value: 144000,
      tipoPago: 'total_100',
    });
    trackEvent('whatsapp_redirect', { location: 'contacto' });
    trackEvent('pre_reserva_submit', {
      transaction_id: RESERVATION_ID,
      tipo_pago: 'total_100',
      currency: 'COP',
      value: 180000,
    });

    assert.deepEqual(dataLayer.map((entry) => entry.event), [
      'generate_lead',
      'generate_lead',
      'generate_lead',
      'martina_open',
      'view_item_list',
      'begin_checkout',
      'add_payment_info',
      'whatsapp_redirect',
      'pre_reserva_submit',
    ]);
    assert.deepEqual(dataLayer[0], {
      event: 'generate_lead',
      method: 'whatsapp',
      location: 'contacto',
      link_url: 'https://wa.me/573007416683',
    });
    assert.deepEqual(dataLayer[1], {
      event: 'generate_lead',
      method: 'phone',
      location: 'contacto',
      phone_number: '573007416683',
    });
    assert.deepEqual(dataLayer[2], {
      event: 'generate_lead',
      method: 'reserva',
      transaction_id: RESERVATION_ID,
      currency: 'COP',
      value: 0,
      tipo_pago: 'sin_pago',
    });
    assert.deepEqual(dataLayer[3], {
      event: 'martina_open',
      location: 'hero',
      interaction_type: 'voice',
    });
    assert.deepEqual(dataLayer[4], {
      event: 'view_item_list',
      item_list_name: 'suites',
      location: 'www',
    });
    assert.deepEqual(dataLayer[5], {
      event: 'begin_checkout',
      location: 'reserva_express',
      currency: 'COP',
      value: 0,
    });
    assert.deepEqual(dataLayer[6], {
      event: 'add_payment_info',
      transaction_id: RESERVATION_ID,
      currency: 'COP',
      value: 144000,
      tipo_pago: 'total_100',
      payment_type: 'wompi',
    });
    assert.equal(dataLayer[8].tipo_pago, 'total_100');
  });

  test('un wa.me empuja legacy y generate_lead; un tel: solo la llamada', () => {
    assert.deepEqual(
      eventsForLeadAnchor(anchor('https://wa.me/573007416683', { 'data-wa-location': 'contacto' })),
      [
        { event: 'whatsapp_redirect', location: 'contacto' },
        {
          event: 'generate_lead',
          method: 'whatsapp',
          location: 'contacto',
          link_url: 'https://wa.me/573007416683',
        },
      ],
    );
    assert.deepEqual(
      eventsForLeadAnchor(anchor('https://wa.me/573007416683', {}, 'amarte-opt-link')),
      [
        { event: 'whatsapp_redirect', location: 'martina_widget' },
        {
          event: 'generate_lead',
          method: 'whatsapp',
          location: 'martina_widget',
          link_url: 'https://wa.me/573007416683',
        },
      ],
    );
    assert.deepEqual(
      eventsForLeadAnchor(anchor('https://wa.me/573007416683?text=Nombre%3A%20Ana')),
      [
        { event: 'whatsapp_redirect', location: 'site' },
        {
          event: 'generate_lead',
          method: 'whatsapp',
          location: 'site',
          link_url: 'https://wa.me/573007416683',
        },
      ],
    );
    assert.deepEqual(
      eventsForLeadAnchor(anchor('tel:+573007416683', { 'data-tel-location': 'contacto' })),
      [{
        event: 'generate_lead',
        method: 'phone',
        location: 'contacto',
        phone_number: '573007416683',
      }],
    );
  });

  test('el puente reenvía los eventos del widget tal cual y no los duplica', () => {
    resetLeadClickDedupeForTests();
    dataLayer.length = 0;
    const track = globalThis.window.__amarteAnalyticsTrack;
    assert.equal(typeof track, 'function');
    if (!track) return;

    track({
      event: 'generate_lead',
      method: 'phone',
      location: 'martina_widget',
      phone_number: '573013307909',
    });
    track({
      event: 'generate_lead',
      method: 'whatsapp',
      location: 'martina_widget',
      link_url: 'https://wa.me/573013307909',
    });
    track({ event: 'martina_open', location: 'launcher', interaction_type: 'text' });
    track({ event: 'live_voice_whatsapp_clicked' });
    track({ event: 'purchase', transaction_id: RESERVATION_ID });

    assert.deepEqual(dataLayer, [
      {
        event: 'generate_lead',
        method: 'phone',
        location: 'martina_widget',
        phone_number: '573013307909',
      },
      {
        event: 'generate_lead',
        method: 'whatsapp',
        location: 'martina_widget',
        link_url: 'https://wa.me/573013307909',
      },
      { event: 'whatsapp_redirect', location: 'martina_widget' },
      {
        event: 'martina_open',
        location: 'launcher',
        interaction_type: 'text',
      },
    ]);

    track({
      event: 'generate_lead',
      method: 'phone',
      location: 'martina_widget',
      phone_number: '573013307909',
    });
    track({ event: 'live_voice_whatsapp_clicked' });
    assert.equal(dataLayer.length, 4);

    resetLeadClickDedupeForTests();
    dataLayer.length = 0;
    const native: { __amarteMeasuredEvent?: string } = {};
    applyMeasuredLeadClick(
      anchor('https://api.whatsapp.com/send?phone=573013307909', {}, 'amarte-opt-link'),
      native,
    );
    assert.equal(native.__amarteMeasuredEvent, 'generate_lead');
    assert.deepEqual(dataLayer, [
      { event: 'whatsapp_redirect', location: 'martina_widget' },
      {
        event: 'generate_lead',
        method: 'whatsapp',
        location: 'martina_widget',
        link_url: 'https://api.whatsapp.com/send?phone=573013307909',
      },
    ]);
    track({
      event: 'generate_lead',
      method: 'whatsapp',
      location: 'martina_widget',
      link_url: 'https://api.whatsapp.com/send?phone=573013307909',
    });
    track({ event: 'live_voice_whatsapp_clicked' });
    assert.equal(dataLayer.length, 2);
  });

  test('add_payment_info usa el monto firmado en la URL de Wompi', () => {
    const url = 'https://checkout.wompi.co/p/?amount-in-cents=14400000&currency=COP&reference=abc';
    assert.equal(copFromWompiCheckoutUrl(url), 144000);
    assert.equal(copFromWompiCheckoutUrl('https://example.com/?amount-in-cents=14400000'), null);
    dataLayer.length = 0;
    const amount = copFromWompiCheckoutUrl(url);
    assert.ok(amount);
    trackAddPaymentInfo({
      transactionId: RESERVATION_ID,
      value: amount,
      tipoPago: 'total_100',
    });
    assert.equal(dataLayer[0].value, 144000);
    assert.equal(dataLayer[0].tipo_pago, 'total_100');
  });

  test('purchase sale una vez al recargar y no sale si el servidor no confirma', () => {
    const memory = new Map<string, string>();
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
    };
    const confirmed = {
      confirmed: true,
      transactionId: '55555555-5555-4555-8555-555555555555',
      value: 144000,
      currency: 'COP',
      reservationTotal: 180000,
      tipoPago: 'total_100',
    };

    dataLayer.length = 0;
    assert.equal(commitServerPurchase(confirmed, storage), true);
    assert.equal(commitServerPurchase(confirmed, storage), false);
    assert.equal(dataLayer.filter((entry) => entry.event === 'purchase').length, 1);
    assert.deepEqual(dataLayer.find((entry) => entry.event === 'purchase'), {
      event: 'purchase',
      transaction_id: confirmed.transactionId,
      value: 144000,
      currency: 'COP',
      tipo_pago: 'total_100',
      reservation_total: 180000,
    });
    assert.ok(memory.get(PURCHASE_IDS_STORAGE_KEY)?.includes(confirmed.transactionId));

    const before = dataLayer.length;
    assert.equal(commitServerPurchase({
      ...confirmed,
      transactionId: '66666666-6666-4666-8666-666666666666',
      confirmed: false,
    }, storage), false);
    assert.equal(dataLayer.length, before);

    const pending = parseExpressPurchaseStatusPayload({
      ok: true,
      confirmed: false,
      payment_status: 'pending',
    });
    assert.equal(pending.confirmed, false);
    assert.equal(commitServerPurchase({
      confirmed: pending.confirmed,
      transactionId: '77777777-7777-4777-8777-777777777777',
      value: 144000,
      currency: 'COP',
    }, storage), false);

    const fromServer = parseExpressPurchaseStatusPayload({
      ok: true,
      confirmed: true,
      value: 144000,
      currency: 'COP',
      transaction_id: '88888888-8888-4888-8888-888888888888',
      tipo_pago: 'total_100',
      reservation_total: 180000,
    });
    assert.equal(fromServer.confirmed, true);
    if (!fromServer.confirmed) return;
    dataLayer.length = 0;
    assert.equal(commitServerPurchase({
      confirmed: true,
      transactionId: fromServer.transactionId,
      value: fromServer.value,
      currency: fromServer.currency,
      reservationTotal: fromServer.reservationTotal,
      tipoPago: fromServer.tipoPago,
    }, storage), true);
    assert.equal(dataLayer[0].reservation_total, 180000);
    assert.equal(dataLayer[0].value, 144000);
    assert.equal(dataLayer[0].tipo_pago, 'total_100');
  });

  test('sin reservation_total el abono no se inventa; el pago total usa el monto cobrado', () => {
    const storage = {
      getItem: () => '[]',
      setItem: () => undefined,
    };
    dataLayer.length = 0;
    assert.equal(commitServerPurchase({
      confirmed: true,
      transactionId: '99999999-9999-4999-8999-999999999999',
      value: 90000,
      currency: 'COP',
      tipoPago: 'abono_50',
    }, storage), false);
    assert.equal(dataLayer.length, 0);

    assert.equal(commitServerPurchase({
      confirmed: true,
      transactionId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      value: 144000,
      currency: 'COP',
      tipoPago: 'total_100',
    }, storage), true);
    assert.equal(dataLayer[0].reservation_total, 144000);
    assert.equal(dataLayer[0].value, 144000);
  });

  test('el total de la reserva viaja aparte del monto cobrado', () => {
    const verdict = decideExpressPurchase(
      {
        id: RESERVATION_ID,
        precio: '180000',
        paymentStatus: 'approved',
        paidAmount: 144000,
      },
      null,
    );
    assert.equal(verdict.action, 'return');
    if (verdict.action !== 'return') return;
    assert.equal(verdict.value, 144000);
    assert.equal(verdict.reservationTotal, 180000);
    assert.equal(verdict.transactionId, RESERVATION_ID);
  });

  test('analyticsFromMartinaPayload reenvía generate_lead y martina_open y conserva el legacy', () => {
    assert.deepEqual(analyticsFromMartinaPayload({ event: 'purchase', transaction_id: RESERVATION_ID }), []);
    assert.deepEqual(
      analyticsFromMartinaPayload({
        event: 'martina_open',
        location: 'launcher',
        interaction_type: 'text',
      }),
      [{
        kind: 'forward',
        payload: {
          event: 'martina_open',
          location: 'launcher',
          interaction_type: 'text',
        },
      }],
    );
    assert.deepEqual(
      analyticsFromMartinaPayload({
        event: 'generate_lead',
        method: 'phone',
        location: 'martina_widget',
        phone_number: '573013307909',
      }),
      [{
        kind: 'forward',
        payload: {
          event: 'generate_lead',
          method: 'phone',
          location: 'martina_widget',
          phone_number: '573013307909',
        },
      }],
    );
  });
});
