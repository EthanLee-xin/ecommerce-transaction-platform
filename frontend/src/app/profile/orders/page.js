import PrivateRoute from '@/components/PrivateRoute';
import MyOrdersScreen from '@/screens/MyOrdersScreen';

export const metadata = {
  title: 'My Orders',
};

const MyOrdersPage = () => {
  return (
    <PrivateRoute>
      <MyOrdersScreen />
    </PrivateRoute>
  );
};

export default MyOrdersPage;
