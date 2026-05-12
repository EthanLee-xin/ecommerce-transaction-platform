'use client';

import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';

import Loader from '@/components/Loader';
import StripePaymentForm from '@/components/StripePaymentForm';

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#4f46e5',
    colorBackground: '#ffffff',
    colorText: '#0f172a',
    colorDanger: '#e11d48',
    fontFamily: 'Inter, system-ui, sans-serif',
    borderRadius: '12px',
  },
  rules: {
    '.Input': {
      border: '1px solid #cbd5e1',
      boxShadow: 'none',
    },
    '.Input:focus': {
      border: '1px solid #6366f1',
      boxShadow: '0 0 0 2px rgba(99, 102, 241, 0.15)',
    },
    '.Label': {
      color: '#334155',
      fontWeight: '500',
    },
  },
};

const StripePaymentPanel = ({ clientSecret, orderId, onPaid }) => {
  if (!clientSecret) {
    return <Loader />;
  }
  const options = {
    clientSecret,
    locale: 'en',
    appearance: {
      theme: 'stripe',
    },
  };

  return (
    <Elements
      stripe={stripePromise}
      options={options}
    >
      <StripePaymentForm orderId={orderId} onPaid={onPaid} />
    </Elements>
  );
};

export default StripePaymentPanel;
