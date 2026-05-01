export type PaymentProvider = 'paypal' | 'stripe';

export type PaymentMethod = 'PayPal' | 'Stripe';

export type PaymentResultDto = {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
};

export type PaypalClientConfigDto = {
  clientId: string;
};

export type StripeConfigDto = {
  publishableKey: string;
  defaultProvider: PaymentProvider;
};

export type StripeIntentDto = {
  clientSecret: string;
  paymentIntentId: string;
};
