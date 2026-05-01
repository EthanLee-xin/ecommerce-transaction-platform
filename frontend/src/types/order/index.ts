import type { PaymentMethod } from '../payment';
import type { UserSummary } from '../user';

export type OrderItem = {
  image: string;
  name: string;
  qty: number;
  price: number;
  product?: string;
};

export type ShippingAddress = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderStatusHistoryItem = {
  status: string;
  note?: string;
  changedAt?: string;
};

export type OrderDetails = {
  _id: string;
  createdAt: string;
  user: UserSummary;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod | string;
  paymentProvider?: 'paypal' | 'stripe';
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  fulfillmentStatus: string;
  inventoryStatus: string;
  refundStatus: string;
  statusHistory: OrderStatusHistoryItem[];
};

export type CreateOrderRequest = {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: PaymentMethod | string;
  paymentProvider?: 'paypal' | 'stripe';
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

export type CreateOrderResponse = {
  _id: string;
};
