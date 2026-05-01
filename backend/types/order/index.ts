import type { PaymentMethod, PaymentProvider, PaymentResultDto } from '../payment';
import type { UserSummaryDto } from '../user';

export type OrderItemDto = {
  image: string;
  name: string;
  qty: number;
  price: number;
  product?: string;
};

export type ShippingAddressDto = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type OrderStatusHistoryItemDto = {
  status: string;
  note?: string;
  changedAt?: string;
};

export type OrderDetailsDto = {
  _id: string;
  createdAt: string;
  user: UserSummaryDto;
  orderItems: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: PaymentMethod | string;
  paymentProvider?: PaymentProvider;
  paymentResult?: PaymentResultDto;
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
  statusHistory: OrderStatusHistoryItemDto[];
};

export type CreateOrderInput = {
  orderItems: OrderItemDto[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: PaymentMethod | string;
  paymentProvider?: PaymentProvider;
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

export type CreateOrderResponseDto = {
  _id: string;
};
