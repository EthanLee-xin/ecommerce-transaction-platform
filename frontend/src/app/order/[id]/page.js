import PrivateRoute from '@/components/PrivateRoute';
import OrderScreen from '@/screens/OrderScreen';

const OrderPage = async ({ params }) => {
  const { id } = await params;

  return (
    <PrivateRoute>
      <OrderScreen orderId={id} />
    </PrivateRoute>
  );
};

export default OrderPage;