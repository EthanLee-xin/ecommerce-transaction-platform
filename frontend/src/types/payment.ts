export type PaypalClientConfig = {
  clientId: string;
};

export type StripeConfig = {
  publishableKey: string;
  defaultProvider: string;
};

export type StripeIntent = {
  clientSecret: string;
  paymentIntentId: string;
};

export type PaymentMethod = 'PayPal' | 'Stripe';
