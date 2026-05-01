import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildOrderItemsFromSnapshot } from '../backend/services/orderPricingService.js';
import { createOrderDraft } from '../backend/services/orderFactoryService.js';
import {
  appendStatusHistory,
  setInventoryStatus,
  setFulfillmentStatus,
  setRefundStatus,
} from '../backend/services/orderStatusService.js';
import {
  buildInventorySnapshot,
  reserveInventory,
  deductInventory,
  restoreInventory,
} from '../backend/services/inventoryService.js';
import {
  startRefund,
  approveRefund,
  rejectRefund,
  processRefund,
} from '../backend/services/refundService.js';
import {
  buildPayPalPaymentResult,
  verifyOrderPayment,
} from '../backend/services/paymentService.js';
import {
  initializeOrderWorkflow,
  confirmOrderPayment,
  markOrderDelivered,
  refundOrderWorkflow,
} from '../backend/services/orderWorkflowService.js';

describe('order workflow service', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('builds order items from trusted inventory snapshot', () => {
    const orderItems = [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }];
    const inventorySnapshot = [
      { _id: 'p1', price: 20, sku: 'SKU-1', inventoryId: 'inv-1' },
    ];

    const result = buildOrderItemsFromSnapshot(orderItems, inventorySnapshot);

    expect(result).toEqual([
      {
        _id: undefined,
        name: 'Lipstick',
        qty: 2,
        image: '/a.png',
        product: 'p1',
        price: 20,
        sku: 'SKU-1',
        inventoryId: 'inv-1',
      },
    ]);
  });

  it('throws when inventory snapshot is missing', () => {
    const orderItems = [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }];

    expect(() => buildOrderItemsFromSnapshot(orderItems, [])).toThrow(
      'Inventory snapshot missing'
    );
  });

  it('creates an order draft with transaction defaults', () => {
    const draft = createOrderDraft({
      orderItems: [],
      userId: 'u1',
      shippingAddress: { city: 'Shanghai' },
      paymentMethod: 'PayPal',
      prices: { itemsPrice: 10, taxPrice: 1, shippingPrice: 0, totalPrice: 11 },
    });

    expect(draft.user).toBe('u1');
    expect(draft.paymentMethod).toBe('PayPal');
    expect(draft.fulfillmentStatus).toBe('pending');
    expect(draft.inventoryStatus).toBe('unreserved');
    expect(draft.refundStatus).toBe('none');
    expect(draft.statusHistory).toEqual([]);
  });

  it('writes order state history and status transitions', () => {
    const order = { statusHistory: [] };

    appendStatusHistory(order, 'order:created', 'Order created');
    setInventoryStatus(order, 'reserved', 'Inventory reserved');
    setFulfillmentStatus(order, 'allocated', 'Allocated');
    setRefundStatus(order, 'requested', 'Refund requested');

    expect(order.statusHistory).toHaveLength(4);
    expect(order.inventoryStatus).toBe('reserved');
    expect(order.fulfillmentStatus).toBe('allocated');
    expect(order.refundStatus).toBe('requested');
  });

  it('builds inventory snapshot and mutates inventory states', async () => {
    const snapshot = buildInventorySnapshot([
      { inventoryId: 'inv-1', sku: 'SKU-1', qty: 2, price: 20 },
    ]);

    const order = {
      orderItems: [{ inventoryId: 'inv-1', sku: 'SKU-1', qty: 2, price: 20 }],
    };

    await reserveInventory(order);
    await deductInventory(order);
    await restoreInventory(order);

    expect(snapshot).toEqual([
      { inventoryId: 'inv-1', sku: 'SKU-1', qty: 2, price: 20 },
    ]);
    expect(order.inventoryStatus).toBe('restored');
    expect(order.inventorySnapshot).toBeDefined();
    expect(order.inventoryCommittedAt).toBeDefined();
    expect(order.inventoryRestoredAt).toBeDefined();
  });

  it('processes refund workflow and clears payment metadata', async () => {
    const order = {
      _id: 'order-1',
      statusHistory: [],
      isPaid: true,
      paidAt: new Date(),
      paymentResult: { id: 'pp-1' },
    };

    startRefund(order);
    approveRefund(order);
    await processRefund(order);
    await refundOrderWorkflow(order);
    rejectRefund(order, 'Rejected for test coverage');

    expect(order.isPaid).toBe(false);
    expect(order.refundStatus).toBe('rejected');
    expect(order.fulfillmentStatus).toBe('cancelled');
    expect(order.paymentResult).toBeUndefined();
    expect(order.statusHistory.length).toBeGreaterThanOrEqual(4);
  });

  it('verifies payment payload and payment flow with injected dependencies', async () => {
    const paymentResult = buildPayPalPaymentResult({
      id: 'pp-1',
      status: 'COMPLETED',
      update_time: '2026-01-01T00:00:00Z',
      payer: { email_address: 'buyer@example.com' },
    });

    expect(paymentResult).toEqual({
      id: 'pp-1',
      status: 'COMPLETED',
      update_time: '2026-01-01T00:00:00Z',
      email_address: 'buyer@example.com',
    });

    const result = await verifyOrderPayment(
      {
        async find() {
          return [];
        },
      },
      100,
      'pp-1',
      {
        verifyPayPalPayment: async () => ({ verified: true, value: '100' }),
        checkIfNewTransaction: async () => true,
      }
    );

    expect(result).toBe(true);
  });

  it('rejects payment verification failure', async () => {
    await expect(
      verifyOrderPayment(
        { _id: 'order-1' },
        100,
        'pp-1',
        {
          verifyPayPalPayment: async () => ({ verified: false, value: '100' }),
          checkIfNewTransaction: async () => true,
        }
      )
    ).rejects.toThrow('Payment not verified');
  });

  it('rejects reused payment transactions', async () => {
    await expect(
      verifyOrderPayment(
        { _id: 'order-1' },
        100,
        'pp-1',
        {
          verifyPayPalPayment: async () => ({ verified: true, value: '100' }),
          checkIfNewTransaction: async () => false,
        }
      )
    ).rejects.toThrow('Transaction has been used before');
  });

  it('rejects mismatched payment amounts', async () => {
    await expect(
      verifyOrderPayment(
        { _id: 'order-1' },
        100,
        'pp-1',
        {
          verifyPayPalPayment: async () => ({ verified: true, value: '88' }),
          checkIfNewTransaction: async () => true,
        }
      )
    ).rejects.toThrow('Incorrect amount paid');
  });

  it('initializes and confirms order workflow', async () => {
    const order = { _id: 'order-1', statusHistory: [] };

    await initializeOrderWorkflow(order);
    await confirmOrderPayment(order, {
      id: 'pp-1',
      status: 'COMPLETED',
      update_time: '2026-01-01T00:00:00Z',
      email_address: 'buyer@example.com',
    });
    await markOrderDelivered(order);

    expect(order.isPaid).toBe(true);
    expect(order.fulfillmentStatus).toBe('delivered');
    expect(order.paidAt).toBeDefined();
    expect(order.deliveredAt).toBeDefined();
    expect(order.statusHistory.some((entry) => entry.status === 'payment:confirmed')).toBe(true);
  });

  it('keeps refund workflow idempotent in structure', async () => {
    const order = { _id: 'order-1', statusHistory: [] };

    await refundOrderWorkflow(order);
    await refundOrderWorkflow(order);

    expect(order.refundStatus).toBe('completed');
    expect(order.fulfillmentStatus).toBe('cancelled');
  });
});
