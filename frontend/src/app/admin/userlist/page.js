import AdminRoute from '@/components/AdminRoute';
import UserListScreen from '@/screens/admin/UserListScreen';

const AdminUserListPage = () => {
  return (
    <AdminRoute>
      <UserListScreen />
    </AdminRoute>
  );
};

export default AdminUserListPage;
