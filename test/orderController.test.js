import { describe, expect, it } from 'vitest';
import {
  buildOrderCreationPayload,
  createPaymentPayload,
} from '../backend/controllers/orderControllerHelpers.js';

describe('orderController helpers', () => {
  it('builds order creation payload from snapshot and pricing', () => {
    const payload = buildOrderCreationPayload({
      orderItems: [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }],
      inventorySnapshot: [
        { _id: 'p1', price: 20, sku: 'SKU-1', inventoryId: 'inv-1' },
      ],
      userId: 'u1',
      shippingAddress: { city: 'Shanghai' },
      paymentMethod: 'PayPal',
    });

    expect(payload.user).toBe('u1');
    expect(payload.paymentMethod).toBe('PayPal');
    expect(payload.itemsPrice).toBe(40);
    expect(payload.totalPrice).toBe(42);
    expect(payload.orderItems[0].sku).toBe('SKU-1');
  });

  it('creates payment payload from paypal order', () => {
    const payload = createPaymentPayload({
      id: 'pp-1',
      status: 'COMPLETED',
      update_time: '2026-01-01T00:00:00Z',
      payer: { email_address: 'buyer@example.com' },
    });

    expect(payload).toEqual({
      id: 'pp-1',
      status: 'COMPLETED',
      update_time: '2026-01-01T00:00:00Z',
      email_address: 'buyer@example.com',
    });
  });
});
