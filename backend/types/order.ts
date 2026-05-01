export type InventorySnapshotItem = {
  _id: string;
  price: number;
  sku?: string;
  inventoryId?: string;
};

export type OrderItemInput = {
  _id: string;
  name: string;
  qty: number;
  image: string;
};

export type OrderItem = OrderItemInput & {
  product: string;
  price: number;
  sku: string;
  inventoryId: string;
};

export type ShippingAddressDto = {
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

export type PriceSummary = {
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
};

export type CreateOrderDraftInput = {
  orderItems: OrderItem[];
  userId: string;
  shippingAddress: ShippingAddressDto;
  paymentMethod: string;
  prices: PriceSummary;
  inventorySnapshot?: InventorySnapshotItem[];
  fulfillmentChannel?: 'operator' | 'warehouse' | 'automation';
  operatorNote?: string;
};

export type OrderStatusHistoryItemDto = {
  status: string;
  note?: string;
  changedAt?: string;
};

export type OrderDetailsDto = {
  _id: string;
  createdAt: string;
  user: { _id: string; name: string; email: string; isAdmin?: boolean };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: string;
  paymentProvider?: 'paypal' | 'stripe';
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
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
  orderItems: OrderItem[];
  shippingAddress: ShippingAddressDto;
  paymentMethod: string;
  paymentProvider?: 'paypal' | 'stripe';
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
};

export type CreateOrderResponseDto = {
  _id: string;
};
