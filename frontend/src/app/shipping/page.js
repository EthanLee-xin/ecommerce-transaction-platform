import PrivateRoute from '@/components/PrivateRoute';
import ShippingScreen from '@/screens/ShippingScreen';
import CheckoutSteps from '@/components/CheckoutSteps';

const ShippingPage = () => {
  return (
    <PrivateRoute>
      <div className='space-y-8'>
        <CheckoutSteps step1 step2 />
        <ShippingScreen />
      </div>
    </PrivateRoute>
  );
};

export default ShippingPage;