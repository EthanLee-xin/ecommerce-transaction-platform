import { fetchBaseQuery, createApi } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "@/constants";
import { logout } from "@/slices/authSlice";

const baseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
});

const baseQueryWithAuth = async (args, api, extraOptions) => {
  const result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    api.dispatch(logout());
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithAuth,
  tagTypes: ["Product", "Products", "Order", "User"],
  endpoints: () => ({}),
});
