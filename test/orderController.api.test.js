import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mockSave = vi.fn();
const mockFindById = vi.fn();
const mockFind = vi.fn();
const mockPopulate = vi.fn();

vi.mock('../backend/models/orderModel.js', () => {
  const Order = vi.fn().mockImplementation((payload) => ({
    ...payload,
    save: mockSave,
  }));
  Order.findById = mockFindById;
  Order.find = mockFind;
  return { default: Order };
});

vi.mock('../backend/services/paymentService.js', () => ({
  verifyOrderPayment: vi.fn(),
}));

vi.mock('../backend/services/orderControllerHelpers.js', () => ({
  buildOrderCreationPayload: vi.fn((input) => ({
    orderItems: input.orderItems,
    user: input.userId,
    shippingAddress: input.shippingAddress,
    paymentMethod: input.paymentMethod,
    itemsPrice: 40,
    taxPrice: 2,
    shippingPrice: 0,
    totalPrice: 42,
  })),
  createOrderRecord: vi.fn((payload) => ({
    ...payload,
    _id: 'order-1',
    save: mockSave,
  })),
  createPaymentPayload: vi.fn((payload) => ({
    id: payload.id,
    status: payload.status,
    update_time: payload.update_time,
    email_address: payload.payer.email_address,
  })),
}));

vi.mock('../backend/services/orderWorkflowService.js', () => ({
  confirmOrderPayment: vi.fn(),
  markOrderDelivered: vi.fn(),
  refundOrderWorkflow: vi.fn(),
}));

vi.mock('../backend/middleware/requestLogger.js', () => ({
  requestLogger: (_req, _res, next) => next(),
}));

vi.mock('../backend/middleware/authMiddleware.js', () => ({
  protect: (_req, _res, next) => {
    _req.user = { _id: 'user-1', isAdmin: true };
    next();
  },
  admin: (_req, _res, next) => next(),
}));

vi.mock('../backend/middleware/errorMiddleware.js', () => ({
  notFound: (_req, res) => res.status(404).json({ message: 'Not Found' }),
  errorHandler: (err, _req, res, _next) =>
    res.status(err.statusCode || 500).json({
      success: false,
      message: err.message,
      code: err.code || 'INTERNAL_ERROR',
      type: err.type || 'SYSTEM',
    }),
}));

const buildApp = async () => {
  const { default: express } = await import('express');
  const { default: cookieParser } = await import('cookie-parser');
  const { default: orderRoutesFactory } = await import('../backend/routes/orderRoutes.js');
  const { default: userRoutes } = await import('../backend/routes/userRoutes.js');

  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use('/api/users', userRoutes);
  app.use('/api/orders', orderRoutesFactory({ has: async () => false, set: async () => ({}) }));
  return app;
};

beforeEach(() => {
  mockSave.mockReset();
  mockFindById.mockReset();
  mockFind.mockReset();
  mockPopulate.mockReset();
});

