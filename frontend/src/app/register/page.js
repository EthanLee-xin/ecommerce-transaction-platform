import { Suspense } from 'react';
import Loader from '@/components/Loader';
import RegisterScreen from '@/screens/RegisterScreen';

const RegisterPage = () => {
  return (
    <Suspense fallback={<Loader />}>
      <RegisterScreen />
    </Suspense>
  );
};

export default RegisterPage;