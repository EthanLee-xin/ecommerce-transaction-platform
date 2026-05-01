import Stripe from 'stripe';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

const stripeClient = stripeSecretKey
  ? new Stripe(stripeSecretKey, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null;

const createPaymentIntent = async (params: {
  amount: number;
  currency?: string;
  orderId: string;
  userId: string;
}) => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }

  return stripeClient.paymentIntents.create({
    amount: Math.round(params.amount * 100),
    currency: params.currency || 'usd',
    metadata: {
      orderId: params.orderId,
      userId: params.userId,
    },
    automatic_payment_methods: {
      enabled: true,
    },
  });
};

const verifyStripeWebhook = (payload: string | Buffer, signature: string) => {
  if (!stripeClient) {
    throw new Error('Stripe is not configured');
  }
  if (!stripeWebhookSecret) {
    throw new Error('Stripe webhook secret is not configured');
  }

  return stripeClient.webhooks.constructEvent(payload, signature, stripeWebhookSecret);
};

export { stripeClient, createPaymentIntent, verifyStripeWebhook };
