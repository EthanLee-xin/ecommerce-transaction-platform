import AdminRoute from '@/components/AdminRoute';
import ProductEditScreen from '@/screens/admin/ProductEditScreen';

const AdminProductEditPage = async ({ params }) => {
  const { id } = await params;

  return (
    <AdminRoute>
      <ProductEditScreen productId={id} />
    </AdminRoute>
  );
};

export default AdminProductEditPage;
