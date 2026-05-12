"use client";

import { Provider } from "react-redux";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { ToastContainer } from "react-toastify";
import store from "@/store";

const Providers = ({ children }) => {
  return (
    <Provider store={store}>
      <PayPalScriptProvider deferLoading={true}>
        <ToastContainer
          position="top-right"
          autoClose={2600}
          hideProgressBar
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable={false}
          theme="light"
          closeButton={false}
        />
        {children}
      </PayPalScriptProvider>
    </Provider>
  );
};

export default Providers;
