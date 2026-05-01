import { apiSlice } from './apiSlice';
import { ORDERS_URL, PAYPAL_URL, STRIPE_URL } from '../config';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  OrderDetails,
  PaypalClientConfig,
  StripeConfig,
  StripeIntent,
} from '../types';

type OrderId = string;

type PayOrderArgs = {
  orderId: OrderId;
  details: unknown;
};

type StripeCreateIntentArgs = { orderId: string };
type StripeConfirmArgs = {
  orderId: string;
  paymentIntentId: string;
  paymentStatus: string;
};

export const orderApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createOrder: builder.mutation<CreateOrderResponse, CreateOrderRequest>({
      query: (order) => ({
        url: ORDERS_URL,
        method: 'POST',
        body: order,
      }),
    }),
    getOrderDetails: builder.query<OrderDetails, OrderId>({
      query: (id) => ({
        url: `${ORDERS_URL}/${id}`,
      }),
      keepUnusedDataFor: 5,
    }),
    payOrder: builder.mutation<OrderDetails, PayOrderArgs>({
      query: ({ orderId, details }) => ({
        url: `${ORDERS_URL}/${orderId}/pay`,
        method: 'PUT',
        body: details,
      }),
    }),
    getPaypalClientId: builder.query<PaypalClientConfig, void>({
      query: () => ({
        url: PAYPAL_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    getStripeConfig: builder.query<StripeConfig, void>({
      query: () => ({
        url: `${STRIPE_URL}/config`,
      }),
      keepUnusedDataFor: 5,
    }),
    createStripePaymentIntent: builder.mutation<StripeIntent, StripeCreateIntentArgs>({
      query: (body) => ({
        url: `${STRIPE_URL}/create-payment-intent`,
        method: 'POST',
        body,
      }),
    }),
    confirmStripePayment: builder.mutation<OrderDetails, StripeConfirmArgs>({
      query: (body) => ({
        url: `${STRIPE_URL}/confirm-payment`,
        method: 'POST',
        body,
      }),
    }),
    getMyOrders: builder.query<OrderDetails[], void>({
      query: () => ({
        url: `${ORDERS_URL}/mine`,
      }),
      keepUnusedDataFor: 5,
    }),
    getOrders: builder.query<OrderDetails[], void>({
      query: () => ({
        url: ORDERS_URL,
      }),
      keepUnusedDataFor: 5,
    }),
    deliverOrder: builder.mutation<OrderDetails, OrderId>({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/deliver`,
        method: 'PUT',
      }),
    }),
    refundOrder: builder.mutation<OrderDetails, OrderId>({
      query: (orderId) => ({
        url: `${ORDERS_URL}/${orderId}/refund`,
        method: 'PUT',
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useGetOrderDetailsQuery,
  usePayOrderMutation,
  useGetPaypalClientIdQuery,
  useGetStripeConfigQuery,
  useCreateStripePaymentIntentMutation,
  useConfirmStripePaymentMutation,
  useGetMyOrdersQuery,
  useGetOrdersQuery,
  useDeliverOrderMutation,
  useRefundOrderMutation,
} = orderApiSlice;
