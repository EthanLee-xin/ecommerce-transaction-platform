import { Suspense } from 'react';
import Loader from '@/components/Loader';
import LoginScreen from '@/screens/LoginScreen';

const LoginPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <LoginScreen />
    </Suspense>
  );
};

export default LoginPage;