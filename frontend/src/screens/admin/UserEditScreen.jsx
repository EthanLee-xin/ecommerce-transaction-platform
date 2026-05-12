'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import notify from '@/utils/notify';

import Message from '@/components/Message';
import Loader from '@/components/Loader';
import FormContainer from '@/components/FormContainer';
import {
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from '@/slices/usersApiSlice';

const UserEditScreen = ({ userId }) => {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  const {
    data: user,
    isLoading,
    error,
    refetch,
  } = useGetUserDetailsQuery(userId);

  const [updateUser, { isLoading: loadingUpdate }] = useUpdateUserMutation();

  useEffect(() => {
    if (user) {
      const id = window.requestAnimationFrame(() => {
        setName(user.name);
        setEmail(user.email);
        setIsAdmin(user.isAdmin);
      });

      return () => window.cancelAnimationFrame(id);
    }
  }, [user]);

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      await updateUser({
        userId,
        name,
        email,
        isAdmin,
      }).unwrap();

      notify.success('User updated successfully');
      refetch();
      router.push('/admin/userlist');
    } catch (err) {
      notify.error(err?.data?.message || err.error);
    }
  };

  return (
    <>
      <Link href='/admin/userlist' className='ui-button ui-button-secondary mb-6'>
        Go Back
      </Link>

      <FormContainer>
        <p className='admin-eyebrow'>Admin</p>
        <h1 className='mt-1 text-2xl font-bold tracking-tight text-slate-950'>
          Edit User
        </h1>

        {loadingUpdate && <Loader />}

        {isLoading ? (
          <Loader />
        ) : error ? (
          <Message variant='danger'>{error?.data?.message || error.error}</Message>
        ) : (
          <form onSubmit={submitHandler} className='admin-form mt-6'>
            <div>
              <label htmlFor='name' className='ui-label'>Name</label>
              <input id='name' type='text' value={name} onChange={(e) => setName(e.target.value)} className='ui-input' />
            </div>

            <div>
              <label htmlFor='email' className='ui-label'>Email Address</label>
              <input id='email' type='email' value={email} onChange={(e) => setEmail(e.target.value)} className='ui-input' />
            </div>

            <label className='flex items-center gap-3 rounded-xl border border-slate-200 p-4'>
              <input
                type='checkbox'
                checked={isAdmin}
                onChange={(e) => setIsAdmin(e.target.checked)}
                className='h-4 w-4 accent-slate-950'
              />
              <span className='font-medium text-slate-950'>Is Admin</span>
            </label>

            <button type='submit' className='ui-button ui-button-primary w-full'>
              Update
            </button>
          </form>
        )}
      </FormContainer>
    </>
  );
};

export default UserEditScreen;
