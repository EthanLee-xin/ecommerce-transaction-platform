import { describe, expect, it, vi, beforeEach } from 'vitest';
import request from 'supertest';

const mockSave = vi.fn();
const mockFindById = vi.fn();
const mockFindOne = vi.fn();

vi.mock('../backend/models/orderModel.js', () => ({
  default: {
    findById: mockFindById,
    findOne: mockFindOne,
  },
}));

vi.mock('../backend/services/stripeService.js', () => ({
  createPaymentIntent: vi.fn(),
  verifyStripeWebhook: vi.fn(),
}));

vi.mock('../backend/utils/logger.js', () => ({
  logOrderStateChange: vi.fn(),
}));

const buildApp = async () => {
  const { default: express } = await import('express');
  const { default: stripeRoutes } = await import('../backend/routes/stripeRoutes.js');
  const { errorHandler } = await import('../backend/middleware/errorMiddleware.js');
  const app = express();
  app.use('/api/stripe', stripeRoutes);
  app.use(errorHandler);
  return app;
};

beforeEach(() => {
  mockSave.mockReset();
  mockFindById.mockReset();
  mockFindOne.mockReset();
});

describe('stripe webhook', () => {
  it('marks order as paid for succeeded payment intent events', async () => {
    const app = await buildApp();
    const { verifyStripeWebhook } = await import('../backend/services/stripeService.js');

    verifyStripeWebhook.mockReturnValueOnce({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          status: 'succeeded',
          metadata: { orderId: 'order-1' },
          receipt_email: 'buyer@example.com',
        },
      },
    });

    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: false,
      paymentProvider: 'stripe',
      paymentIntentId: 'pi_123',
      stripeEventIds: [],
      save: mockSave,
    });
    mockSave.mockResolvedValueOnce(undefined);

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'sig_123')
      .send('test-payload');

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);
  });

  it('ignores duplicate webhook events', async () => {
    const app = await buildApp();
    const { verifyStripeWebhook } = await import('../backend/services/stripeService.js');

    verifyStripeWebhook.mockReturnValueOnce({
      id: 'evt_1',
      type: 'payment_intent.succeeded',
      data: {
        object: {
          id: 'pi_123',
          status: 'succeeded',
          metadata: { orderId: 'order-1' },
        },
      },
    });

    mockFindById.mockResolvedValueOnce({
      _id: 'order-1',
      isPaid: true,
      paymentProvider: 'stripe',
      paymentIntentId: 'pi_123',
      stripeEventIds: ['evt_1'],
      save: mockSave,
    });

    const res = await request(app)
      .post('/api/stripe/webhook')
      .set('stripe-signature', 'sig_123')
      .send('test-payload');

    expect(res.status).toBe(200);
    expect(res.body.duplicate).toBe(true);
  });

  it('returns an internal error when signature is missing', async () => {
    const app = await buildApp();
    const res = await request(app).post('/api/stripe/webhook').send('test-payload');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({});
  });
});
