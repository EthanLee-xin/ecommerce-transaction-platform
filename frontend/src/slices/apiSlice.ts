import { fetchBaseQuery, createApi } from '@reduxjs/toolkit/query/react';
import type { BaseQueryApi, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { BASE_URL } from '../config';
import { logout } from './authSlice';

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

type BaseQueryArg = string | FetchArgs;

const baseQueryWithAuth = async (
  args: BaseQueryArg,
  api: BaseQueryApi,
  extra: Parameters<typeof baseQuery>[2]
) => {
  const result = await baseQuery(args, api, extra);
  const error = result.error as FetchBaseQueryError | undefined;

  if (error && error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  baseQuery: baseQueryWithAuth,
  tagTypes: ['Product', 'Order', 'User'],
  endpoints: (builder) => ({}),
});
