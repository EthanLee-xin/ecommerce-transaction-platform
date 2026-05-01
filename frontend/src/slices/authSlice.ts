import { createSlice } from '@reduxjs/toolkit';

type UserInfo = {
  name?: string;
  email?: string;
  isAdmin?: boolean;
  token?: string;
  [key: string]: unknown;
} | null;

type AuthState = {
  userInfo: UserInfo;
};

const initialState: AuthState = {
  userInfo: localStorage.getItem('userInfo')
    ? JSON.parse(localStorage.getItem('userInfo') as string)
    : null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem('userInfo', JSON.stringify(action.payload));
    },
    logout: (state) => {
      state.userInfo = null;
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
