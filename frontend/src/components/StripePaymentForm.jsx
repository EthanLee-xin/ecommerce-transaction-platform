'use client';

import { useState } from 'react';
import notify from '@/utils/notify';
import {
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js';

const StripePaymentForm = ({ orderId, onPaid }) => {
  const stripe = useStripe();
  const elements = useElements();

  const [isProcessing, setIsProcessing] = useState(false);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const result = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order/${orderId}?stripe_return=true`,
      },
      redirect: 'if_required',
    });

    if (result.error) {
      notify.error(result.error.message);
      setIsProcessing(false);
      return;
    }

    if (result.paymentIntent?.status === 'succeeded') {
      await onPaid(result.paymentIntent);
      notify.success('Order is paid');
    }

    setIsProcessing(false);
  };

  return (
    <form onSubmit={submitHandler} className='space-y-4'>
      <div className='rounded-2xl border border-slate-200 bg-white p-4'>
        <PaymentElement />
      </div>

      <button
        type='submit'
        disabled={!stripe || !elements || isProcessing}
        className='ui-button ui-button-primary w-full'
      >
        {isProcessing ? 'Processing...' : 'Pay by Card'}
      </button>
    </form>
  );
};

export default StripePaymentForm;
