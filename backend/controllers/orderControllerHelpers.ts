import Order from '../models/orderModel.ts';
import { buildOrderItemsFromSnapshot } from '../services/orderPricingService.ts';
import { calcPrices } from '../utils/calcPrices.ts';
import type { CreateOrderDraftInput } from '../types/order.ts';

type BuildOrderCreationPayloadInput = {
  orderItems: unknown[];
  inventorySnapshot?: unknown[];
  userId: string;
  shippingAddress: CreateOrderDraftInput['shippingAddress'];
  paymentMethod: string;
  fulfillmentChannel?: CreateOrderDraftInput['fulfillmentChannel'];
  operatorNote?: string;
};

type PaypalOrderLike = {
  id: string;
  status: string;
  update_time: string;
  payer: { email_address: string };
};

const buildOrderCreationPayload = ({
  orderItems,
  inventorySnapshot = [],
  userId,
  shippingAddress,
  paymentMethod,
  fulfillmentChannel = 'operator',
  operatorNote = '',
}: BuildOrderCreationPayloadInput) => {
  const dbOrderItems = buildOrderItemsFromSnapshot(
    orderItems as never[],
    inventorySnapshot as never[]
  );

  const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
    calcPrices(dbOrderItems);

  return {
    orderItems: dbOrderItems,
    user: userId,
    shippingAddress,
    paymentMethod,
    inventorySnapshot,
    fulfillmentChannel,
    operatorNote,
    itemsPrice: Number(itemsPrice),
    taxPrice: Number(taxPrice),
    shippingPrice: Number(shippingPrice),
    totalPrice: Number(totalPrice),
  };
};

const createOrderRecord = (orderPayload: Record<string, unknown>) => {
  return new Order({
    ...orderPayload,
    orderNumber: orderPayload.orderNumber,
    paymentStatus: 'pending',
    refundReason: '',
    auditTrail: [],
    fulfillmentStatus: 'pending',
    inventoryStatus: 'unreserved',
    refundStatus: 'none',
    statusHistory: [],
  });
};

const createPaymentPayload = (paypalOrder: PaypalOrderLike) => ({
  id: paypalOrder.id,
  status: paypalOrder.status,
  update_time: paypalOrder.update_time,
  email_address: paypalOrder.payer.email_address,
});

export { buildOrderCreationPayload, createOrderRecord, createPaymentPayload };
