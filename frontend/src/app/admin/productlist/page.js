import AdminRoute from '@/components/AdminRoute';
import ProductListScreen from '@/screens/admin/ProductListScreen';

const AdminProductListPage = () => {
  return (
    <AdminRoute>
      <ProductListScreen />
    </AdminRoute>
  );
};

export default AdminProductListPage;
