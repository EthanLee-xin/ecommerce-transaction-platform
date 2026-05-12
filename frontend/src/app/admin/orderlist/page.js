import AdminRoute from '@/components/AdminRoute';
import OrderListScreen from '@/screens/admin/OrderListScreen';

const AdminOrderListPage = () => {
  return (
    <AdminRoute>
      <OrderListScreen />
    </AdminRoute>
  );
};

export default AdminOrderListPage;