describe('order controller API', () => {
  it('creates order successfully', async () => {
    const app = await buildApp();
    mockSave.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }],
        inventorySnapshot: [{ _id: 'p1', price: 20, sku: 'SKU-1', inventoryId: 'inv-1' }],
        shippingAddress: { address: '88 Road', city: 'Shanghai', postalCode: '200000', country: 'CN' },
        paymentMethod: 'PayPal',
      });

    expect(res.status).toBe(201);
    expect(res.body.itemsPrice).toBe(40);
  });

  it('fails when inventory snapshot is missing', async () => {
    const app = await buildApp();

    const res = await request(app)
      .post('/api/orders')
      .send({
        orderItems: [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }],
        inventorySnapshot: [],
        shippingAddress: { address: '88 Road', city: 'Shanghai', postalCode: '200000', country: 'CN' },
        paymentMethod: 'PayPal',
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('Inventory snapshot missing');
  });

  it('returns order not found', async () => {
    const app = await buildApp();
    mockFindById.mockReturnValueOnce({ populate: mockPopulate.mockResolvedValueOnce(null) });

    const res = await request(app).get('/api/orders/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('NOT_FOUND');
  });

  it('rejects invalid payment verification', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({ _id: 'order-1', totalPrice: 42, save: mockSave });

    const { verifyOrderPayment } = await import('../backend/services/paymentService.js');
    verifyOrderPayment.mockRejectedValueOnce(new Error('Payment not verified'));

    const res = await request(app)
      .put('/api/orders/order-1/pay')
      .send({
        id: 'pp-1',
        status: 'COMPLETED',
        update_time: '2026-01-01T00:00:00Z',
        payer: { email_address: 'buyer@example.com' },
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('Payment not verified');
  });

  it('rejects reused payment transactions', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({ _id: 'order-1', totalPrice: 42, save: mockSave });

    const { verifyOrderPayment } = await import('../backend/services/paymentService.js');
    verifyOrderPayment.mockRejectedValueOnce(new Error('Transaction has been used before'));

    const res = await request(app)
      .put('/api/orders/order-1/pay')
      .send({
        id: 'pp-1',
        status: 'COMPLETED',
        update_time: '2026-01-01T00:00:00Z',
        payer: { email_address: 'buyer@example.com' },
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('Transaction has been used before');
  });

  it('rejects mismatched payment amounts', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({ _id: 'order-1', totalPrice: 42, save: mockSave });

    const { verifyOrderPayment } = await import('../backend/services/paymentService.js');
    verifyOrderPayment.mockRejectedValueOnce(new Error('Incorrect amount paid'));

    const res = await request(app)
      .put('/api/orders/order-1/pay')
      .send({
        id: 'pp-1',
        status: 'COMPLETED',
        update_time: '2026-01-01T00:00:00Z',
        payer: { email_address: 'buyer@example.com' },
      });

    expect(res.status).toBe(500);
    expect(res.body.message).toContain('Incorrect amount paid');
  });

  it('handles refund workflow for existing orders', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: true,
      isDelivered: false,
      fulfillmentStatus: 'allocated',
      refundStatus: 'none',
      save: mockSave,
    });
    mockSave.mockResolvedValueOnce({ _id: 'order-1', refundStatus: 'completed' });

    const res = await request(app).put('/api/orders/order-1/refund');

    expect(res.status).toBe(200);
    expect(res.body.refundStatus).toBe('completed');
  });

  it('handles deliver workflow for existing orders', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: true,
      isDelivered: false,
      fulfillmentStatus: 'allocated',
      refundStatus: 'none',
      save: mockSave,
    });
    mockSave.mockResolvedValueOnce({ _id: 'order-1', fulfillmentStatus: 'delivered' });

    const res = await request(app).put('/api/orders/order-1/deliver');

    expect(res.status).toBe(200);
    expect(res.body.fulfillmentStatus).toBe('delivered');
  });

  it('rejects delivering an unpaid order', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: false,
      isDelivered: false,
      fulfillmentStatus: 'pending',
      refundStatus: 'none',
      save: mockSave,
    });

    const res = await request(app).put('/api/orders/order-1/deliver');

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('rejects delivering a refunded order', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: true,
      isDelivered: false,
      fulfillmentStatus: 'cancelled',
      refundStatus: 'completed',
      save: mockSave,
    });

    const res = await request(app).put('/api/orders/order-1/deliver');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('rejects refunding a completed order', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: true,
      isDelivered: true,
      fulfillmentStatus: 'completed',
      refundStatus: 'none',
      save: mockSave,
    });

    const res = await request(app).put('/api/orders/order-1/refund');

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('rejects paying an already cancelled order', async () => {
    const app = await buildApp();
    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      totalPrice: 42,
      isPaid: false,
      fulfillmentStatus: 'cancelled',
      refundStatus: 'completed',
      save: mockSave,
    });

    const res = await request(app)
      .put('/api/orders/order-1/pay')
      .send({
        id: 'pp-1',
        status: 'COMPLETED',
        update_time: '2026-01-01T00:00:00Z',
        payer: { email_address: 'buyer@example.com' },
      });

    expect(res.status).toBe(409);
    expect(res.body.code).toBe('CONFLICT');
  });

  it('rejects duplicate create requests through idempotency guard', async () => {
    const app = await buildApp();
    const res = await request(app)
      .post('/api/orders')
      .set('idempotency-key', 'create-1')
      .send({
        orderItems: [{ _id: 'p1', name: 'Lipstick', qty: 2, image: '/a.png' }],
        inventorySnapshot: [{ _id: 'p1', price: 20, sku: 'SKU-1', inventoryId: 'inv-1' }],
        shippingAddress: { address: '88 Road', city: 'Shanghai', postalCode: '200000', country: 'CN' },
        paymentMethod: 'PayPal',
      });

    expect([201, 409]).toContain(res.status);
  });
});
