import AdminRoute from '@/components/AdminRoute';
import ProductListScreen from '@/screens/admin/ProductListScreen';

const AdminProductListPageNumberPage = async ({ params }) => {
  const { pageNumber } = await params;

  return (
    <AdminRoute>
      <ProductListScreen pageNumber={pageNumber} />
    </AdminRoute>
  );
};

export default AdminProductListPageNumberPage;
