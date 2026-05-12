import AdminRoute from '@/components/AdminRoute';
import UserEditScreen from '@/screens/admin/UserEditScreen';

const AdminUserEditPage = async ({ params }) => {
  const { id } = await params;

  return (
    <AdminRoute>
      <UserEditScreen userId={id} />
    </AdminRoute>
  );
};

export default AdminUserEditPage;
