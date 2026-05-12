import { createSlice } from "@reduxjs/toolkit";

const getInitialAuthState = () => {
  if (typeof window === "undefined") {
    return {
      userInfo: null,
    };
  }

  const storedUserInfo = localStorage.getItem("userInfo");

  return {
    userInfo: storedUserInfo ? JSON.parse(storedUserInfo) : null,
  };
};

const initialState = getInitialAuthState();

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      state.userInfo = action.payload;
      localStorage.setItem("userInfo", JSON.stringify(action.payload));
    },

    logout: (state) => {
      state.userInfo = null;
      localStorage.clear();
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;

export default authSlice.reducer;
