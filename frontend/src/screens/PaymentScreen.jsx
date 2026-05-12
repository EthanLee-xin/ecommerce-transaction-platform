'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';

import FormContainer from '@/components/FormContainer';
import { savePaymentMethod } from '@/slices/cartSlice';

const PaymentScreen = () => {
  const router = useRouter();
  const dispatch = useDispatch();

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const { shippingAddress } = useSelector((state) => state.cart);

  useEffect(() => {
    if (!shippingAddress.address) {
      router.replace('/shipping');
    }
  }, [router, shippingAddress]);

  const submitHandler = (e) => {
    e.preventDefault();

    dispatch(savePaymentMethod(paymentMethod));
    router.push('/placeorder');
  };

  return (
    <FormContainer>
      <div>
        <p className='text-sm font-semibold uppercase tracking-wide text-indigo-600'>
          Checkout
        </p>
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-950'>
          Payment Method
        </h1>
      </div>

      <form onSubmit={submitHandler} className='mt-6 space-y-5'>
        <fieldset>
         <legend className='ui-label'>Select Method</legend>

         <label className='mt-3 flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 hover:border-slate-300'>
            <input
              type='radio'
              name='paymentMethod'
              value='PayPal'
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className='h-4 w-4 accent-slate-950'
            />

            <span className='font-medium text-slate-950'>
              PayPal or Credit Card
            </span>
         </label>
        </fieldset>
        
        <button type='submit' className='ui-button ui-button-primary w-full'>
          Continue
        </button>
      </form>
    </FormContainer>
  );
};

export default PaymentScreen;
