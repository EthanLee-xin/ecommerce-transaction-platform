import PrivateRoute from '@/components/PrivateRoute';
import CheckoutSteps from '@/components/CheckoutSteps';
import PlaceOrderScreen from '@/screens/PlaceOrderScreen';

const PlaceOrderPage = () => {
  return (
    <PrivateRoute>
      <div className='space-y-8'>
        <CheckoutSteps step1 step2 step3 step4 />
        <PlaceOrderScreen />
      </div>
    </PrivateRoute>
  );
};

export default PlaceOrderPage;
