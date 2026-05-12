import PrivateRoute from '@/components/PrivateRoute';
import ProfileScreen from '@/screens/ProfileScreen';

const ProfilePage = () => {
  return (
    <PrivateRoute>
      <ProfileScreen />
    </PrivateRoute>
  );
};

export default ProfilePage;
