import PrivateRoute from '@/components/PrivateRoute';
import CheckoutSteps from '@/components/CheckoutSteps';
import PaymentScreen from '@/screens/PaymentScreen';

const PaymentPage = () => {
  return (
    <PrivateRoute>
      <div className='space-y-8'>
        <CheckoutSteps step1 step2 step3 />
        <PaymentScreen />
      </div>
    </PrivateRoute>
  );
};

export default PaymentPage;