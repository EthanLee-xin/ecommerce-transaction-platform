import { apiSlice } from "@/slices/apiSlice";
import { ORDERS_URL, PAYPAL_URL } from "@/constants";

export const ordersApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createDraftOrder: builder.mutation({
      query: (order) => ({
        url: `${ORDERS_URL}/draft`,
        method: "POST",
        body: order,
      }),
    }),
    createOrder: builder.mutation({
      query: (order) => ({
        url: ORDERS_URL,
        method: "POST",
        body: order,
      }),
    }),

    getOrderDetails: builder.query({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),

    payOrder: builder.mutation({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: "PUT",
        body: details,
      }),
      invalidatesTags: ["Order"],
    }),

    getPaypalClientId: builder.query({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),

    getMyOrders: builder.query({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),

    getOrders: builder.query({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
      providesTags: ["Order"],
    }),

    updateOrderShipping: builder.mutation({
      query: ({ orderId, shippingAddress }) => ({
        url: `${ORDERS_URL}/${orderId}/shipping`,
        method: "PUT",
        body: shippingAddress,
      }),
      invalidatesTags: ["Order"],
    }),

    shipOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/ship`,
        method: 'PUT',
      }),
    }),

    deliverOrder: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: "PUT",
      }),
      invalidatesTags: ["Order"],
    }),

    createStripePaymentIntent: builder.mutation({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/stripe-payment-intent`,
        method: "POST",
      }),
    }),

    refundStripeOrder: builder.mutation({
      query: ({ orderId, reason }) => ({
        url: `${ORDERS_URL}/${orderId}/refund/stripe`,
        method: 'PUT',
        body: { reason },
      }),
    }),
  }),
});

export const {
  useCreateDraftOrderMutation,
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useUpdateOrderShippingMutation,
  useShipOrderMutation,
  useDeliverOrderMutation,
  useCreateStripePaymentIntentMutation,
  useRefundStripeOrderMutation,
} = ordersApiSlice;
