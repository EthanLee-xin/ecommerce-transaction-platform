'use client';

import Link from 'next/link';
import { FaTrash, FaEdit, FaCheck, FaTimes } from 'react-icons/fa';
import notify from '@/utils/notify';

import Message from '@/components/Message';
import Loader from '@/components/Loader';
import {
  useDeleteUserMutation,
  useGetUsersQuery,
} from '@/slices/usersApiSlice';

const UserListScreen = () => {
  const { data: users, refetch, isLoading, error } = useGetUsersQuery();

  const [deleteUser, { isLoading: loadingDelete }] = useDeleteUserMutation();

  const deleteHandler = async (id) => {
    if (window.confirm('Are you sure')) {
      try {
        await deleteUser(id).unwrap();
        refetch();
        notify.success('User deleted');
      } catch (err) {
        notify.error(err?.data?.message || err.error);
      }
    }
  };

  return (
    <>
      <div className='admin-page-header'>
        <div>
          <p className='admin-eyebrow'>Admin</p>
          <h1 className='admin-title'>Users</h1>
        </div>
      </div>

      {loadingDelete && <Loader />}

      {isLoading ? (
        <Loader />
      ) : error ? (
        <Message variant='danger'>{error?.data?.message || error.error}</Message>
      ) : (
        <div className='admin-table-wrap'>
          <table className='admin-table'>
            <thead>
              <tr>
                <th className='admin-th'>ID</th>
                <th className='admin-th'>Name</th>
                <th className='admin-th'>Email</th>
                <th className='admin-th'>Admin</th>
                <th className='admin-th'></th>
              </tr>
            </thead>

            <tbody className='divide-y divide-slate-100'>
              {users.map((user) => (
                <tr key={user._id}>
                  <td className='admin-td font-mono text-xs'>{user._id}</td>
                  <td className='admin-td font-medium text-slate-950'>{user.name}</td>
                  <td className='admin-td'>
                    <a href={`mailto:${user.email}`} className='hover:text-emerald-700'>
                      {user.email}
                    </a>
                  </td>
                  <td className='admin-td'>
                    {user.isAdmin ? (
                      <FaCheck className='text-emerald-600' />
                    ) : (
                      <FaTimes className='text-red-500' />
                    )}
                  </td>
                  <td className='admin-td'>
                    <div className='admin-action-row'>
                      {!user.isAdmin && (
                        <>
                          <Link href={`/admin/user/${user._id}/edit`} className='icon-button'>
                            <FaEdit />
                          </Link>

                          <button
                            type='button'
                            className='icon-button icon-button-danger'
                            onClick={() => deleteHandler(user._id)}
                          >
                            <FaTrash />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default UserListScreen;
